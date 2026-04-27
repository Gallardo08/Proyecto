import { Link } from "react-router-dom";
import { useApp } from "@/store/app";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Tag, ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  const { products, categories } = useApp();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (cat ? p.category === cat : true) &&
          (q
            ? (p.name + p.business + p.description).toLowerCase().includes(q.toLowerCase())
            : true)
      ),
    [products, q, cat]
  );

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-soft" aria-hidden />
        <div className="container relative py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <Badge variant="secondary" className="mb-4 gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Plataforma local</Badge>
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
              {products.slice(0, 4).map((p) => (
                <div key={p.id} className="rounded-xl bg-card overflow-hidden shadow-card">
                  <img src={p.image} alt={p.name} className="h-24 w-full object-cover" />
                  <div className="p-2">
                    <p className="text-xs font-semibold truncate">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{p.business}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Catálogo */}
      <section id="catalogo" className="container py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Catálogo de negocios</h2>
            <p className="text-muted-foreground">Explora publicaciones de emprendedores ocañeros.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar negocio o producto…" className="pl-9" />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button onClick={() => setCat(null)} className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${cat === null ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}>Todas</button>
          {categories.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${cat === c ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}>
              {c}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((p) => (
            <Link key={p.id} to={`/producto/${p.id}`}>
              <Card className="overflow-hidden hover:shadow-soft transition-shadow group h-full">
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <img src={p.image} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <Badge variant="secondary" className="gap-1"><Tag className="h-3 w-3" />{p.category}</Badge>
                    {p.discount > 0 && <Badge className="bg-accent hover:bg-accent text-accent-foreground">-{p.discount}%</Badge>}
                  </div>
                  <h3 className="font-semibold leading-tight line-clamp-1">{p.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">{p.business}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1.5"><MapPin className="h-3 w-3" />{p.location}</div>
                  <p className="mt-3 font-bold text-primary">${p.price.toLocaleString("es-CO")}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground py-12">No se encontraron resultados.</p>
          )}
        </div>
      </section>
    </>
  );
}
