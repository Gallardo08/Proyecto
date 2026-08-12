export type PasswordRule = {
  id: string;
  label: string;
  isValid: (password: string, context?: PasswordContext) => boolean;
};

export type PasswordContext = {
  email?: string;
  name?: string;
  business?: string;
};

export const MIN_PASSWORD_LENGTH = 10;

const COMMON_PASSWORDS = [
  "123456",
  "1234567",
  "12345678",
  "123456789",
  "1234567890",
  "password",
  "password1",
  "contrasena",
  "contraseña",
  "qwerty",
  "qwerty123",
  "abc123",
  "iloveyou",
  "admin",
  "administrador",
  "bienvenido",
  "colombia",
  "ocana",
  "ocaña",
];

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const personalTerms = (context?: PasswordContext): string[] => {
  if (!context) return [];
  const values = [context.email?.split("@")[0], context.name, context.business];
  return values
    .filter((value): value is string => Boolean(value))
    .flatMap((value) => normalize(value).split(/[^a-z0-9]+/))
    .filter((term) => term.length >= 4);
};

export const passwordRules: PasswordRule[] = [
  {
    id: "length",
    label: `Mínimo ${MIN_PASSWORD_LENGTH} caracteres`,
    isValid: (password) => password.length >= MIN_PASSWORD_LENGTH,
  },
  {
    id: "uppercase",
    label: "Al menos una letra mayúscula",
    isValid: (password) => /[A-ZÁÉÍÓÚÑ]/.test(password),
  },
  {
    id: "lowercase",
    label: "Al menos una letra minúscula",
    isValid: (password) => /[a-záéíóúñ]/.test(password),
  },
  {
    id: "number",
    label: "Al menos un número",
    isValid: (password) => /\d/.test(password),
  },
  {
    id: "symbol",
    label: "Al menos un símbolo (!@#$...)",
    isValid: (password) => /[^A-Za-z0-9]/.test(password),
  },
  {
    id: "no-spaces",
    label: "Sin espacios",
    isValid: (password) => password.length > 0 && !/\s/.test(password),
  },
  {
    id: "no-repeated",
    label: "Sin secuencias obvias (aaa, 123, abc)",
    isValid: (password) => {
      if (/(.)\1{2,}/.test(password)) return false;
      const lower = normalize(password);
      const sequences = ["0123456789", "abcdefghijklmnopqrstuvwxyz", "qwertyuiop"];
      return !sequences.some((sequence) => {
        for (let i = 0; i + 3 <= sequence.length; i += 1) {
          const chunk = sequence.slice(i, i + 4);
          if (lower.includes(chunk) || lower.includes([...chunk].reverse().join(""))) return true;
        }
        return false;
      });
    },
  },
  {
    id: "not-common",
    label: "No es una contraseña común",
    isValid: (password) => {
      const lower = normalize(password);
      return !COMMON_PASSWORDS.some((common) => lower.includes(normalize(common)));
    },
  },
  {
    id: "not-personal",
    label: "No incluye tu correo, nombre ni negocio",
    isValid: (password, context) => {
      const lower = normalize(password);
      return !personalTerms(context).some((term) => lower.includes(term));
    },
  },
];

export type PasswordValidation = {
  isValid: boolean;
  failed: PasswordRule[];
  score: number;
  strength: "debil" | "media" | "fuerte";
};

export function validatePassword(password: string, context?: PasswordContext): PasswordValidation {
  const failed = passwordRules.filter((rule) => !rule.isValid(password, context));
  const passed = passwordRules.length - failed.length;
  const score = Math.round((passed / passwordRules.length) * 100);
  const strength = failed.length === 0 ? (password.length >= 14 ? "fuerte" : "media") : "debil";
  return { isValid: failed.length === 0, failed, score, strength };
}

export function firstPasswordError(password: string, context?: PasswordContext): string | null {
  const { failed } = validatePassword(password, context);
  if (failed.length === 0) return null;
  return `La contraseña no cumple: ${failed.map((rule) => rule.label.toLowerCase()).join(", ")}`;
}
