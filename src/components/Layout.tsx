import { Link, Outlet, useLocation } from "react-router-dom";
import { Store, BookOpen, LogIn, UserPlus, LayoutDashboard, ShieldCheck, LogOut } from "lucide-react";
import { useApp, useCurrentUser } from "@/store/app";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Inicio", icon: Store },
  { to: "/casos-de-uso", label: "Casos de uso", icon: BookOpen },
];

export default function Layout() {
  const user = useCurrentUser();
  const logout = useApp((s) => s.logout);
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="container flex h-16 items-center gap-6">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-primary text-primary-foreground shadow-soft">
              <Store className="h-5 w-5" />
            </span>
            <span>Ofertas <span className="text-primary">Ocaña</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((it) => (
              <Link
                key={it.to}
                to={it.to}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === it.to
                    ? "text-primary bg-secondary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {it.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            {user ? (
              <>
                {user.role === "emprendedor" && (
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/panel"><LayoutDashboard className="h-4 w-4 mr-1.5" />Panel</Link>
                  </Button>
                )}
                {user.role === "admin" && (
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/admin"><ShieldCheck className="h-4 w-4 mr-1.5" />Admin</Link>
                  </Button>
                )}
                <span className="hidden sm:inline text-sm text-muted-foreground">Hola, <b className="text-foreground">{user.name.split(" ")[0]}</b></span>
                <Button variant="outline" size="sm" onClick={logout}><LogOut className="h-4 w-4" /></Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/login"><LogIn className="h-4 w-4 mr-1.5" />Iniciar sesión</Link>
                </Button>
                <Button asChild size="sm" className="shadow-soft">
                  <Link to="/registro"><UserPlus className="h-4 w-4 mr-1.5" />Crear cuenta</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border/60 py-8 mt-12">
        <div className="container text-sm text-muted-foreground flex flex-col md:flex-row items-center gap-2 justify-between">
          <p>© 2026 Ofertas Ocaña — Proyecto académico SENA / I.E. ITILPN</p>
          <p>Hecho con ♥ por estudiantes de Programación grado 11°</p>
        </div>
      </footer>
    </div>
  );
}
