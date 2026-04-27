import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useApp, useCurrentUser } from "@/store/app";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Pencil, Save, X } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/data/mock";

export default function Dashboard() {
  const user = useCurrentUser();
  const { products, categories, addProduct, updateProduct, deleteProduct } = useApp();

  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const empty: Omit<Product, "id"> = {
    name: "", business: user?.business || user?.name || "", category: categories[0],
    price: 0, discount: 0, description: "", location: user?.location || "",
    whatsapp: user?.whatsapp || "", image: "", date: new Date().toISOString().slice(0, 10),
  };
  const [form, setForm] = useState<Omit<Product, "id">>(empty);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "emprendedor") return <Navigate to="/admin" replace />;

  const mine = products.filter((p) => p.business === user.business);

  const startNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const startEdit = (p: Product) => { setEditing(p); setForm(p); setOpen(true); };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.image || form.price <= 0) return toast.error("Completa nombre, imagen y precio");
    if (editing) { updateProduct(editing.id, form); toast.success("Publicación actualizada"); }
    else { addProduct(form); toast.success("Publicación creada"); }
    setOpen(false);
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Mi panel</h1>
          <p className="text-muted-foreground">Gestiona las publicaciones de <b>{user.business}</b></p>
        </div>
        <Button onClick={startNew} className="shadow-soft"><Plus className="h-4 w-4 mr-1.5" />Publicar producto</Button>
      </div>

      {open && (
        <Card className="mb-8 border-primary/30 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{editing ? "Editar publicación" : "Nueva publicación"}</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}><X className="h-4 w-4" /></Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
              <div><Label>Nombre del producto</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div>
                <Label>Categoría</Label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {categories.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2"><Label>Imagen (URL)</Label><Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://…" /></div>
              <div className="sm:col-span-2"><Label>Descripción</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div><Label>Precio (COP)</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: +e.target.value })} /></div>
              <div><Label>Descuento (%)</Label><Input type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: +e.target.value })} /></div>
              <div><Label>Ubicación</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
              <div><Label>Fecha</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              <Button type="submit" className="sm:col-span-2"><Save className="h-4 w-4 mr-1.5" />Guardar</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mine.map((p) => (
          <Card key={p.id} className="overflow-hidden">
            <div className="aspect-video bg-muted overflow-hidden">
              {p.image && <img src={p.image} alt={p.name} className="w-full h-full object-cover" />}
            </div>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary">{p.category}</Badge>
                {p.discount > 0 && <Badge className="bg-accent text-accent-foreground">-{p.discount}%</Badge>}
              </div>
              <h3 className="font-semibold">{p.name}</h3>
              <p className="text-sm text-primary font-bold mt-1">${p.price.toLocaleString("es-CO")}</p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => startEdit(p)} className="flex-1"><Pencil className="h-3.5 w-3.5 mr-1.5" />Editar</Button>
                <Button size="sm" variant="outline" onClick={() => { deleteProduct(p.id); toast.success("Eliminada"); }}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {mine.length === 0 && (
          <div className="col-span-full text-center py-16 border-2 border-dashed rounded-xl">
            <p className="text-muted-foreground mb-3">Aún no tienes publicaciones.</p>
            <Button onClick={startNew}><Plus className="h-4 w-4 mr-1.5" />Crear la primera</Button>
          </div>
        )}
      </div>
    </div>
  );
}
