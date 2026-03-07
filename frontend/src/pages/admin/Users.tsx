import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Search, Plus, Mail, Shield, Trash2, Edit2, Loader2, AlertTriangle, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/lib/api";
import { useState } from "react";
import { getFullImageUrl } from "@/lib/utils";

const AdminUsers = () => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");

    // Fetch users
    const { data: users = [], isLoading, error } = useQuery({
        queryKey: ["admin-users"],
        queryFn: () => apiService.getUsers(),
        select: (data) => Array.isArray(data) ? data : (data.results || []),
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: number | string) => apiService.deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
            toast.success(t("common.deleted_success"));
        },
        onError: (err: any) => {
            toast.error(err.message || t("common.error_deleting"));
        }
    });

    const handleDelete = (id: number | string, name: string) => {
        if (window.confirm(`${t("common.confirm_delete")} (${name})`)) {
            deleteMutation.mutate(id);
        }
    };

    const filteredUsers = users.filter((user: any) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.first_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.last_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (error) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                    <AlertTriangle className="w-12 h-12 text-red-500" />
                    <p className="text-gray-500 font-medium">{t("common.error_loading")}</p>
                    <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-users"] })}>
                        {t("common.retry")}
                    </Button>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-[#1d2327]">👥 {t("admin.users_page.title")}</h1>
                        <p className="text-sm text-gray-500">{t("admin.users_page.desc")}</p>
                    </div>
                    <Link to="/admin/users/create">
                        <Button size="sm" className="bg-[#2271b1] hover:bg-[#135e96] text-white w-full sm:w-auto">
                            <Plus className="w-4 h-4 mr-2" />
                            {t("admin.users_page.add_btn")}
                        </Button>
                    </Link>
                </header>

                {/* Recherche simple */}
                <div className="mb-6 relative max-w-md">
                    <label htmlFor="users-search" className="sr-only">{t("admin.users_page.filters.search_label")}</label>
                    <input
                        id="users-search"
                        name="search"
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={t("admin.users_page.search_placeholder")}
                        autoComplete="off"
                        className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center min-h-[300px]">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="bg-white border border-dashed border-gray-300 rounded-3xl p-12 text-center">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">{t("common.no_results")}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredUsers.map((user: any) => (
                            <div key={user.id} className="bg-white border border-border rounded-xl p-5 shadow-sm relative group overflow-hidden hover:border-blue-200 transition-colors">
                                <div className="flex items-center gap-4 mb-4">
                                    {user.photo_display || user.photo ? (
                                        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-100">
                                            <img
                                                src={getFullImageUrl(user.photo_display || user.photo)}
                                                alt={user.username}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-blue-50 text-[#2271b1] flex items-center justify-center font-black text-lg flex-shrink-0">
                                            {(user.first_name || user.username)[0].toUpperCase()}
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-[#1d2327] truncate">
                                            {user.first_name || user.last_name
                                                ? `${user.first_name} ${user.last_name}`.trim()
                                                : user.username}
                                        </h3>
                                        <p className="text-xs text-gray-400 truncate">@{user.username}</p>
                                    </div>
                                    <div className={`ml-auto w-2.5 h-2.5 rounded-full ${user.is_active !== false ? 'bg-green-500' : 'bg-gray-300'} shadow-sm`} />
                                </div>

                                <div className="space-y-2.5 mb-6">
                                    <div className="flex items-center gap-2 text-xs text-gray-600 truncate">
                                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                                        {user.email || "—"}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                        <Shield className="w-3.5 h-3.5 text-gray-400" />
                                        <span className="font-bold text-[#2271b1]">
                                            {user.is_superuser
                                                ? t("admin.users_page.form.role_admin")
                                                : t("admin.users_page.form.role_pastor")}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-4 border-t border-gray-50 uppercase text-[10px] font-black tracking-widest">
                                    <Link
                                        to={`/admin/users/edit/${user.id}`}
                                        className="text-[#2271b1] hover:text-blue-800 transition-colors px-1 h-8 flex items-center gap-1"
                                    >
                                        <Edit2 className="w-3 h-3" />
                                        {t("admin.categories_page.table.modify")}
                                    </Link>
                                    <button
                                        className="text-red-500 hover:text-red-700 transition-colors px-1 h-8 flex items-center gap-1 ml-auto"
                                        disabled={deleteMutation.isPending}
                                        onClick={() => handleDelete(user.id, user.username)}
                                    >
                                        <Trash2 className="w-3 h-3" />
                                        {t("admin.categories_page.table.delete")}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminUsers;
