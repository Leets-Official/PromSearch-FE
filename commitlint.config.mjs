/**
 * 커밋 메시지 컨벤션 검사.
 * husky 의 commit-msg 훅에서 실행됩니다.
 *
 * 형식: [type/PS-번호] 제목
 * 예: [feat/PS-12] 로그인 모달 추가
 */
const config = {
  extends: ["@commitlint/config-conventional"],
  parserPreset: {
    parserOpts: {
      headerPattern: /^\[(\w+)\/(PS-\d+)\]\s(.+)$/,
      headerCorrespondence: ["type", "scope", "subject"],
    },
  },
  rules: {
    // 우리 라벨(.github/labels.yml)과 동일한 type 목록만 허용.
    "type-enum": [
      2,
      "always",
      [
        "feat", // 새로운 기능
        "fix", // 버그 수정
        "refactor", // 리팩토링 (기능 변화 없음)
        "design", // UI / 스타일
        "docs", // 문서
        "test", // 테스트 추가/수정
        "chore", // 설정 · 빌드 · 기타
        "setup", // 프로젝트 환경 설정
        "style", // 포맷/세미콜론 등 (코드 의미 변화 없음)
        "perf", // 성능 개선
        "ci", // CI 설정
        "revert", // 되돌리기
      ],
    ],
    // 한국어 제목을 위해 대소문자 규칙은 끈다.
    "subject-case": [0],
    // 제목 끝에 마침표 금지.
    "subject-full-stop": [2, "never", "."],
    // 헤더 최대 길이.
    "header-max-length": [2, "always", 100],
  },
};

export default config;
