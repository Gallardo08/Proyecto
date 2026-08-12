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

export type PasswordContext = {
  email?: string;
  name?: string;
  business?: string;
};

export type PasswordRule = {
  id: string;
  label: string;
  test: (password: string, context?: PasswordContext) => boolean;
};

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const SEQUENCES = ["0123456789", "abcdefghijklmnopqrstuvwxyz", "qwertyuiop"];

const hasSequence = (password: string) => {
  const lower = normalize(password);
  return SEQUENCES.some((sequence) => {
    for (let i = 0; i + 4 <= sequence.length; i += 1) {
      const chunk = sequence.slice(i, i + 4);
      if (lower.includes(chunk) || lower.includes([...chunk].reverse().join(""))) return true;
    }
    return false;
  });
};

const personalTerms = (context?: PasswordContext) => {
  if (!context) return [];
  return [context.email?.split("@")[0], context.name, context.business]
    .filter((value): value is string => Boolean(value))
    .flatMap((value) => normalize(value).split(/[^a-z0-9]+/))
    .filter((term) => term.length >= 4);
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
  {
    id: "no-sequences",
    label: "Sin secuencias ni repeticiones (aaa, 1234, qwerty)",
    test: (password) => password.length > 0 && !/(.)\1{2,}/.test(password) && !hasSequence(password),
  },
  {
    id: "not-personal",
    label: "No incluye tu correo, nombre ni negocio",
    test: (password, context) => {
      const lower = normalize(password);
      return !personalTerms(context).some((term) => lower.includes(term));
    },
  },
];

export type PasswordValidation = {
  isValid: boolean;
  failed: PasswordRule[];
  score: number;
  strengthLabel: "Muy débil" | "Débil" | "Aceptable" | "Fuerte";
};

export function validatePassword(password: string, context?: PasswordContext): PasswordValidation {
  const failed = passwordRules.filter((rule) => !rule.test(password, context));
  const score = passwordRules.length - failed.length;
  const ratio = score / passwordRules.length;

  const strengthLabel: PasswordValidation["strengthLabel"] =
    failed.length === 0 ? "Fuerte" : ratio >= 0.8 ? "Aceptable" : ratio >= 0.5 ? "Débil" : "Muy débil";

  return { isValid: failed.length === 0, failed, score, strengthLabel };
}

export function passwordErrorMessage(password: string, context?: PasswordContext): string | null {
  const { failed } = validatePassword(password, context);
  if (failed.length === 0) return null;
  return `La contraseña no cumple los requisitos: ${failed.map((rule) => rule.label.toLowerCase()).join(", ")}.`;
}
