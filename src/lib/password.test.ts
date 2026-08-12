import { describe, expect, it } from "vitest";
import { firstPasswordError, validatePassword } from "./password";

describe("validatePassword", () => {
  it("rejects short passwords like the previous 6 character minimum", () => {
    expect(validatePassword("abc123").isValid).toBe(false);
  });

  it("accepts a password with length, mixed case, number and symbol", () => {
    expect(validatePassword("Brasa#Ocn2026!x").isValid).toBe(true);
  });

  it("rejects passwords without a symbol", () => {
    const { isValid, failed } = validatePassword("Contrasegura25");
    expect(isValid).toBe(false);
    expect(failed.map((rule) => rule.id)).toContain("symbol");
  });

  it("rejects common passwords even if they are long", () => {
    const { failed } = validatePassword("Password1234$");
    expect(failed.map((rule) => rule.id)).toContain("not-common");
  });

  it("rejects passwords containing personal data", () => {
    const { failed } = validatePassword("Gallardo2026!", {
      email: "gallardo@correo.com",
      name: "Carlos",
      business: "Brasa Ocaña",
    });
    expect(failed.map((rule) => rule.id)).toContain("not-personal");
  });

  it("rejects repeated characters and keyboard sequences", () => {
    expect(validatePassword("Aaaa2026!xy").failed.map((r) => r.id)).toContain("no-repeated");
    expect(validatePassword("Qwerty2026!x").failed.map((r) => r.id)).toContain("no-repeated");
  });

  it("returns a readable error message only when the password is invalid", () => {
    expect(firstPasswordError("abc123")).toMatch(/La contraseña no cumple/);
    expect(firstPasswordError("Brasa#Ocn2026!x")).toBeNull();
  });
});
