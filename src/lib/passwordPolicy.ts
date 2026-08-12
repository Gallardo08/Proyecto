export const MIN_PASSWORD_LENGTH = 8;

const COMMON_PASSWORDS = [
  "12345678",
  "123456789",
  "1234567890",
  "password",
  "password1",
  "contrasena",
  "contraseña",
  "qwerty123",
  "iloveyou",
  "colombia",
  "administrador",
];

export type PasswordRule = {
  id: string;
  label: string;
  test: (password: string) => boolean;
};

export const passwordRules: PasswordRule[] = [
  {
    id: "length",
    label: `Mínimo ${MIN_PASSWORD_LENGTH} caracteres`,
    test: (password) => password.length >= MIN_PASSWORD_LENGTH,
  },
  {
    id: "uppercase",
    label: "Al menos una letra mayúscula",
    test: (password) => /\p{Lu}/u.test(password),
  },
  {
    id: "lowercase",
    label: "Al menos una letra minúscula",
    test: (password) => /\p{Ll}/u.test(password),
  },
  {
    id: "number",
    label: "Al menos un número",
    test: (password) => /\d/.test(password),
  },
  {
    id: "symbol",
    label: "Al menos un símbolo (!@#$...)",
    test: (password) => /[^\p{L}\d]/u.test(password),
  },
  {
    id: "no-spaces",
    label: "Sin espacios en blanco",
    test: (password) => password.length > 0 && !/\s/.test(password),
  },
  {
    id: "not-common",
    label: "No debe ser una contraseña común",
    test: (password) =>
      password.length > 0 && !COMMON_PASSWORDS.includes(password.toLowerCase()),
  },
];

export type PasswordValidation = {
  isValid: boolean;
  failed: PasswordRule[];
  score: number;
  strengthLabel: "Muy débil" | "Débil" | "Aceptable" | "Fuerte";
};

export function validatePassword(password: string): PasswordValidation {
  const failed = passwordRules.filter((rule) => !rule.test(password));
  const score = passwordRules.length - failed.length;
  const ratio = score / passwordRules.length;

  const strengthLabel: PasswordValidation["strengthLabel"] =
    failed.length === 0 ? "Fuerte" : ratio >= 0.8 ? "Aceptable" : ratio >= 0.5 ? "Débil" : "Muy débil";

  return { isValid: failed.length === 0, failed, score, strengthLabel };
}

export function passwordErrorMessage(password: string): string | null {
  const { failed } = validatePassword(password);
  if (failed.length === 0) return null;
  return `La contraseña no cumple los requisitos: ${failed.map((rule) => rule.label.toLowerCase()).join(", ")}.`;
}
