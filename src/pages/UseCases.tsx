import { useState } from "react";
import { useCases } from "@/data/useCases";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BookOpen, ChevronRight } from "lucide-react";

export default function UseCases() {
  const [active, setActive] = useState(useCases[0].id);
  const uc = useCases.find((u) => u.id === active)!;

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Badge variant="secondary" className="gap-1.5"><BookOpen className="h-3.5 w-3.5" />Documentación</Badge>
        <h1 className="text-3xl font-bold mt-2">Casos de uso — Ofertas Ocaña</h1>
        <p className="text-muted-foreground">9 casos documentados según los actores del sistema (Emprendedor, Visitante, Administrador).</p>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        <aside className="lg:sticky lg:top-20 self-start">
          <div className="bg-card border rounded-xl p-2 shadow-card">
            {useCases.map((u) => (
              <button
                key={u.id}
                onClick={() => setActive(u.id)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg flex items-center justify-between gap-2 text-sm transition-colors",
                  active === u.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                <span className="line-clamp-1">{u.name}</span>
                <ChevronRight className="h-4 w-4 shrink-0 opacity-70" />
              </button>
            ))}
          </div>
        </aside>

        <Card className="shadow-card">
          <CardContent className="p-6 md:p-8">
            <h2 className="text-2xl font-bold">{uc.name}</h2>
            <Badge variant="secondary" className="mt-2">Actor: {uc.actor}</Badge>

            <dl className="mt-6 grid sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <Field label="Resumen" wide>{uc.summary}</Field>
              <Field label="Precondiciones">{uc.pre}</Field>
              <Field label="Postcondiciones">{uc.post}</Field>
              <Field label="Incluye">
                <ul className="list-disc pl-5 space-y-0.5">
                  {uc.includes.map((i, k) => <li key={k}>{i}</li>)}
                </ul>
              </Field>
              <Field label="Extiende">{uc.extends}</Field>
              <Field label="Hereda">{uc.inherits}</Field>
            </dl>

            <h3 className="text-lg font-bold mt-8 mb-3 text-center bg-gradient-primary text-primary-foreground py-2 rounded-md">Flujo de eventos</h3>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-secondary">
                  <tr>
                    <th className="text-left p-3 font-semibold">Actor</th>
                    <th className="text-left p-3 font-semibold border-l">Sistema</th>
                  </tr>
                </thead>
                <tbody>
                  {uc.flow.map((f, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-3 align-top">{f.actor}</td>
                      <td className="p-3 align-top border-l bg-muted/30">{f.system}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <dt className="font-semibold text-foreground mb-0.5">{label}</dt>
      <dd className="text-muted-foreground">{children}</dd>
    </div>
  );
}
