import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

type ViewState = "checking" | "ready" | "invalid" | "complete";

export default function UpdatePassword() {
  const navigate = useNavigate();
  const [viewState, setViewState] = useState<ViewState>("checking");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" && active) setViewState("ready");
    });

    // Al abrir el enlace, Supabase puede crear la sesión antes de que esta
    // pantalla se suscriba al evento PASSWORD_RECOVERY. Por eso también
    // comprobamos la sesión existente antes de mostrar el formulario.
    const checkRecoverySession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (active && session?.user) setViewState("ready");
    };
    void checkRecoverySession();

    const timeout = window.setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (active) setViewState((state) => (state === "checking" && !session?.user ? "invalid" : state));
    }, 3000);

    return () => {
      active = false;
      window.clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password.length < 6) return toast.error("La contraseña debe tener mínimo 6 caracteres");
    if (password !== confirmPassword) return toast.error("Las contraseñas no coinciden");

    setIsSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setIsSubmitting(false);
      return toast.error(error.message);
    }

    // La contraseña ya quedó guardada en Auth. Mostramos el resultado de
    // inmediato y cerramos solo la sesión de este navegador en segundo plano;
    // no esperamos un cierre global que puede demorar por la red.
    setViewState("complete");
    setIsSubmitting(false);
    toast.success("Contraseña actualizada correctamente.");
    void supabase.auth.signOut({ scope: "local" }).catch((signOutError) => {
      console.error("No se pudo cerrar la sesión de recuperación:", signOutError);
    });
  };

  return (
    <div className="container max-w-md py-16">
      <Card className="shadow-soft">
        <CardHeader><CardTitle>Crear nueva contraseña</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {viewState === "checking" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Verificando enlace seguro...
            </div>
          )}

          {viewState === "ready" && (
            <form className="space-y-4" onSubmit={submit}>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nueva contraseña</Label>
                <Input id="new-password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar nueva contraseña</Label>
                <Input id="confirm-password" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
              </div>
              <Button className="w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar nueva contraseña"}
              </Button>
            </form>
          )}

          {viewState === "invalid" && (
            <>
              <p className="text-sm text-muted-foreground">Este enlace es inválido o venció. Solicita uno nuevo.</p>
              <Button asChild className="w-full"><Link to="/recuperar">Solicitar otro enlace</Link></Button>
            </>
          )}

          {viewState === "complete" && (
            <>
              <p className="text-sm text-muted-foreground">Tu contraseña se guardó en Supabase. Ya puedes iniciar sesión.</p>
              <Button className="w-full" onClick={() => navigate("/login", { replace: true })}>Ir a iniciar sesión</Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
