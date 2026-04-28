import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Tag, ArrowRight, Sparkles, Store } from "lucide-react";
import { useProducts, useProductsByCategory } from "@/hooks/useSupabase";
import CategoryFilter from "@/components/CategoryFilter";
import ProductGallery from "@/components/ProductGallery";
import type { ProductWithRelations } from "@/types/database";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Obtener productos según la categoría seleccionada
  const { data: allProducts = [], isLoading: allLoading } = useProducts();
  const { data: categoryProducts = [], isLoading: categoryLoading } = useProductsByCategory(selectedCategory || "");

  // Determinar qué productos mostrar
  const products = selectedCategory ? categoryProducts : allProducts;
  const loading = selectedCategory ? categoryLoading : allLoading;

  // Filtrar por búsqueda
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    
    const query = searchQuery.toLowerCase();
    return products.filter((product) => 
      product.nombre.toLowerCase().includes(query) ||
      product.business.nombre_negocio.toLowerCase().includes(query) ||
      product.descripcion?.toLowerCase().includes(query) ||
      product.category.nombre_categoria.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  // Productos para el hero (primeros 4)
  const heroProducts = allProducts.slice(0, 4);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-soft" aria-hidden />
        <div className="container relative py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <Badge variant="secondary" className="mb-4 gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> Plataforma local
            </Badge>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Descubre los <span className="text-primary">mejores negocios</span> de Ocaña
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-lg">
              Conecta con emprendedores locales: productos, ofertas y servicios a un clic de WhatsApp.
            </p>
            <div className="mt-8 flex gap-3">
              <Button asChild size="lg" className="shadow-soft">
                <Link to="/registro">Soy emprendedor <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#catalogo">Ver catálogo</a>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl bg-gradient-primary shadow-soft p-6 grid grid-cols-2 gap-4">
              {heroProducts.map((product) => (
                <div key={product.id} className="rounded-xl bg-card overflow-hidden shadow-card">
                  {product.imagen_url ? (
                    <img 
                      src={product.imagen_url} 
                      alt={product.nombre} 
                      className="h-24 w-full object-cover" 
                    />
                  ) : (
                    <div className="h-24 w-full bg-muted flex items-center justify-center">
                      <Store className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                  )}
                  <div className="p-2">
                    <p className="text-xs font-semibold truncate">{product.nombre}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {product.business.nombre_negocio}
                    </p>
                  </div>
                </div>
              ))}
              {heroProducts.length === 0 && (
                <div className="col-span-2 flex items-center justify-center">
                  <div className="text-center">
                    <Store className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Cargando productos...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Catálogo */}
      <section id="catalogo" className="container py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Catálogo de negocios</h2>
            <p className="text-muted-foreground">
              Explora publicaciones de emprendedores ocañeros.
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar negocio o producto…" 
              className="pl-9" 
            />
          </div>
        </div>

        {/* Filtros de categoría */}
        <div className="mb-8">
          <CategoryFilter 
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        {/* Galería de productos */}
        <ProductGallery 
          products={filteredProducts} 
          loading={loading}
        />

        {/* Resultados de búsqueda */}
        {searchQuery && !loading && (
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              {filteredProducts.length} resultado{filteredProducts.length !== 1 ? 's' : ''} 
              para "{searchQuery}"
            </p>
          </div>
        )}
      </section>
    </>
  );
}
