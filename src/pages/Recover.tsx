import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function Recover() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sendRecoveryEmail = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email) return toast.error("Ingresa tu correo electrónico");
    if (!isSupabaseConfigured) return toast.error("Falta configurar Supabase.");

    setIsSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/actualizar-contrasena`,
    });
    setIsSubmitting(false);

    if (error) return toast.error(error.message);
    toast.success("Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.");
  };

  return (
    <div className="container max-w-md py-16">
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Recuperar contraseña</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={sendRecoveryEmail}>
            <p className="text-sm text-muted-foreground">
              Te enviaremos un enlace seguro a tu correo para crear una nueva contraseña.
            </p>
            <div className="space-y-2">
              <Label htmlFor="recovery-email">Correo electrónico</Label>
              <Input
                id="recovery-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Enviar enlace"}
            </Button>
          </form>
          <Link to="/login" className="block text-center text-sm text-primary hover:underline">
            Volver a iniciar sesión
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
