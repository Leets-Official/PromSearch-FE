"use client";

// EditableAvatar 의 onEdit 핸들러를 넘기기 위해 클라이언트 컴포넌트
// (button-section / selection-section 과 동일한 처리)

import { HelpIcon, PencilIcon } from "@/components/ui/icons";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ContentTypeTag } from "@/components/ui/content-type-tag";
import { EditableAvatar } from "@/components/ui/editable-avatar";
import { PromptCard } from "@/components/ui/prompt-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Thumbnail } from "@/components/ui/thumbnail";

import { SpecCell, SpecGroup, SpecSection } from "./spec";

/**
 * Data Display 스펙 시트 (Figma Data Display 섹션 309:1875).
 * Tag · Card/Info · Card/Profile · Card/Prompt · Table · thumbnail · Profile(Avatar).
 */

const PROMPT_TAGS = ["직군", "AI모델", "태스크", "결과물 타입"];

/** Card/Profile 시안의 관심사 태그 — 온보딩에서 고른 직군 + 태스크 */
const PROFILE_TAGS = ["직장인", "기획자", "PPT", "이메일", "이미지 생성"];

export function DataDisplaySection() {
  return (
    <SpecSection id="data" label="Data Display">
      {/* Tag */}
      <SpecGroup title="Tag">
        <Badge>Placeholder</Badge>
      </SpecGroup>

      {/* Tag/Content Type — Figma 1006:2314 */}
      <SpecGroup title="Tag / Content Type">
        <SpecCell label="image">
          <ContentTypeTag type="image" />
        </SpecCell>
        <SpecCell label="text">
          <ContentTypeTag type="text" />
        </SpecCell>
      </SpecGroup>

      {/* Card/Info */}
      <SpecGroup title="Card / Info">
        <Card className="w-52 gap-2">
          <span className="flex items-center gap-1 text-title-3 text-text-secondary">
            보유 포인트 <HelpIcon className="size-4 text-text-disabled" />
          </span>
          <span className="text-heading-1 text-text-primary">
            1,000 <span className="text-title-2 text-text-secondary">P</span>
          </span>
        </Card>
      </SpecGroup>

      {/* Card/Profile — 이메일 대신 관심사(직군·태스크) 태그 행 + 우상단 편집 (Figma 271:1323) */}
      <SpecGroup title="Card / Profile">
        <Card className="relative w-full max-w-md flex-row items-center gap-4">
          <Avatar size="lg">
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col gap-2">
            <span className="text-heading-2 text-text-primary">Username</span>
            <div className="flex flex-wrap gap-1">
              {PROFILE_TAGS.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          </div>
          <Button
            variant="plain"
            size="icon-sm"
            aria-label="프로필 수정"
            className="absolute top-4 right-4"
          >
            <PencilIcon />
          </Button>
        </Card>
      </SpecGroup>

      {/* Card/Prompt — 썸네일 우하단 결과물타입 배지 + 작성자 노출 (Figma 209:3690) */}
      <SpecGroup title="Card / Prompt">
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
          {(["image", "text", "image"] as const).map((type, i) => (
            <PromptCard
              key={i}
              title="프롬프트 제목을 쓰는 곳입니다"
              tags={PROMPT_TAGS}
              author={{ name: "작성자이름" }}
              badge={<ContentTypeTag type={type} />}
            />
          ))}
        </div>
      </SpecGroup>

      {/* Table */}
      <SpecGroup title="Table">
        <Table className="max-w-md">
          <TableHeader>
            <TableRow>
              <TableHead>Header</TableHead>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
              <TableCell>Cell</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Cell</TableCell>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </SpecGroup>

      {/* thumbnail · Profile(Avatar) */}
      <SpecGroup title="thumbnail · Profile">
        <SpecCell label="thumbnail (16:9)" className="items-start">
          <Thumbnail className="w-72" />
        </SpecCell>
        <SpecCell label="sm">
          <Avatar size="sm">
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </SpecCell>
        <SpecCell label="md">
          <Avatar size="md">
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </SpecCell>
        <SpecCell label="lg">
          <Avatar size="lg">
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </SpecCell>
        <SpecCell label="xl">
          <Avatar size="xl">
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </SpecCell>
      </SpecGroup>

      {/* Profile(편집) — Figma 1315:6084 */}
      <SpecGroup title="Profile (편집 가능, 80px)">
        <SpecCell label="placeholder">
          <EditableAvatar onEdit={() => console.log("edit profile image")} />
        </SpecCell>
        <SpecCell label="image">
          <EditableAvatar
            src="https://i.pravatar.cc/160?img=12"
            alt="프로필 사진"
            onEdit={() => console.log("edit profile image")}
          />
        </SpecCell>
        <SpecCell label="편집 없음">
          <EditableAvatar />
        </SpecCell>
      </SpecGroup>
    </SpecSection>
  );
}
