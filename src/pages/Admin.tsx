import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Ban, Check, ChevronRight, Loader2, MessageCircle, Plus, Save, Settings, ShieldCheck, Users, Trash2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useApp } from "@/store/app";
import { useAdminAccounts, useCategories, useCreateCategory, useUpdateProfileStatus, useProductsByProfile, useDeleteProduct } from "@/hooks/useSupabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProductWithRelations } from "@/types/database";
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

const adminSections = [
  { id: "cuentas", label: "Cuentas", icon: Users },
  { id: "config", label: "Configuración", icon: Settings },
  { id: "soporte", label: "Soporte WhatsApp", icon: MessageCircle },
] as const;

type AdminSection = (typeof adminSections)[number]["id"];

export default function Admin() {
  const { user, loading, isAdmin } = useAuth();
  const { officialWhatsapp, setOfficialWhatsapp } = useApp();
  const { data: accounts = [], isLoading: accountsLoading, error: accountsError } = useAdminAccounts();
  const { data: categories = [] } = useCategories();
  const createCategory = useCreateCategory();
  const updateProfileStatus = useUpdateProfileStatus();
  const [active, setActive] = useState<AdminSection>("cuentas");
  const [newCat, setNewCat] = useState("");
  const [waNumber, setWaNumber] = useState(officialWhatsapp);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const selectedAccount = accounts.find((account) => account.id === selectedProfileId) ?? null;
  const { data: accountProducts = [], isLoading: accountProductsLoading } = useProductsByProfile(selectedProfileId || undefined);
  const deleteProduct = useDeleteProduct();

  if (loading) {
    return <div className="container py-16 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const activeSection = adminSections.find((section) => section.id === active)!;
  const changeAccountStatus = (id: string, status: "activo" | "bloqueado") => {
    updateProfileStatus.mutate(
      { id, status },
      {
        onSuccess: () => toast.success(status === "bloqueado" ? "Cuenta bloqueada" : "Cuenta activada"),
        onError: (error) => toast.error(`No se pudo actualizar la cuenta: ${error.message}`),
      }
    );
  };

  const handleSelectAccount = (account: { id: string; nombre?: string; email?: string; business: { id: string; nombre_negocio: string; whatsapp: string } | null }) => {
    setSelectedProfileId(account.id);
  };

  const handleClearSelection = () => setSelectedProfileId(null);

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct.mutateAsync(productId);
      toast.success("Producto eliminado correctamente");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al eliminar el producto");
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Badge variant="secondary" className="gap-1.5"><ShieldCheck className="h-3.5 w-3.5" />Administración</Badge>
        <h1 className="mt-2 text-3xl font-bold">Panel de administración</h1>
        <p className="text-muted-foreground">Gestiona cuentas, categorías y soporte desde un solo lugar.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="self-start lg:sticky lg:top-20">
          <div className="rounded-xl border bg-card p-2 shadow-card">
            {adminSections.map((section) => {
              const Icon = section.icon;
              return (
                <button key={section.id} onClick={() => setActive(section.id)} className={cn("flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors", active === section.id ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>
                  <span className="flex items-center gap-2"><Icon className="h-4 w-4" />{section.label}</span><ChevronRight className="h-4 w-4 opacity-70" />
                </button>
              );
            })}
          </div>
        </aside>

        <Card className="shadow-card">
          <CardHeader><CardTitle>{activeSection.label}</CardTitle></CardHeader>
          <CardContent>
            {active === "cuentas" && (
              <div className="divide-y">
                <p className="pb-3 text-sm text-muted-foreground">Se muestran todas las cuentas de emprendedor registradas en Supabase.</p>
                {accountsLoading && <p className="py-6 text-center text-muted-foreground">Cargando cuentas...</p>}
                {accountsError && <p className="py-6 text-center text-destructive">No se pudieron cargar las cuentas: {accountsError.message}</p>}
                {accounts.map((account) => (
                  <div key={account.id} className="flex flex-wrap items-center gap-3 py-3">
                    <div className="min-w-[200px] flex-1">
                      <p className="font-semibold">{account.nombre || "Sin nombre registrado"}</p>
                      <p className="text-sm text-muted-foreground">{account.email || "Sin correo registrado"}</p>
                      <p className="text-sm text-muted-foreground">Negocio: {account.business?.nombre_negocio || "Sin negocio registrado"} · WhatsApp: {account.business?.whatsapp || "Sin WhatsApp registrado"}</p>
                      <p className="text-xs text-muted-foreground">Perfil: {account.id}</p>
                    </div>
                    <Badge variant={account.estado === "activo" ? "default" : account.estado === "bloqueado" ? "destructive" : "secondary"}>{account.estado}</Badge>
                    <Button
                      size="sm"
                      variant={selectedProfileId === account.id ? "secondary" : "outline"}
                      onClick={() => handleSelectAccount(account)}
                      disabled={!account.business?.id}
                    >
                      {selectedProfileId === account.id ? "Publicaciones" : "Ver publicaciones"}
                    </Button>
                    {account.estado === "bloqueado" ? (
                      <Button size="sm" variant="outline" disabled={updateProfileStatus.isPending} onClick={() => changeAccountStatus(account.id, "activo")}><Check className="mr-1 h-3.5 w-3.5" />Activar</Button>
                    ) : (
                      <AlertDialog>
                        <AlertDialogTrigger asChild><Button size="sm" variant="outline" disabled={updateProfileStatus.isPending}><Ban className="mr-1 h-3.5 w-3.5" />Bloquear</Button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>¿Bloquear esta cuenta?</AlertDialogTitle><AlertDialogDescription>La persona no podrá iniciar sesión hasta que reactives la cuenta.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => changeAccountStatus(account.id, "bloqueado")}>Bloquear</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                ))}
                {!accountsLoading && !accountsError && accounts.length === 0 && <p className="py-6 text-center text-muted-foreground">No hay emprendedores registrados.</p>}

                {selectedAccount && (
                  <div className="mt-6 rounded-xl border bg-muted p-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-semibold">Publicaciones de {selectedAccount.nombre || selectedAccount.email}</h2>
                        <p className="text-sm text-muted-foreground">Negocio: {selectedAccount.business?.nombre_negocio} · WhatsApp: {selectedAccount.business?.whatsapp}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={handleClearSelection}>Cerrar vista</Button>
                    </div>

                    {accountProductsLoading ? (
                      <p className="mt-4 text-sm text-muted-foreground">Cargando publicaciones...</p>
                    ) : accountProducts.length === 0 ? (
                      <p className="mt-4 text-sm text-muted-foreground">Este emprendedor no tiene publicaciones activas.</p>
                    ) : (
                      <div className="grid gap-4 mt-4 md:grid-cols-2">
                        {accountProducts.map((product: ProductWithRelations) => (
                          <Card key={product.id} className="overflow-hidden">
                            <div className="aspect-video bg-muted overflow-hidden">
                              {product.imagen_url ? (
                                <img src={product.imagen_url} alt={product.nombre} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                                </div>
                              )}
                            </div>
                            <CardContent className="p-4">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <Badge variant="secondary">{product.category?.nombre_categoria || "Sin categoría"}</Badge>
                                {product.descuento && product.descuento > 0 && (
                                  <Badge className="bg-accent text-accent-foreground">-{product.descuento}%</Badge>
                                )}
                              </div>
                              <h3 className="font-semibold">{product.nombre}</h3>
                              <p className="text-sm text-muted-foreground mt-2">{product.descripcion || "Sin descripción"}</p>
                              <div className="mt-4 flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-sm text-muted-foreground">Precio</p>
                                  <p className="font-semibold">${(product.descuento && product.descuento > 0
                                    ? product.precio * (1 - product.descuento / 100)
                                    : product.precio
                                  ).toLocaleString("es-CO")}</p>
                                </div>
                                <Button size="sm" variant="destructive" onClick={() => handleDeleteProduct(product.id)} disabled={deleteProduct.isPending}>
                                  {deleteProduct.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {active === "config" && (
              <div className="grid gap-4 md:grid-cols-2">
                <section className="rounded-lg border p-4"><h3 className="mb-3 font-semibold">Categorías</h3><div className="mb-4 flex flex-wrap gap-2">{categories.map((category) => <Badge key={category.id} variant="secondary">{category.nombre_categoria}</Badge>)}</div><div className="flex gap-2"><Input uppercase={false} value={newCat} onChange={(event) => setNewCat(event.target.value)} placeholder="Nueva categoría" /><Button disabled={createCategory.isPending} onClick={() => { if (!newCat.trim()) return; createCategory.mutate(newCat.trim(), { onSuccess: () => { setNewCat(""); toast.success("Categoría creada"); }, onError: (error) => toast.error(error.message) }); }}><Plus className="h-4 w-4" /></Button></div></section>
                <section className="rounded-lg border p-4"><h3 className="mb-3 font-semibold">WhatsApp oficial</h3><Label htmlFor="official-whatsapp">Número con código de país</Label><Input id="official-whatsapp" value={waNumber} onChange={(event) => setWaNumber(event.target.value)} className="mb-3" /><Button onClick={() => { setOfficialWhatsapp(waNumber); toast.success("Actualizado"); }}><Save className="mr-1.5 h-4 w-4" />Guardar</Button></section>
              </div>
            )}

            {active === "soporte" && <div className="space-y-3"><p className="text-sm text-muted-foreground">Los emprendedores pueden iniciar conversación contigo por WhatsApp.</p><Button asChild className="bg-accent hover:bg-accent/90"><a href={`https://wa.me/${officialWhatsapp}`} target="_blank" rel="noreferrer"><MessageCircle className="mr-1.5 h-4 w-4" />Abrir conversación de prueba</a></Button></div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
