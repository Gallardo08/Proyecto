import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter } from "lucide-react";
import { useCategories } from "@/hooks/useSupabase";
import type { Category } from "@/types/database";

interface CategoryFilterProps {
  selectedCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
}

export default function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const { data: categories = [], isLoading } = useCategories();

  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button variant="outline" disabled>
          <Filter className="h-4 w-4 mr-2" />
          Cargando...
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      <Button
        variant={selectedCategory === null ? "default" : "outline"}
        size="sm"
        onClick={() => onCategoryChange(null)}
        className="whitespace-nowrap"
      >
        Todas
      </Button>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? "default" : "outline"}
          size="sm"
          onClick={() => onCategoryChange(category.id)}
          className="whitespace-nowrap"
        >
          {category.nombre_categoria}
        </Button>
      ))}
      <Badge variant="secondary" className="ml-auto hidden sm:inline-flex">
        {categories.length} categorías
      </Badge>
    </div>
  );
}
