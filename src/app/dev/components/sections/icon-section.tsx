import {
  ArrowUpIcon,
  BellDotIcon,
  BellIcon,
  BookmarkIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  CircleAlertIcon,
  CircleHelpIcon,
  CopyIcon,
  CrownIcon,
  EllipsisVerticalIcon,
  FileCheckIcon,
  FlagIcon,
  HeartIcon,
  HomeIcon,
  ImageIcon,
  type LucideIcon,
  LockIcon,
  Maximize2Icon,
  MenuIcon,
  MessageCircleMoreIcon,
  PencilIcon,
  SearchIcon,
  SettingsIcon,
  TypeIcon,
  UserIcon,
  XIcon,
} from "lucide-react";

import { GoogleIcon, KakaoIcon } from "@/components/ui/brand-icons";

import { SpecGroup, SpecSection } from "./spec";

/**
 * Icon 스펙 시트 (Figma Icon 섹션 309:1900, 총 33종).
 * 디자이너 아이콘 세트를 lucide-react 로 1:1 매핑(별도 아이콘 컴포넌트 없이 사용).
 * 예외 2종:
 * - Google / Kakao 는 브랜드 규정 로고라 lucide 대신 @/components/ui/brand-icons 사용.
 * - bookmark / heart 는 outline·fill 쌍이라 같은 lucide 아이콘에 fill-current 로 채운 버전을 함께 둔다.
 */

type IconEntry = {
  /** Figma 의 icon= 변형 이름 */
  name: string;
  Icon: LucideIcon;
  /** 채움(fill) 버전 여부 */
  filled?: boolean;
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
  { name: "alert", Icon: CircleAlertIcon },
  { name: "bell", Icon: BellIcon },
  { name: "bell-alert", Icon: BellDotIcon },
  { name: "search", Icon: SearchIcon },
  { name: "home", Icon: HomeIcon },
  { name: "setting", Icon: SettingsIcon },
  { name: "help", Icon: CircleHelpIcon },
  { name: "crown", Icon: CrownIcon },
  { name: "image", Icon: ImageIcon },
  { name: "menu", Icon: MenuIcon },
  { name: "copy", Icon: CopyIcon },
  { name: "more", Icon: EllipsisVerticalIcon },
  { name: "user", Icon: UserIcon },
  { name: "save", Icon: FileCheckIcon },
  { name: "bookmark-outline", Icon: BookmarkIcon },
  { name: "bookmark", Icon: BookmarkIcon, filled: true },
  { name: "heart-outline", Icon: HeartIcon },
  { name: "heart", Icon: HeartIcon, filled: true },
  { name: "flag", Icon: FlagIcon },
  { name: "text", Icon: TypeIcon },
  { name: "arrow-up", Icon: ArrowUpIcon },
  { name: "arrow-expand", Icon: Maximize2Icon },
  { name: "comment", Icon: MessageCircleMoreIcon },
];

export function IconSection() {
  return (
    <SpecSection id="icon" label="Icon">
      <SpecGroup title="lucide-react (24px)">
        <div className="grid grid-cols-4 gap-x-6 gap-y-5 sm:grid-cols-6">
          {ICONS.map(({ name, Icon, filled }) => (
            <div key={name} className="flex flex-col items-center gap-1.5">
              <Icon className={`size-6 text-text-primary ${filled ? "fill-current" : ""}`} />
              <span className="text-caption-1 text-text-disabled">{name}</span>
            </div>
          ))}
        </div>
      </SpecGroup>

      {/* 브랜드 로고 — lucide 에 없는 고정 자산 */}
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
