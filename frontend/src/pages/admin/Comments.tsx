import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Trash2, CheckCircle2, Loader2, MessageSquare, User, Clock, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { apiService } from "@/lib/api";

const AdminComments = () => {
    const { t } = useTranslation();
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all"); // all, pending, approved

    const fetchComments = async () => {
        try {
            setLoading(true);
            const data = await apiService.getAdminComments();
            setComments(Array.isArray(data) ? data : (data.results || []));
        } catch (error) {
            toast.error(t("common.error_loading"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm(t("common.confirm_delete"))) return;
        try {
            await apiService.deleteComment(id);
            toast.success(t("common.deleted_success"));
            fetchComments();
        } catch (error) {
            toast.error(t("common.error_deleting"));
        }
    };

    const handleToggleApproval = async (id: number, currentStatus: boolean) => {
        try {
            await apiService.updateCommentStatus(id, { is_approved: !currentStatus });
            toast.success(t("common.updated_success"));
            fetchComments();
        } catch (error) {
            toast.error(t("common.error_updating"));
        }
    };

    const filteredComments = comments.filter(item => {
        if (filter === "pending") return !item.is_approved;
        if (filter === "approved") return item.is_approved;
        return true;
    });

    const stats = {
        all: comments.length,
        pending: comments.filter(c => !c.is_approved).length,
        approved: comments.filter(c => c.is_approved).length
    };

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-[#1d2327]">💬 {t("admin.comments_page.title")}</h1>
                        <p className="text-sm text-gray-500">{t("admin.comments_page.desc")}</p>
                    </div>
                </header>

                <div className="flex items-center gap-6 text-sm font-bold border-b border-border mb-8 pb-3 overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setFilter("all")}
                        className={`whitespace-nowrap transition-colors ${filter === "all" ? "text-[#2271b1] relative" : "text-gray-400 hover:text-gray-600"}`}
                    >
                        {t("admin.announcements_page.filters.all")} ({stats.all})
                        {filter === "all" && <span className="absolute -bottom-3 left-0 w-full h-0.5 bg-[#2271b1]"></span>}
                    </button>
                    <button
                        onClick={() => setFilter("pending")}
                        className={`whitespace-nowrap transition-colors ${filter === "pending" ? "text-[#2271b1] relative" : "text-gray-400 hover:text-gray-600"}`}
                    >
                        {t("admin.testimonials_page.filters.to_verify")} ({stats.pending})
                        {filter === "pending" && <span className="absolute -bottom-3 left-0 w-full h-0.5 bg-[#2271b1]"></span>}
                    </button>
                    <button
                        onClick={() => setFilter("approved")}
                        className={`whitespace-nowrap transition-colors ${filter === "approved" ? "text-[#2271b1] relative" : "text-gray-400 hover:text-gray-600"}`}
                    >
                        {t("admin.testimonials_page.filters.published")} ({stats.approved})
                        {filter === "approved" && <span className="absolute -bottom-3 left-0 w-full h-0.5 bg-[#2271b1]"></span>}
                    </button>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <p>{t("common.loading")}</p>
                    </div>
                ) : filteredComments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white border border-dashed border-border rounded-2xl">
                        <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                        <p className="font-medium">{t("admin.comments_page.empty")}</p>
                    </div>
                ) : (
                    <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-border">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t("admin.comments_page.table.author")}</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t("admin.comments_page.table.emission")}</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Commentaire</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t("admin.comments_page.table.status")}</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">{t("admin.comments_page.table.actions")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredComments.map((comment) => (
                                    <tr key={comment.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-50 text-[#2271b1] flex items-center justify-center font-bold text-xs uppercase">
                                                    {comment.author_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-[#1d2327]">{comment.author_name}</p>
                                                    <p className="text-[10px] text-gray-400">{comment.author_email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-medium text-gray-600 truncate max-w-[150px]">
                                                    {comment.sermon_title || `Sermon #${comment.sermon}`}
                                                </span>
                                                <Link 
                                                    to={`/emission/${comment.sermon_slug}`} 
                                                    target="_blank"
                                                    className="text-[10px] text-[#2271b1] hover:underline flex items-center gap-0.5"
                                                >
                                                    Voir <ExternalLink className="w-2 h-2" />
                                                </Link>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-700 italic line-clamp-2 max-w-md">
                                                "{comment.content}"
                                            </p>
                                            <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400">
                                                <Clock className="w-3 h-3" />
                                                {new Date(comment.created_at).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                                comment.is_approved 
                                                    ? 'bg-green-50 text-green-600' 
                                                    : 'bg-amber-50 text-amber-600'
                                            }`}>
                                                {comment.is_approved ? 'Approuvé' : 'En attente'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => handleToggleApproval(comment.id, comment.is_approved)}
                                                    title={comment.is_approved ? "Désapprouver" : "Approuver"}
                                                    className={`p-2 rounded-lg transition-colors ${comment.is_approved ? 'text-amber-500 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'}`}
                                                >
                                                    <CheckCircle2 className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(comment.id)}
                                                    title="Supprimer"
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-5 h-5" />
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

export default AdminComments;
