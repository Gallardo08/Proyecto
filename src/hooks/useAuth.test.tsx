import { render, screen, waitFor } from "@testing-library/react";
import { act } from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { AuthProvider, useAuth } from "./useAuth";

const profileRequest = vi.fn();
const businessRequest = vi.fn();

const mockSupabase = {
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    onAuthStateChange: vi.fn(),
    signOut: vi.fn().mockResolvedValue({ error: null }),
  },
  from: vi.fn((table: string) => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => {
          if (table === "profiles") return profileRequest();
          if (table === "businesses") return businessRequest();
          return Promise.resolve({ data: null, error: null });
        }),
      })),
    })),
  })),
};

vi.mock("@/lib/supabase/client", () => ({
  supabase: mockSupabase,
}));

function AuthProbe() {
  const { loading, user } = useAuth();

  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user">{user?.id ?? "no-user"}</span>
    </div>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    profileRequest.mockReset();
    businessRequest.mockReset();
    mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
      (globalThis as { __authCallback?: (event: string, session: any) => void }).__authCallback = callback;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });
  });

  it("keeps loading while profile data is being enriched after sign in", async () => {
    let resolveProfile: (value: any) => void;
    profileRequest.mockReturnValue(
      new Promise((resolve) => {
        resolveProfile = resolve;
      })
    );

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );

    await act(async () => {
      (globalThis as { __authCallback?: (event: string, session: any) => void }).__authCallback?.("SIGNED_IN", {
        user: { id: "user-1", email: "emprendedor@test.com" },
      });
    });

    expect(screen.getByTestId("loading")).toHaveTextContent("true");

    await act(async () => {
      resolveProfile({ data: { rol: "emprendedor", estado: "activo" }, error: null });
    });

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("user-1");
    });
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
  });
});
