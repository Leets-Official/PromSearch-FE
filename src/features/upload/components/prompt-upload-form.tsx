"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch, type DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PencilIcon, SaveIcon } from "@/components/ui/icons";
import { getErrorMessage } from "@/lib/api";

import { MobilePageHeader } from "@/components/layout/mobile-page-header";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { TextField } from "@/components/ui/text-field";
import { Textarea } from "@/components/ui/textarea";
import {
  SegmentedControl,
  SegmentedControlItem,
  SegmentedControlList,
} from "@/components/ui/segmented-control";

import { MODEL_ETC_NAME_MAX, promptFormSchema, TITLE_MAX } from "../schema";
import type { PromptDraft, PromptFormValues } from "../types";
import { AI_MODELS, CONTENT_TIER_OPTIONS, JOB_CATEGORIES, OUTPUT_TYPES, TASKS } from "../options";
import { usePromptDraft } from "../hooks/use-prompt-draft";
import { useSaveDraft } from "../hooks/use-save-draft";
import { useDeleteDraft } from "../hooks/use-delete-draft";
import { useCreatePrompt } from "../hooks/use-create-prompt";
import { ChipGroupField } from "./chip-group-field";
import { OutputImageUploader } from "./output-image-uploader";
import { DraftPromptModal } from "./draft-prompt-modal";

