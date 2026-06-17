import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";

type CallbackState = "loading" | "success" | "error";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [state, setState] = useState<CallbackState>("loading");
  const [message, setMessage] = useState("Confirmando tu correo...");

  useEffect(() => {
    let isMounted = true;

    const finishAuth = async () => {
      try {
        const currentUrl = new URL(window.location.href);
        const code = currentUrl.searchParams.get("code");
        const errorDescription =
          currentUrl.searchParams.get("error_description") ||
          currentUrl.searchParams.get("error");

        if (errorDescription) {
          throw new Error(errorDescription);
        }

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (!session?.user) {
          throw new Error("El enlace de confirmación expiró o ya fue usado. Inicia sesión para continuar.");
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("rol, estado")
          .eq("id", session.user.id)
          .single();

        if (profileError || !profile) {
          throw new Error("Tu correo fue confirmado, pero no encontramos tu perfil. Intenta iniciar sesión.");
        }

        if (profile.estado === "bloqueado") {
          throw new Error("Tu cuenta está bloqueada. Contacta al administrador.");
        }

        const { data: business } = await supabase
          .from("businesses")
          .select("nombre_negocio, whatsapp, ubicacion, foto_perfil_url")
          .eq("profile_id", session.user.id)
          .maybeSingle();

        const name =
          (session.user.user_metadata?.name as string | undefined) ||
          session.user.email?.split("@")[0] ||
          "Usuario";

        const destination = profile.rol === "admin" ? "/admin" : "/panel";

        if (!isMounted) return;
        setState("success");
        setMessage("Correo confirmado correctamente. Te estamos redirigiendo...");

        window.history.replaceState({}, document.title, "/auth/callback");
        window.setTimeout(() => navigate(destination, { replace: true }), 1200);
      } catch (error) {
        if (!isMounted) return;
        setState("error");
        setMessage(error instanceof Error ? error.message : "No pudimos confirmar tu correo.");
      }
    };

    finishAuth();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-12">
      <Card className="w-full max-w-md shadow-soft">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-muted">
            {state === "loading" && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
            {state === "success" && <CheckCircle2 className="h-6 w-6 text-primary" />}
            {state === "error" && <AlertCircle className="h-6 w-6 text-destructive" />}
          </div>
          <CardTitle>
            {state === "loading" && "Confirmando correo"}
            {state === "success" && "Correo confirmado"}
            {state === "error" && "No se pudo confirmar"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">{message}</p>
          {state === "error" && (
            <Button asChild className="w-full">
              <Link to="/login">Ir a iniciar sesión</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
