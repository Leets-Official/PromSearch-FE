import type { JSX } from "react";

import {
  AlertIcon,
  ArrowExpandIcon,
  ArrowUpIcon,
  BellAlertIcon,
  BellIcon,
  BookmarkFilledIcon,
  BookmarkIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  CommentIcon,
  CopyIcon,
  CrownIcon,
  FlagIcon,
  GoogleIcon,
  HeartFilledIcon,
  HeartIcon,
  HelpIcon,
  HomeIcon,
  type IconProps,
  ImageIcon,
  KakaoIcon,
  LockIcon,
  MenuIcon,
  MoreIcon,
  PencilIcon,
  SaveIcon,
  SearchIcon,
  SettingIcon,
  TextIcon,
  UserIcon,
  XIcon,
} from "@/components/ui/icons";

import { SpecGroup, SpecSection } from "./spec";

/**
 * Icon 스펙 시트 (Figma Icon 섹션 309:1900, 총 33종).
 * 시안 SVG 를 그대로 인라인한 `@/components/ui/icons` 세트를 그립니다
 * (외부 아이콘 라이브러리로 "비슷한 모양"을 대체하지 않습니다).
 * bookmark / heart 는 outline·fill 이 서로 다른 벡터라 각각 별도 컴포넌트입니다.
 */

type IconEntry = {
  /** Figma 의 icon= 변형 이름 */
  name: string;
  Icon: (props: IconProps) => JSX.Element;
};

const ICONS: IconEntry[] = [
  { name: "lock", Icon: LockIcon },
  { name: "x", Icon: XIcon },
  { name: "pencil", Icon: PencilIcon },
  { name: "chevron-left", Icon: ChevronLeftIcon },
  { name: "chevron-right", Icon: ChevronRightIcon },
  { name: "chevron-up", Icon: ChevronUpIcon },
  { name: "chevron-down", Icon: ChevronDownIcon },
  { name: "check", Icon: CheckIcon },
  { name: "alert", Icon: AlertIcon },
  { name: "bell", Icon: BellIcon },
  { name: "bell-alert", Icon: BellAlertIcon },
  { name: "search", Icon: SearchIcon },
  { name: "home", Icon: HomeIcon },
  { name: "setting", Icon: SettingIcon },
  { name: "help", Icon: HelpIcon },
  { name: "crown", Icon: CrownIcon },
  { name: "image", Icon: ImageIcon },
  { name: "menu", Icon: MenuIcon },
  { name: "copy", Icon: CopyIcon },
  { name: "more", Icon: MoreIcon },
  { name: "user", Icon: UserIcon },
  { name: "save", Icon: SaveIcon },
  { name: "bookmark-outline", Icon: BookmarkIcon },
  { name: "bookmark", Icon: BookmarkFilledIcon },
  { name: "heart-outline", Icon: HeartIcon },
  { name: "heart", Icon: HeartFilledIcon },
  { name: "flag", Icon: FlagIcon },
  { name: "text", Icon: TextIcon },
  { name: "arrow-up", Icon: ArrowUpIcon },
  { name: "arrow-expand", Icon: ArrowExpandIcon },
  { name: "comment", Icon: CommentIcon },
];

export function IconSection() {
  return (
    <SpecSection id="icon" label="Icon">
      <SpecGroup title="디자인 시스템 아이콘 (24px)">
        <div className="grid grid-cols-4 gap-x-6 gap-y-5 sm:grid-cols-6">
          {ICONS.map(({ name, Icon }) => (
            <div key={name} className="flex flex-col items-center gap-1.5">
              <Icon className="size-6 text-text-primary" />
              <span className="text-caption-1 text-text-disabled">{name}</span>
            </div>
          ))}
        </div>
      </SpecGroup>

      {/* 브랜드 로고 — 플랫폼 규정색이라 currentColor 를 따르지 않는다 */}
      <SpecGroup title="브랜드 로고 (18px)">
        <div className="flex flex-wrap gap-6">
          <div className="flex flex-col items-center gap-1.5">
            <GoogleIcon className="size-6" />
            <span className="text-caption-1 text-text-disabled">Google</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <KakaoIcon className="size-6 text-black" />
            <span className="text-caption-1 text-text-disabled">Kakao</span>
          </div>
        </div>
      </SpecGroup>
    </SpecSection>
  );
}
