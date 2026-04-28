import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Upload, Image as ImageIcon, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCategories, useCreateProduct, useUpdateProduct } from "@/hooks/useSupabase";
import type { ProductFormData, ProductWithRelations } from "@/types/database";

interface ProductFormProps {
  product?: ProductWithRelations;
  business_id: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ProductForm({ product, business_id, onSuccess, onCancel }: ProductFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(product?.imagen_url || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: categories = [] } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const [formData, setFormData] = useState<ProductFormData>({
    nombre: product?.nombre || "",
    descripcion: product?.descripcion || "",
    precio: product?.precio || 0,
    descuento: product?.descuento || 0,
    category_id: product?.category_id || "",
    imagen: undefined
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        toast.error("Solo se permiten archivos de imagen");
        return;
      }

      // Validar tamaño (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La imagen no puede superar los 5MB");
        return;
      }

      setSelectedFile(file);
      setFormData({ ...formData, imagen: file });

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setPreviewImage(null);
    setFormData({ ...formData, imagen: undefined });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validaciones
      if (!formData.nombre.trim()) {
        toast.error("El nombre del producto es obligatorio");
        return;
      }

      if (!formData.category_id) {
        toast.error("Debes seleccionar una categoría");
        return;
      }

      if (formData.precio <= 0) {
        toast.error("El precio debe ser mayor a 0");
        return;
      }

      if (formData.descuento && (formData.descuento < 0 || formData.descuento > 100)) {
        toast.error("El descuento debe estar entre 0 y 100");
        return;
      }

      const submitData = {
        ...formData,
        business_id
      };

      if (product) {
        await updateProduct.mutateAsync({
          id: product.id,
          updates: submitData
        });
        toast.success("Producto actualizado correctamente");
      } else {
        await createProduct.mutateAsync(submitData);
        toast.success("Producto creado correctamente");
      }

      onSuccess?.();
    } catch (error) {
      console.error("Error guardando producto:", error);
      toast.error("Error al guardar el producto. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {product ? "Editar Producto" : "Nuevo Producto"}
        </CardTitle>
        {onCancel && (
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Imagen */}
          <div className="space-y-2">
            <Label>Imagen del Producto</Label>
            <div className="flex items-center gap-4">
              {previewImage ? (
                <div className="relative group">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={removeImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div
                  className="w-24 h-24 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                </div>
              )}
              <div className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {previewImage ? "Cambiar Imagen" : "Subir Imagen"}
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG, WebP o GIF (máx. 5MB)
                </p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del Producto *</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: Hamburguesa Artesanal"
              required
            />
          </div>

          {/* Categoría */}
          <div className="space-y-2">
            <Label htmlFor="categoria">Categoría *</Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => setFormData({ ...formData, category_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.nombre_categoria}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Describe tu producto, ingredientes, características, etc."
              rows={3}
            />
          </div>

          {/* Precio y Descuento */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="precio">Precio (COP) *</Label>
              <Input
                id="precio"
                type="number"
                min="0"
                step="100"
                value={formData.precio}
                onChange={(e) => setFormData({ ...formData, precio: Number(e.target.value) })}
                placeholder="18000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descuento">Descuento (%)</Label>
              <Input
                id="descuento"
                type="number"
                min="0"
                max="100"
                value={formData.descuento}
                onChange={(e) => setFormData({ ...formData, descuento: Number(e.target.value) })}
                placeholder="0"
              />
            </div>
          </div>

          {/* Preview de precio con descuento */}
          {formData.descuento && formData.descuento > 0 && formData.precio > 0 && (
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">-{formData.descuento}%</Badge>
                <span className="text-sm text-muted-foreground line-through">
                  ${formData.precio.toLocaleString("es-CO")}
                </span>
                <span className="text-lg font-bold text-primary">
                  ${(formData.precio * (1 - formData.descuento / 100)).toLocaleString("es-CO")}
                </span>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {product ? "Actualizar" : "Publicar"}
                </>
              )}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
