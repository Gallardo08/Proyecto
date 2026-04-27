import { useState } from "react";
import { Link } from "react-router-dom";
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

  return (
    <div className="container max-w-md py-16">
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Recuperar contraseña</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 && (
            <>
              <Label>Correo o WhatsApp</Label>
              <Input value={id} onChange={(e) => setId(e.target.value)} />
              <Button className="w-full" onClick={() => { if (!id) return toast.error("Ingresa tu correo o WhatsApp"); toast.success("Código enviado: 1234 (demo)"); setStep(2); }}>Enviar código</Button>
            </>
          )}
          {step === 2 && (
            <>
              <Label>Código (demo: 1234)</Label>
              <Input value={code} onChange={(e) => setCode(e.target.value)} />
              <Label>Nueva contraseña</Label>
              <Input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} />
              <Button className="w-full" onClick={() => { if (code !== "1234") return toast.error("Código incorrecto"); if (pwd.length < 6) return toast.error("Mínimo 6 caracteres"); toast.success("Contraseña actualizada (demo)"); setStep(3); }}>Actualizar</Button>
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
