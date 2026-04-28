import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useApp, useCurrentUser } from "@/store/app";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Pencil, Loader2, Store, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useUserBusiness, useProductsByBusiness, useDeleteProduct } from "@/hooks/useSupabase";
import ProductForm from "@/components/ProductForm";
import type { ProductWithRelations } from "@/types/database";

// Componente para configurar negocio
function BusinessSetupForm({ onSuccess }: { onSuccess: (data: any) => void }) {
  const [formData, setFormData] = useState({
    nombre_negocio: "",
    whatsapp: "",
    ubicacion: "",
    descripcion: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre_negocio || !formData.whatsapp) {
      toast.error("Nombre y WhatsApp son obligatorios");
      return;
    }
    setLoading(true);
    onSuccess(formData);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Nombre del Negocio *</label>
        <input
          type="text"
          value={formData.nombre_negocio}
          onChange={(e) => setFormData({ ...formData, nombre_negocio: e.target.value })}
          className="w-full mt-1 px-3 py-2 border rounded-md"
          placeholder="Mi Negocio"
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium">WhatsApp *</label>
        <input
          type="text"
          value={formData.whatsapp}
          onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
          className="w-full mt-1 px-3 py-2 border rounded-md"
          placeholder="573001112233"
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium">Ubicación</label>
        <input
          type="text"
          value={formData.ubicacion}
          onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
          className="w-full mt-1 px-3 py-2 border rounded-md"
          placeholder="Ocaña, N. Santander"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Descripción</label>
        <textarea
          value={formData.descripcion}
          onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
          className="w-full mt-1 px-3 py-2 border rounded-md"
          rows={3}
          placeholder="Describe tu negocio..."
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
        Configurar Negocio
      </Button>
    </form>
  );
}

export default function Dashboard() {
  const user = useCurrentUser();
  const { user: authUser, businessName } = useAuth();
  const { data: business, isLoading: businessLoading } = useUserBusiness();
  const { data: products = [], isLoading: productsLoading, refetch: refetchProducts } = useProductsByBusiness(business?.id || "");
  const deleteProduct = useDeleteProduct();

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithRelations | null>(null);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "emprendedor") return <Navigate to="/admin" replace />;

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product: ProductWithRelations) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingProduct(null);
    refetchProducts();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct.mutateAsync(productId);
      toast.success("Producto eliminado correctamente");
    } catch (error) {
      toast.error("Error al eliminar el producto");
    }
  };

  // Si no tiene business, mostrar formulario para crearlo
  if (!businessLoading && !business) {
    return (
      <div className="container py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <Store className="h-12 w-12 mx-auto text-primary mb-4" />
            <CardTitle>Configura tu Negocio</CardTitle>
            <p className="text-muted-foreground">
              Para comenzar a publicar productos, necesitamos algunos datos de tu negocio
            </p>
          </CardHeader>
          <CardContent>
            <BusinessSetupForm 
              onSuccess={(newBusiness) => {
                toast.success("Negocio configurado correctamente");
                // El business se creará automáticamente en el próximo render
              }}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (businessLoading || productsLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Mi panel</h1>
          <p className="text-muted-foreground">
            Gestiona las publicaciones de <b>{businessName || business?.nombre_negocio}</b>
          </p>
        </div>
        <Button onClick={handleCreateProduct} className="shadow-soft">
          <Plus className="h-4 w-4 mr-1.5" />
          Publicar producto
        </Button>
      </div>

      {showForm && (
        <ProductForm
          product={editingProduct || undefined}
          business_id={business?.id || ""}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="aspect-video bg-muted overflow-hidden">
              {product.imagen_url ? (
                <img 
                  src={product.imagen_url} 
                  alt={product.nombre} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary">{product.category.nombre_categoria}</Badge>
                {product.descuento && product.descuento > 0 && (
                  <Badge className="bg-accent text-accent-foreground">
                    -{product.descuento}%
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold">{product.nombre}</h3>
              <p className="text-sm text-primary font-bold mt-1">
                ${product.precio.toLocaleString("es-CO")}
              </p>
              {product.descuento && product.descuento > 0 && (
                <p className="text-xs text-muted-foreground line-through">
                  ${(product.precio * (1 + product.descuento / 100)).toLocaleString("es-CO")}
                </p>
              )}
              <div className="flex gap-2 mt-3">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleEditProduct(product)} 
                  className="flex-1"
                >
                  <Pencil className="h-3.5 w-3.5 mr-1.5" />
                  Editar
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleDeleteProduct(product.id)}
                  disabled={deleteProduct.isPending}
                >
                  {deleteProduct.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {products.length === 0 && (
          <div className="col-span-full text-center py-16 border-2 border-dashed rounded-xl">
            <p className="text-muted-foreground mb-3">Aún no tienes publicaciones.</p>
            <Button onClick={handleCreateProduct}>
              <Plus className="h-4 w-4 mr-1.5" />
              Crear la primera
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
