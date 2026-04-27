import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "@/store/app";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const login = useApp((s) => s.login);
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !password) return toast.error("Completa todos los campos");
    const user = login(id, password);
    if (!user) return toast.error("Credenciales inválidas o cuenta bloqueada");
    toast.success(`Bienvenido, ${user.name}`);
    navigate(user.role === "admin" ? "/admin" : "/panel");
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
              <Label htmlFor="id">Correo o WhatsApp</Label>
              <Input id="id" value={id} onChange={(e) => setId(e.target.value)} placeholder="lucy@ofertas.com" />
            </div>
            <div>
              <Label htmlFor="pwd">Contraseña</Label>
              <Input id="pwd" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full">Iniciar sesión</Button>
            <div className="flex justify-between text-sm">
              <Link to="/recuperar" className="text-primary hover:underline">¿Olvidaste tu contraseña?</Link>
              <Link to="/registro" className="text-muted-foreground hover:text-foreground">Crear cuenta</Link>
            </div>
            <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
              <b>Demo:</b> admin@ofertas.com / admin123 · lucy@ofertas.com / lucy123
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
