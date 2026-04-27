import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/store/app";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function Register() {
  const navigate = useNavigate();
  const register = useApp((s) => s.register);

  const [form, setForm] = useState({
    business: "",
    name: "",
    email: "",
    whatsapp: "",
    location: "",
    password: "",
  });

  const set = (k: keyof typeof form, v: string) => setForm({ ...form, [k]: v });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(form).some((v) => !v)) return toast.error("Completa todos los campos");
    if (form.password.length < 6) return toast.error("La contraseña debe tener mínimo 6 caracteres");
    if (!/^\d{10,15}$/.test(form.whatsapp)) return toast.error("WhatsApp inválido (solo números, ej: 573001234567)");
    register({ ...form, avatar: undefined });
    toast.success("Cuenta creada con éxito 🎉");
    navigate("/panel");
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
              <Label>WhatsApp (con código país)</Label>
              <Input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="573001234567" />
            </div>
            <div>
              <Label>Ubicación</Label>
              <Input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Ocaña, N. Santander" />
            </div>
            <div className="sm:col-span-2">
              <Label>Contraseña</Label>
              <Input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} />
            </div>
            <Button type="submit" className="sm:col-span-2 mt-2">Crear cuenta</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
