"use client";

import { useEffect, useState } from "react";

import { SearchBar } from "@/components/ui/search-bar";

/** 타이핑이 멎으면 질의한다 — 갤러리 검색과 같은 값(300ms). */
const SEARCH_DEBOUNCE_MS = 300;

/**
 * 어드민 목록 검색바 (시안 1434:5839).
 *
 * 서버가 `q` 를 지원한다([ADMIN-REPORT-001]·[ADMIN-GRADE-001]) — 신고는 대상 내용/작성자,
 * 등급은 아이디(이메일)/닉네임 부분일치다. 검색은 URL(`?q=`)에 실려 새로고침·공유가 된다.
 *
 * 입력값은 로컬 state 로 두고 디바운스 뒤에만 URL 을 갱신한다(글자마다 요청이 나가지 않게).
 * 뒤로가기 등으로 URL 이 바뀌면 입력값도 따라가야 하므로 `value` 변화를 동기화한다.
 */
export function AdminSearch({
  value,
  onSearch,
  placeholder,
  label,
}: {
  value: string;
  onSearch: (q: string) => void;
  placeholder: string;
  label: string;
}) {
  const [keyword, setKeyword] = useState(value);

  // URL 이 바깥에서 바뀐 경우(뒤로가기·탭 이동으로 q 초기화)만 입력값을 맞춘다.
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    setKeyword(value);
  }

  useEffect(() => {
    if (keyword === value) return;
    const timer = setTimeout(() => onSearch(keyword), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [keyword, value, onSearch]);

  return (
    <SearchBar
      value={keyword}
      onChange={(event) => setKeyword(event.target.value)}
      placeholder={placeholder}
      aria-label={label}
    />
  );
}
