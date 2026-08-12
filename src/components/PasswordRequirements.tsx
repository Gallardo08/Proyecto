import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PasswordContext, passwordRules, validatePassword } from "@/lib/passwordPolicy";

export function PasswordRequirements({ password, context }: { password: string; context?: PasswordContext }) {
  const { score, strengthLabel, isValid } = validatePassword(password, context);
  const percentage = (score / passwordRules.length) * 100;

  return (
    <div className="mt-2 space-y-2">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full transition-all",
            isValid ? "bg-emerald-500" : percentage >= 80 ? "bg-amber-500" : "bg-destructive"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">Seguridad: {strengthLabel}</p>
      <ul className="grid gap-1 sm:grid-cols-2">
        {passwordRules.map((rule) => {
          const passed = rule.test(password, context);
          return (
            <li
              key={rule.id}
              className={cn("flex items-center gap-1.5 text-xs", passed ? "text-emerald-600" : "text-muted-foreground")}
            >
              {passed ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
              {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
