import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function ConfirmEmail() {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get("token") || "");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      confirmEmail();
    }
  }, [token]);

  const confirmEmail = async () => {
    if (!token) return toast.error("Ingresa el código de confirmación");
    setIsLoading(true);

    const { data, error } = await supabase.functions.invoke("confirm-email", {
      body: { token },
    });

    if (error) {
      setIsLoading(false);
      return toast.error(error.message);
    }

    setIsLoading(false);
    toast.success("Cuenta confirmada exitosamente. Ahora puedes iniciar sesión.");
    navigate("/login");
  };

  return (
    <div className="container max-w-md py-16">
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Confirmar cuenta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Ingresa el código de confirmación que recibiste en tu correo.
          </p>
          <Label>Código de confirmación</Label>
          <Input 
            value={token} 
            onChange={(e) => setToken(e.target.value.toUpperCase())} 
            placeholder="Código de 6 caracteres"
            maxLength={6}
          />
          <Button className="w-full" disabled={isLoading} onClick={confirmEmail}>
            {isLoading ? "Confirmando..." : "Confirmar cuenta"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
