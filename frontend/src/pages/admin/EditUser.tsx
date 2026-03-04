import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Loader2, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/lib/api";
import { toast } from "sonner";

const AdminEditUser = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams();
    const queryClient = useQueryClient();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        first_name: "",
        last_name: "",
        password: "",
        role: "pastor",
        is_active: true
    });

    // Fetch user data
    const { data: user, isLoading: isLoadingUser, error: loadError } = useQuery({
        queryKey: ["admin-user", id],
        queryFn: () => apiService.getUserById(id!),
        enabled: !!id
    });

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || "",
                email: user.email || "",
                first_name: user.first_name || "",
                last_name: user.last_name || "",
                password: "", // Don't pre-fill password
                role: user.is_superuser ? "admin" : "pastor",
                is_active: user.is_active !== false
            });
        }
    }, [user]);

    const updateMutation = useMutation({
        mutationFn: (data: typeof formData) => {
            const payload: any = {
                ...data,
                is_superuser: data.role === "admin",
                is_staff: true
            };
            // Remove password if empty to not overwrite it
            if (!payload.password) delete payload.password;

            return apiService.updateUser(id!, payload);
        },
        onSuccess: () => {
            toast.success(t("common.saved_success"));
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
            navigate("/admin/users");
        },
        onError: (err: any) => {
            toast.error(err.message || "Erreur lors de la modification de l'utilisateur");
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateMutation.mutate(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    if (isLoadingUser) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            </AdminLayout>
        );
    }

    if (loadError) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                    <AlertTriangle className="w-12 h-12 text-red-500" />
                    <p className="text-gray-500 font-medium">Utilisateur introuvable</p>
                    <Link to="/admin/users">
                        <Button variant="outline">Retour à la liste</Button>
                    </Link>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto">
                <header className="flex flex-col gap-4 mb-8">
                    <Link to="/admin/users" className="flex items-center gap-1 text-[#2271b1] hover:text-[#135e96] text-sm transition-colors w-fit">
                        <ChevronLeft className="w-4 h-4" />
                        <span>{t("admin.users")}</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-[#1d2327]">Modifier le membre : {user?.username}</h1>
                </header>

                <div className="bg-white border border-border shadow-sm p-6 rounded-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label htmlFor="user-username" className="text-xs font-bold text-gray-700 uppercase">{t("admin.users_page.form.username")}</label>
                                <input
                                    id="user-username"
                                    name="username"
                                    type="text"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm rounded-lg"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="user-email" className="text-xs font-bold text-gray-700 uppercase">{t("admin.users_page.form.email")}</label>
                                <input
                                    id="user-email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm rounded-lg"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label htmlFor="user-first-name" className="text-xs font-bold text-gray-700 uppercase">{t("admin.users_page.form.first_name")}</label>
                                <input
                                    id="user-first-name"
                                    name="first_name"
                                    type="text"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm rounded-lg"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="user-last-name" className="text-xs font-bold text-gray-700 uppercase">{t("admin.users_page.form.last_name")}</label>
                                <input
                                    id="user-last-name"
                                    name="last_name"
                                    type="text"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm rounded-lg"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                            <div className="space-y-1.5">
                                <label htmlFor="user-password" className="text-xs font-bold text-gray-700 uppercase">Nouveau mot de passe (optionnel)</label>
                                <div className="relative">
                                    <input
                                        id="user-password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Laisser vide pour ne pas changer"
                                        className="w-full px-3 py-2 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm rounded-lg pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="user-role" className="text-xs font-bold text-gray-700 uppercase">{t("admin.users_page.form.role")}</label>
                                <select
                                    id="user-role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm rounded-lg"
                                >
                                    <option value="pastor">{t("admin.users_page.form.role_pastor")}</option>
                                    <option value="admin">{t("admin.users_page.form.role_admin")}</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_active"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleChange}
                                className="rounded-sm border-gray-300 text-[#2271b1] focus:ring-[#2271b1]"
                            />
                            <label htmlFor="is_active" className="text-sm text-gray-600 cursor-pointer">Compte actif</label>
                        </div>

                        <div className="pt-6 border-t border-gray-100">
                            <Button
                                type="submit"
                                disabled={updateMutation.isPending}
                                className="bg-[#2271b1] hover:bg-[#135e96] text-white min-w-[150px]"
                            >
                                {updateMutation.isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Enregistrement...
                                    </>
                                ) : (
                                    t("admin.users_page.form.submit")
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminEditUser;
