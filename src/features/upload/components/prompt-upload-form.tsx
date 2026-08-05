"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, type DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PencilIcon, SaveIcon } from "@/components/ui/icons";

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

  // 진입 시 임시저장이 있으면 모달을 띄운다. effect 없이 파생 상태로 계산:
  // 드래프트가 존재하고(비동기 로드 완료) 아직 사용자가 선택하지 않았으면 열림.
  const draft = draftQuery.data?.draft ?? null;
  const [decided, setDecided] = React.useState(false);
  const modalOpen = Boolean(draft) && !decided;

  const handleLoadDraft = () => {
    if (draft) reset(draftToValues(draft));
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

  // 임시저장 — 부분 작성 허용(전체 검증 없이 현재 값 저장)
  const handleTempSave = () => {
    saveDraft.mutate(getValues());
  };

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
              required
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
          {createPrompt.isError ? (
            <p className="text-body-3 text-red-500">
              게시에 실패했어요. 잠시 후 다시 시도해주세요.
            </p>
          ) : saveDraft.isSuccess ? (
            <p className="text-body-3 text-text-secondary">임시저장되었어요.</p>
          ) : null}
          <div className="flex gap-2 sm:gap-4">
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={handleTempSave}
              disabled={saveDraft.isPending}
            >
              {saveDraft.isPending ? <Spinner className="h-5 w-14" /> : <SaveIcon />}
              임시저장
            </Button>
            <Button type="submit" variant="brand" size="lg" disabled={createPrompt.isPending}>
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
        savedAt={draft?.updatedAt}
        discarding={deleteDraft.isPending}
      />
    </div>
  );
}

export { PromptUploadForm };
