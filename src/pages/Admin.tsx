import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useApp, useCurrentUser } from "@/store/app";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Ban, Plus, Save, MessageCircle } from "lucide-react";
import { toast } from "sonner";

export default function Admin() {
  const user = useCurrentUser();
  const { users, setUserStatus, categories, addCategory, officialWhatsapp, setOfficialWhatsapp } = useApp();
  const [newCat, setNewCat] = useState("");
  const [waNumber, setWaNumber] = useState(officialWhatsapp);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;

  const emprendedores = users.filter((u) => u.role === "emprendedor");

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-1">Panel de administración</h1>
      <p className="text-muted-foreground mb-6">Gestiona cuentas, categorías y soporte.</p>

      <Tabs defaultValue="cuentas">
        <TabsList>
          <TabsTrigger value="cuentas">Cuentas</TabsTrigger>
          <TabsTrigger value="config">Configuración</TabsTrigger>
          <TabsTrigger value="soporte">Soporte WhatsApp</TabsTrigger>
        </TabsList>

        <TabsContent value="cuentas" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Emprendedores registrados</CardTitle></CardHeader>
            <CardContent className="divide-y">
              {emprendedores.map((u) => (
                <div key={u.id} className="py-3 flex items-center gap-3 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <p className="font-semibold">{u.name} <span className="text-muted-foreground font-normal">— {u.business}</span></p>
                    <p className="text-sm text-muted-foreground">{u.email} · {u.whatsapp}</p>
                  </div>
                  <Badge variant={u.status === "activo" ? "default" : u.status === "bloqueado" ? "destructive" : "secondary"}>{u.status}</Badge>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setUserStatus(u.id, "activo"); toast.success("Cuenta activada"); }}><Check className="h-3.5 w-3.5 mr-1" />Activar</Button>
                    <Button size="sm" variant="outline" onClick={() => { setUserStatus(u.id, "bloqueado"); toast.success("Cuenta bloqueada"); }}><Ban className="h-3.5 w-3.5 mr-1" />Bloquear</Button>
                  </div>
                </div>
              ))}
              {emprendedores.length === 0 && <p className="text-muted-foreground py-6 text-center">Sin emprendedores registrados.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="mt-4 grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle>Categorías</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {categories.map((c) => <Badge key={c} variant="secondary">{c}</Badge>)}
              </div>
              <div className="flex gap-2">
                <Input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="Nueva categoría" />
                <Button onClick={() => { if (!newCat) return; addCategory(newCat); setNewCat(""); toast.success("Categoría creada"); }}><Plus className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>WhatsApp oficial</CardTitle></CardHeader>
            <CardContent>
              <Label>Número (con código país)</Label>
              <Input value={waNumber} onChange={(e) => setWaNumber(e.target.value)} className="mb-3" />
              <Button onClick={() => { setOfficialWhatsapp(waNumber); toast.success("Actualizado"); }}><Save className="h-4 w-4 mr-1.5" />Guardar</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="soporte" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Atención a emprendedores</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">Los emprendedores pueden iniciar conversación contigo vía API de WhatsApp con un mensaje automático.</p>
              <Button asChild className="bg-accent hover:bg-accent/90">
                <a href={`https://wa.me/${officialWhatsapp}`} target="_blank" rel="noreferrer">
                  <MessageCircle className="h-4 w-4 mr-1.5" />Abrir conversación de prueba
                </a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
