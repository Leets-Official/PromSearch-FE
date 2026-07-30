export type FieldStatus = "idle" | "valid" | "invalid";

// 이메일 형식 — 일반적인 RFC 수준의 관대한 패턴
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_MIN = 8;
const PASSWORD_MAX = 20;

/**
 * 비밀번호: 영문/숫자/특수문자 중 2종류 이상 혼합, 8~20자.
 * (공백 불가. 특수문자는 일반 키보드 기호 범위로 본다)
 */
function countCharTypes(pw: string) {
  let types = 0;
  if (/[a-zA-Z]/.test(pw)) types++;
  if (/[0-9]/.test(pw)) types++;
  if (/[^a-zA-Z0-9\s]/.test(pw)) types++;
  return types;
}

export interface EmailValidation {
  status: FieldStatus;
  message: string | null;
}

export interface PasswordValidation {
  status: FieldStatus;
  message: string | null;
  /** 폼 활성 판단용 */
  isValid: boolean;
}

/** 이메일(아이디) 형식 검증 — 렌더 중 파생 */
export function validateEmail(email: string): EmailValidation {
  if (email.length === 0) return { status: "idle", message: null };
  if (!EMAIL_PATTERN.test(email.trim())) {
    return { status: "invalid", message: "이메일 형식으로 입력해주세요." };
  }
  return { status: "valid", message: null };
}

/** 비밀번호 형식 검증 — 렌더 중 파생 */
export function validatePassword(password: string): PasswordValidation {
  if (password.length === 0) {
    return { status: "idle", message: null, isValid: false };
  }
  if (/\s/.test(password)) {
    return { status: "invalid", message: "공백은 사용할 수 없어요.", isValid: false };
  }
  if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
    return {
      status: "invalid",
      message: `${PASSWORD_MIN}~${PASSWORD_MAX}자로 입력해주세요.`,
      isValid: false,
    };
  }
  if (countCharTypes(password) < 2) {
    return {
      status: "invalid",
      message: "영문·숫자·특수문자 중 2가지 이상을 조합해주세요.",
      isValid: false,
    };
  }
  return { status: "valid", message: null, isValid: true };
}
