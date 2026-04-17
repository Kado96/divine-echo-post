import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit2, Loader2, Users, GripVertical } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { apiService } from "@/lib/api";
import { getFullImageUrl } from "@/lib/utils";

const AdminTeam = () => {
    const { t, i18n } = useTranslation();
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTeam = async () => {
        try {
            setLoading(true);
            const data = await apiService.getTeamMembers();
            setMembers(Array.isArray(data) ? data : (data.results || []));
        } catch (error) {
            toast.error(t("common.error_loading"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeam();
    }, []);

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`${t("common.confirm_delete")} ${name}?`)) return;
        try {
            await apiService.deleteTeamMember(id);
            toast.success(t("common.deleted_success"));
            fetchTeam();
        } catch (error) {
            toast.error(t("common.error_deleting"));
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-[#1d2327]">👥 {t("admin.team_page.title")}</h1>
                        <p className="text-sm text-gray-500">{t("admin.team_page.desc")}</p>
                    </div>
                    <Link to="/admin/team/create">
                        <Button size="sm" className="bg-[#2271b1] hover:bg-[#135e96] text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            {t("admin.team_page.add_btn")}
                        </Button>
                    </Link>
                </header>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <p>{t("common.loading")}</p>
                    </div>
                ) : members.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white border border-dashed border-border rounded-2xl">
                        <Users className="w-12 h-12 mb-4 opacity-20" />
                        <p className="font-medium">{t("common.no_data")}</p>
                        <Link to="/admin/team/create" className="mt-4">
                            <Button variant="outline" size="sm">{t("admin.team_page.add_btn")}</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-border">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-16 text-center">Ordre</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Membre</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Rôle ({i18n.language.toUpperCase()})</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {members.sort((a, b) => (a.order || 0) - (b.order || 0)).map((member) => (
                                    <tr key={member.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-500 text-xs font-bold">
                                                {member.order || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full overflow-hidden border border-border bg-gray-50 flex-shrink-0">
                                                    {member.photo_display ? (
                                                        <img src={member.photo_display} alt={member.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Users className="w-6 h-6 text-gray-300" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[#1d2327]">{member.name}</p>
                                                    <p className="text-[10px] text-gray-400">ID: {member.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600">
                                                {member[`role_${i18n.language}`] || member.role_fr || "---"}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link to={`/admin/team/edit/${member.id}`}>
                                                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Modifier">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                </Link>
                                                <button 
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" 
                                                    title="Supprimer"
                                                    onClick={() => handleDelete(member.id, member.name)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminTeam;
