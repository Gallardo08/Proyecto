import { useParams, Link } from "react-router-dom";
import { useApp } from "@/store/app";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, MessageCircle, Tag, Calendar } from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const product = useApp((s) => s.products.find((p) => p.id === id));

  if (!product) {
    return (
      <div className="container py-16 text-center">
        <p className="text-muted-foreground">Producto no encontrado.</p>
        <Button asChild className="mt-4"><Link to="/">Volver al inicio</Link></Button>
      </div>
    );
  }

  const finalPrice = product.discount
    ? product.price - (product.price * product.discount) / 100
    : product.price;

  const waUrl = `https://wa.me/${product.whatsapp}?text=${encodeURIComponent(
    `Hola, vi tu publicación "${product.name}" en Ofertas Ocaña y me interesa.`
  )}`;

  return (
    <div className="container py-8">
      <Button asChild variant="ghost" size="sm" className="mb-4"><Link to="/"><ArrowLeft className="h-4 w-4 mr-1.5" />Volver</Link></Button>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="rounded-2xl overflow-hidden bg-muted shadow-card">
          <img src={product.image} alt={product.name} className="w-full aspect-square object-cover" />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="secondary" className="gap-1"><Tag className="h-3 w-3" />{product.category}</Badge>
            {product.discount > 0 && <Badge className="bg-accent text-accent-foreground hover:bg-accent">-{product.discount}% OFF</Badge>}
          </div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-lg text-muted-foreground mt-1">{product.business}</p>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-4xl font-extrabold text-primary">${finalPrice.toLocaleString("es-CO")}</span>
            {product.discount > 0 && (
              <span className="text-lg line-through text-muted-foreground">${product.price.toLocaleString("es-CO")}</span>
            )}
          </div>

          <p className="mt-6 leading-relaxed">{product.description}</p>

          <div className="mt-6 space-y-2 text-sm">
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />{product.location}</p>
            <p className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" />Publicado: {product.date}</p>
          </div>

          <Button asChild size="lg" className="mt-8 w-full md:w-auto shadow-soft bg-accent hover:bg-accent/90">
            <a href={waUrl} target="_blank" rel="noreferrer">
              <MessageCircle className="h-5 w-5 mr-2" /> Contactar por WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
