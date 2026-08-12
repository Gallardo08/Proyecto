import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { PasswordRequirements } from "@/components/PasswordRequirements";
import { passwordErrorMessage } from "@/lib/passwordPolicy";

const PENDING_ONBOARDING_KEY = "pending-onboarding";

export default function Register() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    business: "",
    name: "",
    email: "",
    whatsapp: "",
    location: "",
    document: "",
    password: "",
    confirmPassword: "",
  });

  const set = (k: keyof typeof form, v: string) => setForm({ ...form, [k]: v });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(form).some((v) => !v)) return toast.error("Completa todos los campos");
    const passwordError = passwordErrorMessage(form.password, {
      email: form.email,
      name: form.name,
      business: form.business,
    });
    if (passwordError) return toast.error(passwordError);
    if (form.password !== form.confirmPassword) return toast.error("Las contraseñas no coinciden");
    if (!/^\d{10,15}$/.test(form.whatsapp)) return toast.error("WhatsApp inválido (solo números, ej: 573001234567)");
    if (!/^\d+$/.test(form.document)) return toast.error("NIT/Cédula inválida (solo números)");
    setIsSubmitting(true);

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          name: form.name,
          business: form.business,
          whatsapp: form.whatsapp,
          location: form.location,
        },
      },
    });

    if (error || !data.user) {
      setIsSubmitting(false);
      return toast.error(error?.message ?? "No se pudo crear la cuenta");
    }

    await supabase.auth.signOut();
    setIsSubmitting(false);
    toast.success("Cuenta creada. Se envió un correo de confirmación. Primero verifica tu email y luego vuelve a iniciar sesión.");
    window.location.href = "/login?pendingConfirmation=1";
  };

  return (
    <div className="container max-w-xl py-12">
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-2xl">Crear cuenta de emprendedor</CardTitle>
          <p className="text-sm text-muted-foreground">Comparte tu negocio con toda la ciudad de Ocaña.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label>Nombre del emprendimiento</Label>
              <Input value={form.business} onChange={(e) => set("business", e.target.value)} placeholder="Ej: Brasa Ocaña" />
            </div>
            <div>
              <Label>Nombre de usuario</Label>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Tu nombre" />
            </div>
            <div>
              <Label>Correo electrónico</Label>
              <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>
            <div>
              <Label>WhatsApp</Label>
              <Input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="Digite su numero cel" />
            </div>
            <div>
              <Label>Dirección</Label>
              <Input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Calle 10 # 5-20" />
            </div>
            <div>
              <Label>NIT / Cédula</Label>
              <Input
                value={form.document}
                onChange={(e) => set("document", e.target.value.replace(/\D/g, ""))}
                placeholder="Solo números"
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Contraseña</Label>
              <Input
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
              />
              <PasswordRequirements
                password={form.password}
                context={{ email: form.email, name: form.name, business: form.business }}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Confirmar contraseña</Label>
              <Input
                type="password"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={(e) => set("confirmPassword", e.target.value)}
              />
            </div>
            <Button type="submit" className="sm:col-span-2 mt-2" disabled={isSubmitting}>
              {isSubmitting ? "Creando..." : "Crear cuenta"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
