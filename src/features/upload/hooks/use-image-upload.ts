"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  completeUpload,
  fetchImageStatuses,
  isTerminal,
  issueUploadUrls,
  MAX_UPLOAD_BATCH,
  POLL_INTERVAL_MS,
  POLL_TIMEOUT_MS,
  putToS3,
  readImageSize,
} from "../api/image";
import type { ApiImageStatus } from "../api/dto";
import type { PromptImageValue } from "../schema";

/** 결과물 이미지 최대 장수 */
export const MAX_IMAGES = MAX_UPLOAD_BATCH;

const STATUS_BY_API: Record<ApiImageStatus, PromptImageValue["status"]> = {
  UPLOADING: "uploading",
  UPLOADED: "processing",
  PROCESSING: "processing",
  READY: "ready",
  FAILED: "failed",
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type UseImageUploadOptions = {
  /** 현재 폼에 들어 있는 이미지들 */
  value: PromptImageValue[];
  /** 폼 값 갱신 — 업로드 진행에 따라 여러 번 불린다 */
  onChange: (next: PromptImageValue[]) => void;
};

/**
 * 결과물 이미지 업로드 오케스트레이션.
 *
 * ```
 * 파일 선택 → URL 발급 → S3 PUT → complete → 상태 폴링(READY/FAILED) → 완료
 * ```
 *
 * 각 단계마다 폼 값을 갱신해 타일이 "업로드 중 → 처리 중 → 완료"로 바뀐다.
 * 폴링은 아직 최종 상태가 아닌 이미지들만 **한 번에 묶어** 조회한다(상태 API 가 배치 조회다).
 *
 * 실패한 이미지는 목록에 `failed` 로 남겨 사용자가 지우고 다시 올릴 수 있게 한다.
 * (조용히 사라지면 왜 안 올라갔는지 알 수 없다)
 */
export function useImageUpload({ value, onChange }: UseImageUploadOptions) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 진행 중 콜백이 항상 최신 목록을 보도록 ref 에 들고 있는다.
   *
   * 업로드는 발급 → PUT → complete → 폴링으로 여러 틱에 걸쳐 진행되는데, 그동안 클로저가 잡은
   * `value` 는 낡는다. 우리가 갱신할 때는 ref 를 직접 쓰고, 폼 쪽에서 값이 바뀌는 경우
   * (임시저장 불러오기·초기화)는 effect 로 따라간다. (렌더 중 ref 쓰기는 금지)
   */
  const latest = useRef(value);
  useEffect(() => {
    latest.current = value;
  }, [value]);

  const patch = useCallback(
    (imageId: string, next: Partial<PromptImageValue>) => {
      const updated = latest.current.map((image) =>
        image.imageId === imageId ? { ...image, ...next } : image,
      );
      latest.current = updated;
      onChange(updated);
    },
    [onChange],
  );

  /** 아직 처리 중인 이미지들이 최종 상태가 될 때까지 폴링 */
  const poll = useCallback(
    async (imageIds: string[]) => {
      const deadline = Date.now() + POLL_TIMEOUT_MS;
      let pending = [...imageIds];

      while (pending.length > 0 && Date.now() < deadline) {
        await sleep(POLL_INTERVAL_MS);

        const result = await fetchImageStatuses(pending);
        const stillPending: string[] = [];

        for (const image of result.images) {
          patch(image.imageId, { status: STATUS_BY_API[image.status] ?? "processing" });
          if (!isTerminal(image.status)) stillPending.push(image.imageId);
        }
        pending = stillPending;
      }

      // 시간 초과 — 서버는 계속 처리 중일 수 있지만 화면은 더 기다리지 않는다.
      pending.forEach((imageId) => patch(imageId, { status: "failed" }));
      if (pending.length > 0) {
        setError("이미지 처리가 오래 걸려요. 잠시 후 다시 시도해 주세요.");
      }
    },
    [patch],
  );

  const addFiles = useCallback(
    async (fileList: FileList | null) => {
      const files = Array.from(fileList ?? []).filter((file) => file.type.startsWith("image/"));
      if (files.length === 0) return;

      const room = MAX_IMAGES - latest.current.length;
      if (room <= 0) return;
      const targets = files.slice(0, room);

      setIsUploading(true);
      setError(null);

      try {
        // 1. 발급 — 픽셀 크기까지 서버가 요구하므로 파일에서 먼저 읽는다.
        const metas = await Promise.all(
          targets.map(async (file) => ({
            file,
            ...(await readImageSize(file)),
          })),
        );
        const issued = await issueUploadUrls(
          metas.map(({ file, width, height }) => ({
            fileName: file.name,
            contentType: file.type,
            fileSize: file.size,
            width,
            height,
          })),
        );

        // 발급 결과는 요청 순서와 1:1 로 대응한다.
        const pairs = issued.images.map((image, index) => ({ ...image, file: metas[index].file }));

        // 타일을 먼저 붙여 "업로드 중"을 보여준다(미리보기는 로컬 파일로).
        const added: PromptImageValue[] = pairs.map(({ imageId, file }) => ({
          imageId,
          previewUrl: URL.createObjectURL(file),
          status: "uploading",
        }));
        latest.current = [...latest.current, ...added];
        onChange(latest.current);

        // 2~3. S3 직접 업로드 → 완료 검증. 장별로 독립이라 병렬 처리한다.
        const uploaded = await Promise.all(
          pairs.map(async ({ imageId, uploadUrl, file }) => {
            try {
              await putToS3(uploadUrl, file);
              await completeUpload(imageId);
              patch(imageId, { status: "processing" });
              return imageId;
            } catch {
              patch(imageId, { status: "failed" });
              return null;
            }
          }),
        );

        const succeeded = uploaded.filter((id): id is string => id !== null);
        if (succeeded.length < pairs.length) {
          setError("일부 이미지를 업로드하지 못했어요. 실패한 이미지를 지우고 다시 시도해 주세요.");
        }

        // 4. 워터마크 처리 대기
        if (succeeded.length > 0) await poll(succeeded);
      } catch (e) {
        setError(e instanceof Error ? e.message : "이미지 업로드에 실패했어요.");
      } finally {
        setIsUploading(false);
      }
    },
    [onChange, patch, poll],
  );

  const removeAt = useCallback(
    (index: number) => {
      const target = latest.current[index];
      // objectURL 은 명시적으로 해제해야 메모리에서 사라진다.
      if (target?.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(target.previewUrl);

      const updated = latest.current.filter((_, i) => i !== index);
      latest.current = updated;
      onChange(updated);
    },
    [onChange],
  );

  return { addFiles, removeAt, isUploading, error };
}
