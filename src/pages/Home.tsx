import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CategoryFilter from "@/components/CategoryFilter";
import ProductGallery from "@/components/ProductGallery";
import { useProducts, useProductsByCategory } from "@/hooks/useSupabase";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: allProducts = [], isLoading: allLoading, error: allError } = useProducts();
  const {
    data: categoryProducts = [],
    isLoading: categoryLoading,
    error: categoryError,
  } = useProductsByCategory(selectedCategory || "");

  const products = selectedCategory ? categoryProducts : allProducts;
  const loading = selectedCategory ? categoryLoading : allLoading;
  const error = selectedCategory ? categoryError : allError;

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;

    const query = searchQuery.toLowerCase();
    return products.filter(
      (product) =>
        product.nombre.toLowerCase().includes(query) ||
        product.business.nombre_negocio.toLowerCase().includes(query) ||
        product.descripcion?.toLowerCase().includes(query) ||
        product.category.nombre_categoria.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-soft" aria-hidden />
        <div className="container relative py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4 gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Plataforma local
            </Badge>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Descubre los <span className="text-primary">mejores negocios</span> de Ocaña
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Conecta con emprendedores locales: productos, ofertas y servicios a un clic de WhatsApp.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <Button asChild size="lg" className="shadow-soft">
                <Link to="/registro">
                  Soy emprendedor
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#catalogo">Ver catálogo</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

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
              placeholder="Buscar negocio o producto..."
              className="pl-9"
            />
          </div>
        </div>

        <div className="mb-8">
          <CategoryFilter selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
        </div>

        <ProductGallery
          products={filteredProducts}
          loading={loading}
          errorMessage={error instanceof Error ? error.message : undefined}
        />

        {searchQuery && !loading && (
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              {filteredProducts.length} resultado{filteredProducts.length !== 1 ? "s" : ""} para "{searchQuery}"
            </p>
          </div>
        )}
      </section>
    </>
  );
}
