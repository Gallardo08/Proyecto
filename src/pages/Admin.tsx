import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useApp } from "@/store/app";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Ban, Check, ChevronRight, MessageCircle, Plus, Save, Settings, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useCategories, useCreateCategory } from "@/hooks/useSupabase";

const adminSections = [
  { id: "cuentas", label: "Cuentas", icon: Users },
  { id: "config", label: "Configuracion", icon: Settings },
  { id: "soporte", label: "Soporte WhatsApp", icon: MessageCircle },
] as const;

type AdminSection = (typeof adminSections)[number]["id"];

export default function Admin() {
  const { user, loading, isAdmin } = useAuth();
  const { users, setUserStatus, officialWhatsapp, setOfficialWhatsapp } = useApp();
  const { data: categories = [] } = useCategories();
  const createCategory = useCreateCategory();
  const [active, setActive] = useState<AdminSection>("cuentas");
  const [newCat, setNewCat] = useState("");
  const [waNumber, setWaNumber] = useState(officialWhatsapp);

  if (loading) {
    return (
      <div className="container py-16 text-center">
        <div className="inline-flex items-center justify-center rounded-full bg-muted p-5">
          <ShieldCheck className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const emprendedores = users.filter((u) => u.role === "emprendedor" && u.status === "pendiente");
  const activeSection = adminSections.find((section) => section.id === active)!;

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Badge variant="secondary" className="gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5" />
          Administracion
        </Badge>
        <h1 className="text-3xl font-bold mt-2">Panel de administracion</h1>
        <p className="text-muted-foreground">Gestiona cuentas, categorias y soporte desde un solo lugar.</p>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        <aside className="lg:sticky lg:top-20 self-start">
          <div className="bg-card border rounded-xl p-2 shadow-card">
            {adminSections.map((section) => {
              const Icon = section.icon;

              return (
                <button
                  key={section.id}
                  onClick={() => setActive(section.id)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg flex items-center justify-between gap-2 text-sm transition-colors",
                    active === section.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  )}
                >
                  <span className="flex items-center gap-2 line-clamp-1">
                    <Icon className="h-4 w-4 shrink-0" />
                    {section.label}
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 opacity-70" />
                </button>
              );
            })}
          </div>
        </aside>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>{activeSection.label}</CardTitle>
          </CardHeader>
          <CardContent>
            {active === "cuentas" && (
              <div className="divide-y">
                {emprendedores.map((u) => (
                  <div key={u.id} className="py-3 flex items-center gap-3 flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                      <p className="font-semibold">
                        {u.name} <span className="text-muted-foreground font-normal">- {u.business}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">{u.email} - {u.whatsapp}</p>
                    </div>
                    <Badge variant={u.status === "activo" ? "default" : u.status === "bloqueado" ? "destructive" : "secondary"}>
                      {u.status}
                    </Badge>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setUserStatus(u.id, "activo");
                          toast.success("Cuenta activada");
                        }}
                      >
                        <Check className="h-3.5 w-3.5 mr-1" />
                        Activar
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Ban className="h-3.5 w-3.5 mr-1" />
                            Bloquear
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción bloqueará la cuenta de {u.name} y no podrá acceder a la plataforma.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                setUserStatus(u.id, "bloqueado");
                                toast.success("Cuenta bloqueada");
                              }}
                            >
                              Bloquear
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
                {emprendedores.length === 0 && (
                  <p className="text-muted-foreground py-6 text-center">Sin emprendedores registrados.</p>
                )}
              </div>
            )}

            {active === "config" && (
              <div className="grid md:grid-cols-2 gap-4">
                <section className="rounded-lg border p-4">
                  <h3 className="font-semibold mb-3">Categorias</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {categories.map((c) => (
                        <Badge key={c.id} variant="secondary">
                          {c.nombre_categoria}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="Nueva categoria" />
                      <Button
                        onClick={() => {
                          if (!newCat) return;
                          createCategory.mutate(newCat, {
                            onSuccess: () => {
                              setNewCat("");
                              toast.success("Categoria creada");
                            },
                            onError: (error) => {
                              toast.error(error.message);
                            }
                          });
                        }}
                        disabled={createCategory.isPending}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                </section>

                <section className="rounded-lg border p-4">
                  <h3 className="font-semibold mb-3">WhatsApp oficial</h3>
                    <Label>Numero con codigo pais</Label>
                    <Input value={waNumber} onChange={(e) => setWaNumber(e.target.value)} className="mb-3" />
                    <Button
                      onClick={() => {
                        setOfficialWhatsapp(waNumber);
                        toast.success("Actualizado");
                      }}
                    >
                      <Save className="h-4 w-4 mr-1.5" />
                      Guardar
                    </Button>
                </section>
              </div>
            )}

            {active === "soporte" && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Los emprendedores pueden iniciar conversacion contigo via WhatsApp con un mensaje automatico.
                </p>
                <Button asChild className="bg-accent hover:bg-accent/90">
                  <a href={`https://wa.me/${officialWhatsapp}`} target="_blank" rel="noreferrer">
                    <MessageCircle className="h-4 w-4 mr-1.5" />
                    Abrir conversacion de prueba
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
