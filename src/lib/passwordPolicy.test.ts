import { describe, expect, it } from "vitest";
import { passwordErrorMessage, validatePassword } from "./passwordPolicy";

describe("validatePassword", () => {
  it("accepts a password with length, cases, number and symbol", () => {
    expect(validatePassword("Ocana2026!").isValid).toBe(true);
  });

  it("rejects short passwords even if varied", () => {
    expect(validatePassword("Ab1!").isValid).toBe(false);
  });

  it("rejects passwords without symbols or numbers", () => {
    expect(validatePassword("Contrasenia").isValid).toBe(false);
  });

  it("rejects common passwords and passwords with spaces", () => {
    expect(validatePassword("password").isValid).toBe(false);
    expect(validatePassword("Ocana 2026!").isValid).toBe(false);
  });

  it("returns a message listing the failed rules", () => {
    const message = passwordErrorMessage("abcdefgh");
    expect(message).toContain("mayúscula");
    expect(passwordErrorMessage("Ocana2026!")).toBeNull();
  });
});
