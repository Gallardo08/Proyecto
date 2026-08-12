type ProfileStatus = "activo" | "bloqueado" | "pendiente" | string | null | undefined;

type UserEmailStatus = {
  email_confirmed_at?: string | null;
};

export function canAccessAfterEmailConfirmation(
  profile: { estado?: ProfileStatus } | null | undefined,
  user: UserEmailStatus | null | undefined
): boolean {
  if (!profile) return false;
  if (profile.estado === "bloqueado") return false;
  if (profile.estado === "pendiente" && !user?.email_confirmed_at) return false;
  return true;
}
