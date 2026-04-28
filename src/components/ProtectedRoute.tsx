import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "emprendedor" | "admin";
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole, 
  redirectTo = "/login" 
}: ProtectedRouteProps) {
  const { user, loading, isEmprendedor, isAdmin, isActive } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Si no hay usuario, redirigir al login
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Si el usuario no está activo, mostrar mensaje
  if (!isActive) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Cuenta inactiva</h1>
          <p className="text-muted-foreground">
            Tu cuenta está pendiente de activación o ha sido bloqueada.
          </p>
        </div>
      </div>
    );
  }

  // Si se requiere un rol específico
  if (requiredRole === "emprendedor" && !isEmprendedor) {
    return <Navigate to="/admin" replace />;
  }

  if (requiredRole === "admin" && !isAdmin) {
    return <Navigate to="/panel" replace />;
  }

  return <>{children}</>;
}
