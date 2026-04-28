import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "@/store/app";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const PENDING_ONBOARDING_KEY = "pending-onboarding";

export default function Login() {
  const navigate = useNavigate();
  const setCurrentUserFromSupabase = useApp((s) => s.setCurrentUserFromSupabase);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const getPendingOnboarding = () => {
    const raw = localStorage.getItem(PENDING_ONBOARDING_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as {
        email: string;
        name: string;
        business: string;
        whatsapp: string;
        location: string;
      };
    } catch {
      return null;
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Completa todos los campos");
    setIsSubmitting(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      setIsSubmitting(false);
      return toast.error(error?.message ?? "Credenciales inválidas");
    }

    const userId = data.user.id;
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("rol, estado")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      await supabase.auth.signOut();
      setIsSubmitting(false);
      return toast.error("No se encontró el perfil del usuario");
    }

    if (profile.estado === "bloqueado") {
      await supabase.auth.signOut();
      setIsSubmitting(false);
      return toast.error("Tu cuenta está bloqueada. Contacta al administrador.");
    }

    const fallbackName = data.user.email?.split("@")[0] ?? "Usuario";
    let { data: business } = await supabase
      .from("businesses")
      .select("nombre_negocio, whatsapp, ubicacion")
      .eq("profile_id", userId)
      .maybeSingle();

    // Si el usuario confirmó email y aún no tiene negocio, lo crea en primer login.
    if (!business && profile.rol === "emprendedor") {
      const pending = getPendingOnboarding();
      const meta = data.user.user_metadata ?? {};
      const businessName =
        (pending?.email === (data.user.email ?? "").toLowerCase() ? pending.business : undefined) ||
        (meta.business as string) ||
        fallbackName;
      const whatsapp =
        (pending?.email === (data.user.email ?? "").toLowerCase() ? pending.whatsapp : undefined) ||
        (meta.whatsapp as string) ||
        "";
      const ubicacion =
        (pending?.email === (data.user.email ?? "").toLowerCase() ? pending.location : undefined) ||
        (meta.location as string) ||
        "";

      if (businessName && whatsapp) {
        const { error: createBusinessError } = await supabase.from("businesses").insert({
          profile_id: userId,
          nombre_negocio: businessName,
          whatsapp,
          ubicacion,
          descripcion: "",
          foto_perfil_url: null,
        });

        if (createBusinessError) {
          setIsSubmitting(false);
          return toast.error(`Inicio de sesión correcto, pero faltó completar tu negocio: ${createBusinessError.message}`);
        }

        const { data: createdBusiness } = await supabase
          .from("businesses")
          .select("nombre_negocio, whatsapp, ubicacion")
          .eq("profile_id", userId)
          .maybeSingle();
        business = createdBusiness ?? business;
        localStorage.removeItem(PENDING_ONBOARDING_KEY);
      }
    }

    const name = (data.user.user_metadata?.name as string) || fallbackName;
    setCurrentUserFromSupabase({
      id: userId,
      name,
      email: data.user.email ?? "",
      whatsapp: business?.whatsapp ?? "",
      business: business?.nombre_negocio,
      location: business?.ubicacion,
      role: profile.rol,
      status: profile.estado,
      avatar: undefined,
    });

    toast.success(`Bienvenido, ${name}`);
    navigate(profile.rol === "admin" ? "/admin" : "/panel");
    setIsSubmitting(false);
  };

  return (
    <div className="container max-w-md py-16">
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-2xl">Iniciar sesión</CardTitle>
          <p className="text-sm text-muted-foreground">Accede a tu cuenta de emprendedor o administrador.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="lucy@ofertas.com" />
            </div>
            <div>
              <Label htmlFor="pwd">Contraseña</Label>
              <Input id="pwd" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
            </Button>
            <div className="flex justify-between text-sm">
              <Link to="/recuperar" className="text-primary hover:underline">¿Olvidaste tu contraseña?</Link>
              <Link to="/registro" className="text-muted-foreground hover:text-foreground">Crear cuenta</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
