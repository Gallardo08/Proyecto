import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUpdateBusiness, useUserBusiness } from "@/hooks/useSupabase";

export default function EditBusiness() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { data: business, isLoading: businessLoading, refetch: refetchBusiness } = useUserBusiness(user?.id);
  const updateBusiness = useUpdateBusiness();
  const [form, setForm] = useState({
    nombre_negocio: "",
    nombre_usuario: "",
    whatsapp: "",
    ubicacion: "",
    descripcion: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (business) {
      setForm({
        nombre_negocio: business.nombre_negocio,
        nombre_usuario: user?.user_metadata?.name ?? "",
        whatsapp: business.whatsapp,
        ubicacion: business.ubicacion ?? "",
        descripcion: business.descripcion ?? "",
      });
    }
  }, [business, user]);

  if (loading) {
    return (
      <div className="container py-16 text-center">
        <div className="inline-flex items-center justify-center rounded-full bg-muted p-5">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.profile?.rol !== "emprendedor") return <Navigate to="/admin" replace />;

  if (businessLoading) {
    return (
      <div className="container py-16 text-center">
        <div className="inline-flex items-center justify-center rounded-full bg-muted p-5">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="container py-16">
        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle>No se encontró tu negocio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Crea primero tu negocio desde el panel para poder editar tus datos.</p>
            <Button asChild className="mt-4">
              <Link to="/panel">Volver al panel</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.nombre_negocio.trim() || !form.whatsapp.trim()) {
      return toast.error("Nombre del negocio y WhatsApp son obligatorios");
    }

    if (!form.nombre_usuario.trim()) {
      return toast.error("Nombre de usuario es obligatorio");
    }

    if (!/^\d{10,15}$/.test(form.whatsapp)) {
      return toast.error("WhatsApp inválido (solo números, ej: 573001234567)");
    }

    setIsSubmitting(true);

    try {
      await updateBusiness.mutateAsync({
        nombre_negocio: form.nombre_negocio,
        whatsapp: form.whatsapp,
        ubicacion: form.ubicacion,
        descripcion: form.descripcion,
      });

      const { error: updateProfileError } = await supabase.auth.updateUser({
        data: {
          name: form.nombre_usuario,
        },
      });

      if (updateProfileError) {
        throw new Error(updateProfileError.message);
      }

      toast.success("Datos del negocio actualizados correctamente");
      await refetchBusiness();
      navigate("/panel", { state: { refresh: true } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo actualizar el negocio");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-2xl py-12">
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-2xl">Editar datos del negocio</CardTitle>
          <p className="text-sm text-muted-foreground">Actualiza la información que verán tus clientes y visitas.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div>
              <Label>Nombre del negocio *</Label>
              <Input
                value={form.nombre_negocio}
                onChange={(event) => setForm({ ...form, nombre_negocio: event.target.value })}
                placeholder="Ej: Brasa Ocaña"
              />
            </div>
            <div>
              <Label>Nombre de usuario</Label>
              <Input
                value={form.nombre_usuario}
                onChange={(event) => setForm({ ...form, nombre_usuario: event.target.value })}
                placeholder="Tu nombre o seudónimo"
              />
            </div>
            <div>
              <Label>WhatsApp *</Label>
              <Input
                value={form.whatsapp}
                onChange={(event) => setForm({ ...form, whatsapp: event.target.value.replace(/\D/g, "") })}
                placeholder="573001112233"
              />
            </div>
            <div>
              <Label>Ubicación</Label>
              <Input
                value={form.ubicacion}
                onChange={(event) => setForm({ ...form, ubicacion: event.target.value })}
                placeholder="Calle 10 #5-20, Ocaña"
              />
            </div>
            <div>
              <Label>Descripción</Label>
              <Input
                value={form.descripcion}
                onChange={(event) => setForm({ ...form, descripcion: event.target.value })}
                placeholder="Describe tu negocio"
              />
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar cambios"}
              </Button>
              <Button asChild variant="outline">
                <Link to="/panel">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
