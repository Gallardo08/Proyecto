import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PasswordContext, passwordRules, validatePassword } from "@/lib/password";

type Props = {
  password: string;
  context?: PasswordContext;
};

const strengthLabel = {
  debil: "Débil",
  media: "Media",
  fuerte: "Fuerte",
} as const;

export default function PasswordStrength({ password, context }: Props) {
  const { score, strength } = validatePassword(password, context);
  const barColor =
    strength === "fuerte" ? "bg-emerald-600" : strength === "media" ? "bg-amber-500" : "bg-destructive";

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2">
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className={cn("h-full transition-all", barColor)} style={{ width: `${password ? score : 0}%` }} />
        </div>
        <span className="w-14 text-right text-xs text-muted-foreground">
          {password ? strengthLabel[strength] : ""}
        </span>
      </div>
      <ul className="grid gap-1 sm:grid-cols-2">
        {passwordRules.map((rule) => {
          const ok = rule.isValid(password, context);
          return (
            <li
              key={rule.id}
              className={cn("flex items-center gap-1.5 text-xs", ok ? "text-emerald-600" : "text-muted-foreground")}
            >
              {ok ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
              {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
