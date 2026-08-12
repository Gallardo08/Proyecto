import { describe, expect, it } from "vitest";
import { canAccessAfterEmailConfirmation } from "./auth";

describe("canAccessAfterEmailConfirmation", () => {
  it("blocks access when the profile is still pending verification", () => {
    expect(
      canAccessAfterEmailConfirmation(
        { estado: "pendiente" },
        { email_confirmed_at: null }
      )
    ).toBe(false);
  });

  it("allows access when the email has already been confirmed", () => {
    expect(
      canAccessAfterEmailConfirmation(
        { estado: "pendiente" },
        { email_confirmed_at: "2026-08-12T00:00:00Z" }
      )
    ).toBe(true);
  });

  it("blocks blocked users even if they have an email confirmation timestamp", () => {
    expect(
      canAccessAfterEmailConfirmation(
        { estado: "bloqueado" },
        { email_confirmed_at: "2026-08-12T00:00:00Z" }
      )
    ).toBe(false);
  });
});
