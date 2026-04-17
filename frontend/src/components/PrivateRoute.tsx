import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";

interface PrivateRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

const PrivateRoute = ({ children, allowedRoles }: PrivateRouteProps) => {
    const { isAuthenticated, isLoading, user } = useAuth();
    const location = useLocation();

    useEffect(() => {
        if (!isLoading && isAuthenticated && allowedRoles && user) {
            const hasRole = allowedRoles.includes((user as any).role) || user.is_superuser;
            if (!hasRole) {
                toast.error("Accès refusé : Vous n'avez pas les permissions nécessaires.");
            }
        }
    }, [isLoading, isAuthenticated, allowedRoles, user]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                    <p className="text-sm text-slate-500 font-medium">Chargement...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirect to login, preserving the intended destination
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    // Role check
    if (allowedRoles && user) {
        const hasRole = allowedRoles.includes((user as any).role) || user.is_superuser;
        if (!hasRole) {
            // Redirect unauthorized users to admin dashboard
            return <Navigate to="/admin" replace />;
        }
    }

    return <>{children}</>;
};

export default PrivateRoute;
