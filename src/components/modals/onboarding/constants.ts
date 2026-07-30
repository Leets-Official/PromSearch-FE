export const JOB_OPTIONS = ["학생", "직장인", "자영업자", "기획자", "디자이너", "개발자"] as const;
export const TASK_OPTIONS = ["PPT", "레포트", "이메일", "보고서", "회의록", "이미지 생성"] as const;

export const MAX_JOBS = 3;
export const MAX_TASKS = 3;
export const NICKNAME_MAX = 10;

export const STEP_META = {
  1: {
    title: "프로필 설정",
    description: "닉네임과 프로필 사진을 설정해주세요.",
  },
  2: {
    title: "관심 직군 & 태스크",
    description: "관심 직군과 자주 하는 태스크를 알려주시면, 딱 맞는 프롬프트부터 보여드릴게요.",
  },
} as const;
