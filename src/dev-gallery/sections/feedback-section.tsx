"use client";

import { Button } from "@/components/ui/button";
import { ImageFallback } from "@/components/ui/image-fallback";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";

import { SpecCell, SpecGroup, SpecSection } from "./spec";

/**
 * Spinner — 로딩 표시(디자이너 Lottie). 색은 JSON 에 브랜드로 박혀 있어 크기만 조절한다.
 * (Badge=Tag 는 Data Display, 아이콘은 Icon 섹션 참고)
 */
export function FeedbackSection() {
  const { toastSuccess, toastError } = useToast();

  return (
    <>
      <SpecSection id="feedback-spinner" label="Spinner">
        <SpecGroup title="size">
          <SpecCell label="기본 (h-4 w-13)">
            <Spinner />
          </SpecCell>
          <SpecCell label="h-6 w-20">
            <Spinner className="h-6 w-20" />
          </SpecCell>
          <SpecCell label="h-8 w-26">
            <Spinner className="h-8 w-26" />
          </SpecCell>
        </SpecGroup>
      </SpecSection>

      {/* 시안이 없어 기존 토큰으로 조립한 컴포넌트라, 실제 화면에서 눈으로 확인하려고 여기 둔다. */}
      <SpecSection id="feedback-toast" label="Toast">
        <SpecGroup title="tone (하단 중앙에 뜬다 · 3초 후 사라짐 · 눌러서 즉시 닫기)">
          <Button variant="brand" onClick={() => toastSuccess("북마크했어요.")}>
            성공 토스트
          </Button>
          <Button variant="neutral" onClick={() => toastError("이미 신고한 대상입니다.")}>
            실패 토스트
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              toastSuccess("신고가 접수됐어요. 검토 후 조치할게요.");
              toastError("포인트가 부족해요.");
              toastSuccess("복사했어요.");
            }}
          >
            여러 개 겹쳐 보기
          </Button>
        </SpecGroup>
      </SpecSection>

      <SpecSection id="feedback-image-fallback" label="Image Fallback">
        <SpecGroup title="이미지 로드 실패 시 대체 표시(presigned URL 403 등)">
          <div className="h-32 w-56 overflow-hidden rounded-md">
            <ImageFallback />
          </div>
          <div className="size-24 overflow-hidden rounded-md">
            <ImageFallback compact />
          </div>
        </SpecGroup>
      </SpecSection>
    </>
  );
}
