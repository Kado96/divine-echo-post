import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Search, Megaphone, Calendar, Clock, Edit2, Trash2, Plus, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { apiService } from "@/lib/api";

const AdminAnnouncements = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const data = await apiService.getAdminAnnouncements();
            setAnnouncements(Array.isArray(data) ? data : (data.results || []));
        } catch (error) {
            toast.error(t("common.error_loading"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const handleDelete = async (id: number, title: string) => {
        if (!confirm(`${t("common.confirm_delete")} "${title}"?`)) return;
        try {
            await apiService.deleteAnnouncement(id);
            toast.success(t("common.deleted_success"));
            fetchAnnouncements();
        } catch (error) {
            toast.error(t("common.error_deleting"));
        }
    };

    const filteredAnnouncements = announcements.filter(item => {
        const titleToSearch = (item.title_fr || item.title || "").toLowerCase();
        const matchesSearch = titleToSearch.includes(searchTerm.toLowerCase());
        if (filter === "online") return item.is_active && matchesSearch;
        if (filter === "drafts") return !item.is_active && matchesSearch;
        return matchesSearch;
    });

    const stats = {
        all: announcements.length,
        online: announcements.filter(a => a.is_active).length,
        drafts: announcements.filter(a => !a.is_active).length
    };

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-[#1d2327]">📢 {t("admin.announcements_page.title")}</h1>
                        <p className="text-sm text-gray-500">{t("admin.announcements_page.desc")}</p>
                    </div>
                    <Link to="/admin/announcements/create">
                        <Button size="sm" className="bg-[#2271b1] hover:bg-[#135e96] text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            {t("admin.announcements_page.add_btn")}
                        </Button>
                    </Link>
                </header>

                {/* Filtres simples */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4 text-sm font-medium">
                        <button
                            onClick={() => setFilter("all")}
                            className={`pb-1 transition-colors ${filter === "all" ? "text-[#2271b1] border-b-2 border-[#2271b1]" : "text-gray-500 hover:text-[#2271b1]"}`}
                        >
                            {t("admin.announcements_page.filters.all")} ({stats.all})
                        </button>
                        <button
                            onClick={() => setFilter("online")}
                            className={`pb-1 transition-colors ${filter === "online" ? "text-[#2271b1] border-b-2 border-[#2271b1]" : "text-gray-500 hover:text-[#2271b1]"}`}
                        >
                            {t("admin.announcements_page.filters.online")} ({stats.online})
                        </button>
                        <button
                            onClick={() => setFilter("drafts")}
                            className={`pb-1 transition-colors ${filter === "drafts" ? "text-[#2271b1] border-b-2 border-[#2271b1]" : "text-gray-500 hover:text-[#2271b1]"}`}
                        >
                            {t("admin.announcements_page.filters.drafts")} ({stats.drafts})
                        </button>
                    </div>
                    <div className="relative w-full sm:w-64">
                        <label htmlFor="announcements-search" className="sr-only">{t("admin.announcements_page.filters.search_placeholder")}</label>
                        <input
                            id="announcements-search"
                            name="search"
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={t("admin.announcements_page.filters.search_placeholder")}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-[#2271b1] outline-none"
                        />
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>

                {/* Liste Responsive */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-[#2271b1]" />
                    </div>
                ) : filteredAnnouncements.length === 0 ? (
                    <div className="bg-white border border-dashed border-border rounded-xl p-20 text-center">
                        <p className="text-gray-400 font-medium">{t("common.no_results")}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredAnnouncements.map((item) => (
                            <div key={item.id} className="bg-white border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow group flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center ${item.priority === "haute" ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                                        <Megaphone className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3
                                                className="font-bold text-[#1d2327] hover:text-[#2271b1] cursor-pointer"
                                                onClick={() => navigate(`/admin/announcements/edit/${item.id}`)}
                                            >
                                                {item.title_fr || item.title}
                                            </h3>
                                            <div className="flex gap-1">
                                                {['fr', 'rn', 'en', 'sw'].map(lang => (
                                                    item[`title_${lang}`] && (
                                                        <span key={lang} className="text-[8px] bg-gray-100 text-gray-500 px-1 rounded uppercase">
                                                            {lang}
                                                        </span>
                                                    )
                                                ))}
                                            </div>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${item.priority === "haute" ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                                {item.priority === "haute" ? t("admin.announcements_page.item.priority_high") : t("admin.announcements_page.item.priority_normal")}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" /> {t("admin.announcements_page.item.event_date")} {item.event_date || 'N/A'}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {t("admin.announcements_page.item.status")} {item.is_active ? t("admin.announcements_page.item.status_published") : t("admin.announcements_page.item.status_draft")}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity self-end md:self-center">
                                    <Link to={`/admin/announcements/edit/${item.id}`}>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                                        onClick={() => handleDelete(item.id, item.title)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminAnnouncements;
