import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Phone, MapPin, Store } from "lucide-react";
import type { ProductWithRelations } from "@/types/database";

interface ProductGalleryProps {
  products: ProductWithRelations[];
  loading?: boolean;
}

export default function ProductGallery({ products, loading }: ProductGalleryProps) {
  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="overflow-hidden animate-pulse">
            <div className="aspect-video bg-muted"></div>
            <CardContent className="p-4 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
              <div className="h-4 bg-muted rounded w-1/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
          <Store className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No hay productos disponibles</h3>
        <p className="text-muted-foreground">
          No se encontraron productos en esta categoría. Intenta con otra categoría.
        </p>
      </div>
    );
  }

  const formatWhatsAppNumber = (phone: string) => {
    // Limpiar el número para WhatsApp
    const cleanNumber = phone.replace(/\D/g, '');
    return cleanNumber.startsWith('57') ? cleanNumber : `57${cleanNumber}`;
  };

  const openWhatsApp = (phone: string, productName: string, businessName: string) => {
    const message = encodeURIComponent(
      `¡Hola! Vi tu producto "${productName}" en Ofertas Ocaña y estoy interesado.`
    );
    const whatsappNumber = formatWhatsAppNumber(phone);
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          {/* Imagen del producto */}
          <div className="aspect-video bg-muted overflow-hidden relative">
            {product.imagen_url ? (
              <img
                src={product.imagen_url}
                alt={product.nombre}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
              </div>
            )}
            
            {/* Badges de descuento */}
            {product.descuento && product.descuento > 0 && (
              <div className="absolute top-2 right-2">
                <Badge className="bg-red-500 text-white">
                  -{product.descuento}%
                </Badge>
              </div>
            )}
          </div>

          <CardContent className="p-4">
            {/* Categoría */}
            <div className="mb-2">
              <Badge variant="secondary" className="text-xs">
                {product.category.nombre_categoria}
              </Badge>
            </div>

            {/* Nombre del producto */}
            <h3 className="font-semibold text-lg mb-2 line-clamp-2">
              {product.nombre}
            </h3>

            {/* Despción (truncada) */}
            {product.descripcion && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {product.descripcion}
              </p>
            )}

            {/* Precios */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl font-bold text-primary">
                ${product.precio.toLocaleString("es-CO")}
              </span>
              {product.descuento && product.descuento > 0 && (
                <span className="text-sm text-muted-foreground line-through">
                  ${(product.precio * (1 + product.descuento / 100)).toLocaleString("es-CO")}
                </span>
              )}
            </div>

            {/* Información del negocio */}
            <div className="space-y-1 mb-3">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Store className="h-3 w-3" />
                <span className="truncate">{product.business.nombre_negocio}</span>
              </div>
              {product.business.ubicacion && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{product.business.ubicacion}</span>
                </div>
              )}
            </div>

            {/* Botón de WhatsApp */}
            <Button
              className="w-full"
              onClick={() => openWhatsApp(
                product.business.whatsapp,
                product.nombre,
                product.business.nombre_negocio
              )}
            >
              <Phone className="h-4 w-4 mr-2" />
              Contactar
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