/** 배열 토글(있으면 제거, 없으면 추가) */
function toggle<T>(arr: readonly T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

/**
 * 폼 기본값. 단일 선택(outputType·model)은 **미선택** 상태로 시작하므로 기본값에 넣지 않는다
 * (선택 강제 = 검증에서 필수). 나머지는 빈 값으로 시작.
 */
/** "임시저장되었어요" 문구가 떠 있는 시간(ms). 읽을 만큼만 보여 주고 걷는다. */
const TEMP_SAVE_NOTICE_MS = 3000;

const DEFAULT_VALUES: DefaultValues<PromptFormValues> = {
  title: "",
  description: "",
  jobCategories: [],
  tasks: [],
  modelEtcName: "",
  tier: "free",
  body: "",
  images: [],
};

/** 드래프트 → 폼 값(저장 시각 제외). 초안은 부분 작성이라 미입력 필드는 undefined 로 흐른다. */
function draftToValues(draft: PromptDraft): DefaultValues<PromptFormValues> {
  return {
    title: draft.title,
    description: draft.description,
    outputType: draft.outputType,
    jobCategories: draft.jobCategories,
    tasks: draft.tasks,
    model: draft.model,
    modelEtcName: draft.modelEtcName,
    tier: draft.tier,
    body: draft.body,
    images: draft.images,
  };
}

/**
 * 프롬프트 업로드 폼.
 * - 제목만 글자 수 제한(100자). 결과물·AI모델은 단일 선택, 직군/태스크는 복수 선택.
 * - 진입 시 임시저장이 있으면 모달로 불러오기/새로작성 선택.
 * - 임시저장(부분 허용) / 게시하기(전체 검증) 분리.
 */
function PromptUploadForm() {
  const router = useRouter();

  const draftQuery = usePromptDraft();
  const saveDraft = useSaveDraft();
  const deleteDraft = useDeleteDraft();
  const createPrompt = useCreatePrompt();

  const { control, handleSubmit, reset, getValues, setValue } = useForm<PromptFormValues>({
    resolver: zodResolver(promptFormSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "onChange",
  });

  /*
    "임시저장된 글이 있어요" 모달은 **이 화면에 들어온 순간의 임시저장**만 본다.

    라이브 쿼리(draftQuery.data)를 그대로 보면, 임시저장 버튼을 눌러 성공한 직후
    쿼리가 무효화되며 draft 가 새로 생기고 → 방금 내가 저장한 글을 두고
    "불러오시겠어요?" 를 되묻는다. 진입 시점 값을 한 번만 붙잡아 둔다.

    `undefined` = 아직 로딩 중(판단 보류), `null` = 임시저장 없음.
    effect 가 아니라 렌더 중 조정이라 한 번 그린 뒤 다시 그리는 낭비가 없다.
  */
  const [entryDraft, setEntryDraft] = React.useState<PromptDraft | null | undefined>(undefined);
  if (entryDraft === undefined && draftQuery.isSuccess) {
    setEntryDraft(draftQuery.data?.draft ?? null);
  }
  const [decided, setDecided] = React.useState(false);
  const modalOpen = Boolean(entryDraft) && !decided;

  const handleLoadDraft = () => {
    if (entryDraft) reset(draftToValues(entryDraft));
    setDecided(true);
  };

  const handleDiscardDraft = () => {
    deleteDraft.mutate(undefined, {
      onSuccess: () => {
        reset(DEFAULT_VALUES);
        setDecided(true);
      },
    });
  };

  /*
    이미지가 READY 가 아닌 동안에는 저장·게시를 막는다.

    안 막으면 그 상태로 요청이 나가고 서버가
    `IMAGE-0xx 워터마크 처리가 완료되지 않은 이미지입니다.` 로 거절한다 — 사용자는
    자기가 뭘 잘못했는지 알 수 없다. 준비되지 않은 버튼은 애초에 못 누르게 하는 편이 낫다.

    **실패(failed)도 함께 막아야 한다.** 진행 중인 것만 막으면, 폴링이 타임아웃돼 이미지가
    failed 로 떨어지는 순간 버튼이 되살아난다. 그때 누른 임시저장이 워터마크가 없는 imageId 를
    초안에 심어, 다음 복원에서 상태 조회를 통째로 실패시켰다(오염된 한 장이 전부를 망친다).

    진행 중과 실패는 사용자가 할 일이 다르므로(기다린다 / 지우고 다시 올린다) 안내도 나눈다.
  */
  const images = useWatch({ control, name: "images" });
  const imagesPending = (images ?? []).some(
    (image) => image.status === "uploading" || image.status === "processing",
  );
  const imagesFailed = (images ?? []).some((image) => image.status === "failed");
  const imagesBusy = imagesPending || imagesFailed;

  // 임시저장 — 부분 작성 허용(전체 검증 없이 현재 값 저장)
  const handleTempSave = () => {
    saveDraft.mutate(getValues());
  };

  /*
    "임시저장되었어요" 는 **잠깐 보이고 사라지는** 알림이다.
    mutation 의 isSuccess 는 다음 요청까지 계속 true 라, 그대로 두면 문구가 화면에 눌러앉는다.
    성공 후 일정 시간이 지나면 mutation 상태를 되돌려 문구를 걷어낸다.
  */
  const saveDraftReset = saveDraft.reset;
  React.useEffect(() => {
    if (!saveDraft.isSuccess) return;
    const timer = setTimeout(saveDraftReset, TEMP_SAVE_NOTICE_MS);
    return () => clearTimeout(timer);
  }, [saveDraft.isSuccess, saveDraftReset]);

  // 게시 — 전체 검증 통과 시. 성공하면 임시저장 정리 후 상세로 이동
  const onSubmit = (values: PromptFormValues) => {
    createPrompt.mutate(values, {
      onSuccess: (res) => {
        deleteDraft.mutate();
        router.push(`/prompts/${res.id}`);
      },
    });
  };

  return (
    <div className="flex w-full max-w-160 flex-col gap-6 sm:gap-8">
      {/* 모바일 시안(1360:8945)은 상단바 대신 뒤로가기 헤더 */}
      <MobilePageHeader className="mb-0" />

      <h1 className="text-heading-1 text-text-primary">프롬프트 업로드</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 sm:gap-8">
        {/* 제목 — 유일한 글자 수 제한(100자) */}
        <Controller
          control={control}
          name="title"
          render={({ field, fieldState }) => (
            <TextField
              title="제목"
              // 필수 표기(*)를 붙이지 않는다 — 이 폼은 사실상 전 항목이 필수라
              // 제목에만 별표가 붙으면 "여기만 필수"로 잘못 읽힌다(디자인 QA).
              // 검증은 그대로 zod 스키마가 담당한다.
              placeholder="제목을 입력해주세요."
              maxLength={TITLE_MAX}
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={field.onBlur}
              state={fieldState.error ? "error" : "default"}
              caption={fieldState.error?.message}
            />
          )}
        />

        {/* 프롬프트 설명 */}
        <Controller
          control={control}
          name="description"
          render={({ field, fieldState }) => (
            <label className="flex w-full flex-col gap-2">
              <span className="text-title-1 text-text-primary">프롬프트 설명</span>
              <Textarea
                placeholder="프롬프트에 대한 설명을 입력해주세요."
                className="min-h-42"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                aria-invalid={fieldState.error ? true : undefined}
              />
              {fieldState.error ? (
                <span className="text-body-3 text-red-500">{fieldState.error.message}</span>
              ) : null}
            </label>
          )}
        />

        {/* 결과물 — 단일 선택 */}
        <Controller
          control={control}
          name="outputType"
          render={({ field, fieldState }) => (
            <ChipGroupField
              label="결과물"
              options={OUTPUT_TYPES}
              selected={field.value ? [field.value] : []}
              // 필수 단일 선택 — 해제 없이 선택만
              onToggle={(v) => field.onChange(v)}
              error={fieldState.error?.message}
            />
          )}
        />

        {/* 직군 — 복수 선택(최소 1개) */}
        <Controller
          control={control}
          name="jobCategories"
          render={({ field, fieldState }) => (
            <ChipGroupField
              label="직군"
              hint="복수선택이 가능해요."
              options={JOB_CATEGORIES}
              selected={field.value}
              onToggle={(v) => field.onChange(toggle(field.value, v))}
              error={fieldState.error?.message}
            />
          )}
        />

        {/* 태스크 — 복수 선택(최소 1개) */}
        <Controller
          control={control}
          name="tasks"
          render={({ field, fieldState }) => (
            <ChipGroupField
              label="태스크"
              hint="복수선택이 가능해요."
              options={TASKS}
              selected={field.value}
              onToggle={(v) => field.onChange(toggle(field.value, v))}
              error={fieldState.error?.message}
            />
          )}
        />

        {/* AI 모델 — 단일 선택. 기타 선택 시 자유 입력 */}
        <Controller
          control={control}
          name="model"
          render={({ field, fieldState }) => (
            <div className="flex w-full flex-col gap-3">
              <ChipGroupField
                label="AI 모델"
                // 직군/태스크의 "복수선택이 가능해요."와 짝을 이뤄 단일 선택임을 알린다
                hint="한 가지만 선택할 수 있어요."
                options={AI_MODELS}
                selected={field.value ? [field.value] : []}
                // 필수 단일 선택 — 선택만. 기타가 아니면 자유 입력값 정리
                onToggle={(v) => {
                  field.onChange(v);
                  if (v !== "etc") setValue("modelEtcName", "");
                }}
                error={fieldState.error?.message}
              />
              {field.value === "etc" ? (
                <Controller
                  control={control}
                  name="modelEtcName"
                  render={({ field: etcField, fieldState }) => (
                    <div className="flex flex-col gap-1">
                      {/* 예시를 하나만 보여줘 "모델 하나"를 적는 칸임을 드러낸다.
                          입력값은 쪼개지 않고 그대로 저장되므로(BE `customAiModel` 단수),
                          여러 개를 나열하면 그 문자열이 통째로 모델명이 된다. */}
                      <Input
                        placeholder="예: GPT 4.1 Mini"
                        maxLength={MODEL_ETC_NAME_MAX}
                        value={etcField.value}
                        onChange={etcField.onChange}
                        onBlur={etcField.onBlur}
                        aria-invalid={fieldState.error ? true : undefined}
                      />
                      {fieldState.error ? (
                        <span className="text-body-3 text-red-500">{fieldState.error.message}</span>
                      ) : (
                        <span className="text-body-3 text-text-secondary">
                          사용한 AI 모델명을 하나만 입력해주세요.
                        </span>
                      )}
                    </div>
                  )}
                />
              ) : null}
            </div>
          )}
        />

        {/* 콘텐츠 타입 — 세그먼트(단일) */}
        <Controller
          control={control}
          name="tier"
          render={({ field }) => (
            <div className="flex w-full flex-col gap-3">
              <span className="text-title-1 text-text-primary">콘텐츠 타입</span>
              <SegmentedControl value={field.value} onValueChange={field.onChange}>
                <SegmentedControlList>
                  {CONTENT_TIER_OPTIONS.map((opt) => (
                    <SegmentedControlItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SegmentedControlItem>
                  ))}
                </SegmentedControlList>
              </SegmentedControl>
            </div>
          )}
        />

        {/* 프롬프트 본문 */}
        <Controller
          control={control}
          name="body"
          render={({ field, fieldState }) => (
            <label className="flex w-full flex-col gap-2">
              <span className="text-title-1 text-text-primary">프롬프트 본문</span>
              <Textarea
                placeholder="프롬프트 전문을 입력해주세요."
                className="min-h-42"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                aria-invalid={fieldState.error ? true : undefined}
              />
              {fieldState.error ? (
                <span className="text-body-3 text-red-500">{fieldState.error.message}</span>
              ) : null}
            </label>
          )}
        />

        {/* 결과물 이미지 — 최소 1장 */}
        <Controller
          control={control}
          name="images"
          render={({ field, fieldState }) => (
            <OutputImageUploader
              label="결과물 이미지"
              hint="프롬프트로 생성한 결과물의 이미지를 첨부해주세요. 호버하면 삭제할 수 있어요."
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />

        {/* 하단 안내 + 액션 */}
        <div className="flex flex-col items-center gap-4">
          <p className="text-title-2 text-text-brand">
            ‘게시하기’를 누르면 작성하신 프롬프트가 즉시 등록됩니다.
          </p>
          {/*
            피드백 우선순위: 실패 > 진행 중 안내 > 성공.
            실패는 **서버 문구를 그대로** 보여 준다 — "이미 등록된 프롬프트입니다",
            "워터마크 처리가 완료되지 않은 이미지입니다" 처럼 무엇을 고쳐야 하는지가
            거기 담겨 있는데, 뭉뚱그린 안내로 덮으면 그 정보가 사라진다.
          */}
          {createPrompt.isError || saveDraft.isError ? (
            <p role="alert" className="text-body-3 text-red-500">
              {getErrorMessage(createPrompt.error ?? saveDraft.error)}
            </p>
          ) : imagesPending ? (
            <p className="text-body-3 text-text-secondary">
              이미지 처리가 끝나면 저장하거나 게시할 수 있어요.
            </p>
          ) : imagesFailed ? (
            /* 실패는 기다린다고 풀리지 않는다 — 지우고 다시 올려야 한다고 명시한다 */
            <p role="alert" className="text-body-3 text-red-500">
              실패한 이미지를 삭제한 뒤에 저장하거나 게시할 수 있어요.
            </p>
          ) : saveDraft.isSuccess ? (
            <p role="status" className="text-body-3 text-text-secondary">
              임시저장되었어요.
            </p>
          ) : null}
          <div className="flex gap-2 sm:gap-4">
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={handleTempSave}
              /*
                두 버튼은 **서로를 막는다.** 같은 폼 값을 두 요청이 동시에 들고 나가면
                (임시저장 in-flight 중 게시) 초안이 지워진 뒤 저장이 도착해 유령 초안이 남거나,
                반대로 방금 게시한 내용이 초안으로 되살아난다.
              */
              disabled={saveDraft.isPending || createPrompt.isPending || imagesBusy}
            >
              {saveDraft.isPending ? <Spinner className="h-5 w-14" /> : <SaveIcon />}
              임시저장
            </Button>
            <Button
              type="submit"
              variant="brand"
              size="lg"
              disabled={createPrompt.isPending || saveDraft.isPending || imagesBusy}
            >
              {createPrompt.isPending ? <Spinner className="h-5 w-14" /> : <PencilIcon />}
              게시하기
            </Button>
          </div>
        </div>
      </form>

      <DraftPromptModal
        open={modalOpen}
        onOpenChange={(open) => {
          // esc/오버레이로 닫으면 결정한 것으로 간주(임시저장은 그대로 유지)
          if (!open) setDecided(true);
        }}
        onLoad={handleLoadDraft}
        onDiscard={handleDiscardDraft}
        savedAt={entryDraft?.updatedAt}
        discarding={deleteDraft.isPending}
      />
    </div>
  );
}

export { PromptUploadForm };
