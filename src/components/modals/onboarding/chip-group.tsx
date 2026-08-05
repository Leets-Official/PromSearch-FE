import { Chip } from "@/components/ui/chip";

interface ChipGroupProps {
  label: string;
  hint: string;
  options: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
}

/** 라벨 + 힌트 + 선택 칩 그룹 (다중 선택) */
export function ChipGroup({ label, hint, options, selected, onToggle }: ChipGroupProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline gap-2">
        <span className="text-title-1 text-text-primary">{label}</span>
        <span className="text-caption-1 text-text-brand">{hint}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {options.map((option) => (
          <Chip
            key={option}
            selected={selected.includes(option)}
            onClick={() => onToggle(option)}
            className="w-full"
          >
            {option}
          </Chip>
        ))}
      </div>
    </div>
  );
}
