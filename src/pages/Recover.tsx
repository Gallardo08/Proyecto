import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function Recover() {
  const [step, setStep] = useState(1);
  const [id, setId] = useState("");
  const [code, setCode] = useState("");
  const [pwd, setPwd] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="container max-w-md py-16">
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Recuperar contraseña</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 && (
            <>
              <Label>Correo electrónico</Label>
              <Input type="email" value={id} onChange={(e) => setId(e.target.value)} placeholder="tu@email.com" />
              <Button className="w-full" disabled={isLoading} onClick={async () => {
                try {
                  if (!id) return toast.error("Ingresa tu correo electrónico");
                  setIsLoading(true);
                  
                  console.log('Invocando create-reset-token con email:', id);
                  
                  const { data, error } = await supabase.functions.invoke("create-reset-token", {
                    body: { email: id },
                  });
                  
                  console.log('Respuesta de create-reset-token:', { data, error });
                  
                  if (error) {
                    console.error('Error en create-reset-token:', error);
                    setIsLoading(false);
                    return toast.error(error.message);
                  }
                  
                  setIsLoading(false);
                  
                  // Si la respuesta incluye el token, mostrarlo en la interfaz
                  if (data && data.token) {
                    toast.success(`Tu código es: ${data.token} (copia este código)`);
                    setCode(data.token);
                  } else {
                    toast.success("Código de recuperación enviado a tu correo.");
                  }
                  
                  setStep(2);
                } catch (err) {
                  console.error('Error inesperado:', err);
                  setIsLoading(false);
                  toast.error("Error inesperado. Revisa la consola.");
                }
              }}>
                {isLoading ? "Enviando..." : "Enviar código de recuperación"}
              </Button>
            </>
          )}
          {step === 2 && (
            <>
              <Label>Código de recuperación</Label>
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Código de 6 caracteres" />
              <Label>Nueva contraseña</Label>
              <Input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="Mínimo 6 caracteres" />
              <Button className="w-full" disabled={isLoading} onClick={async () => {
                if (!code) return toast.error("Ingresa el código de recuperación");
                if (pwd.length < 6) return toast.error("La contraseña debe tener mínimo 6 caracteres");
                setIsLoading(true);
                
                const { data, error } = await supabase.functions.invoke("reset-password", {
                  body: { token: code, newPassword: pwd },
                });
                
                if (error) {
                  setIsLoading(false);
                  return toast.error(error.message);
                }
                
                setIsLoading(false);
                toast.success("Contraseña actualizada correctamente.");
                setStep(3);
              }}>
                {isLoading ? "Actualizando..." : "Actualizar contraseña"}
              </Button>
            </>
          )}
          {step === 3 && (
            <>
              <p className="text-sm text-muted-foreground">Listo, ya puedes iniciar sesión con tu nueva contraseña.</p>
              <Button asChild className="w-full"><Link to="/login">Ir a iniciar sesión</Link></Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
