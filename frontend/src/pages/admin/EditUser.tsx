import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Loader2, Eye, EyeOff, AlertTriangle, Upload, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/lib/api";
import { toast } from "sonner";
import { getFullImageUrl } from "@/lib/utils";

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
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [removePhoto, setRemovePhoto] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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
            if (user.photo_display || user.photo) {
                setPhotoPreview(getFullImageUrl(user.photo_display || user.photo));
            }
        }
    }, [user]);

    const updateMutation = useMutation({
        mutationFn: (data: typeof formData) => {
            const payload = new FormData();
            payload.append("username", data.username);
            payload.append("email", data.email);
            payload.append("first_name", data.first_name);
            payload.append("last_name", data.last_name);
            if (data.password) {
                payload.append("password", data.password);
            }
            payload.append("is_superuser", data.role === "admin" ? "true" : "false");
            payload.append("is_staff", "true");
            payload.append("is_active", data.is_active ? "true" : "false");

            if (photoFile) {
                payload.append("photo", photoFile);
            } else if (removePhoto) {
                payload.append("remove_photo", "true");
            }

            return apiService.updateUser(id!, payload);
        },
        onSuccess: () => {
            toast.success(t("common.saved_success"));
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
            navigate("/admin/users");
        },
        onError: (err: any) => {
            console.error("Update error:", err);
            if (err.data && typeof err.data === 'object') {
                const errors: Record<string, string> = {};
                Object.entries(err.data).forEach(([key, value]) => {
                    errors[key] = Array.isArray(value) ? value[0] : String(value);
                });
                setFieldErrors(errors);
                const firstMsg = Object.values(errors)[0];
                toast.error(`Erreur : ${firstMsg}`);
            } else {
                toast.error(err.message || "Erreur lors de la modification de l'utilisateur");
            }
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});
        updateMutation.mutate(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFieldErrors(prev => ({ ...prev, [name]: "" }));
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
            setRemovePhoto(false);
        }
    };

    const handleRemovePhoto = () => {
        setPhotoFile(null);
        setPhotoPreview(null);
        setRemovePhoto(true);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
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

                        {/* Profile Photo Upload */}
                        <div className="flex flex-col items-center sm:items-start gap-4 mb-6">
                            <label htmlFor="user-photo" className="text-xs font-bold text-gray-700 uppercase cursor-pointer">Photo de profil (Optionnel)</label>
                            <div className="flex items-center gap-6">
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50 overflow-hidden relative">
                                        {photoPreview ? (
                                            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <>
                                                <Upload className="w-6 h-6 text-gray-400 mb-1" />
                                                <span className="text-[10px] text-gray-500 uppercase font-bold px-2 text-center">Ajouter</span>
                                            </>
                                        )}
                                    </div>
                                    <input
                                        id="user-photo"
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handlePhotoChange}
                                        accept="image/jpeg,image/png,image/webp"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    {photoPreview && (
                                        <button
                                            type="button"
                                            onClick={handleRemovePhoto}
                                            className="absolute -top-2 -right-2 bg-white text-red-500 border border-gray-200 rounded-full p-1 shadow-md hover:bg-red-50 transition-colors z-10"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <div className="text-sm text-gray-500 max-w-xs">
                                    <p className="mb-1 text-gray-700 font-medium">Formats acceptés :</p>
                                    <p>JPEG, PNG, WebP. Poids max : 2Mo.</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label htmlFor="user-username" className="text-xs font-bold text-gray-700 uppercase">{t("admin.users_page.form.username")}</label>
                                <input
                                    id="user-username"
                                    name="username"
                                    type="text"
                                    value={formData.username}
                                    onChange={handleChange}
                                    autoComplete="username"
                                    className={`w-full px-3 py-2 bg-white border ${fieldErrors.username ? 'border-red-500' : 'border-border'} focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm rounded-lg`}
                                    required
                                />
                                {fieldErrors.username && <p className="text-xs text-red-500 mt-1">{fieldErrors.username}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="user-email" className="text-xs font-bold text-gray-700 uppercase">{t("admin.users_page.form.email")}</label>
                                <input
                                    id="user-email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    autoComplete="email"
                                    className={`w-full px-3 py-2 bg-white border ${fieldErrors.email ? 'border-red-500' : 'border-border'} focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm rounded-lg`}
                                    required
                                />
                                {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
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
                                    autoComplete="given-name"
                                    className={`w-full px-3 py-2 bg-white border ${fieldErrors.first_name ? 'border-red-500' : 'border-border'} focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm rounded-lg`}
                                />
                                {fieldErrors.first_name && <p className="text-xs text-red-500 mt-1">{fieldErrors.first_name}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="user-last-name" className="text-xs font-bold text-gray-700 uppercase">{t("admin.users_page.form.last_name")}</label>
                                <input
                                    id="user-last-name"
                                    name="last_name"
                                    type="text"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    autoComplete="family-name"
                                    className={`w-full px-3 py-2 bg-white border ${fieldErrors.last_name ? 'border-red-500' : 'border-border'} focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm rounded-lg`}
                                />
                                {fieldErrors.last_name && <p className="text-xs text-red-500 mt-1">{fieldErrors.last_name}</p>}
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
                                        autoComplete="new-password"
                                        placeholder="Laisser vide pour ne pas changer"
                                        className={`w-full px-3 py-2 bg-white border ${fieldErrors.password ? 'border-red-500' : 'border-border'} focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm rounded-lg pr-10`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {fieldErrors.password && <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="user-role" className="text-xs font-bold text-gray-700 uppercase">{t("admin.users_page.form.role")}</label>
                                <select
                                    id="user-role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 bg-white border ${fieldErrors.role ? 'border-red-500' : 'border-border'} focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm rounded-lg`}
                                >
                                    <option value="pastor">{t("admin.users_page.form.role_pastor")}</option>
                                    <option value="admin">{t("admin.users_page.form.role_admin")}</option>
                                </select>
                                {fieldErrors.role && <p className="text-xs text-red-500 mt-1">{fieldErrors.role}</p>}
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
                                    t("admin.users_page.form.edit_submit")
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
