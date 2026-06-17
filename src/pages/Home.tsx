import { useMemo, useState } from "react";
import { Search } from "lucide-react";
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
    <section id="catalogo" className="container py-12">
        <div className="sticky top-16 z-30 mb-6 rounded-3xl border border-border/60 bg-background/95 p-6 shadow-soft backdrop-blur">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
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

          <div className="mt-6">
            <CategoryFilter selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
          </div>
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
  );
}
  