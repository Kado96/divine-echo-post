import { useState, useEffect } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import {
    Search,
    Plus,
    Video,
    Mic,
    Youtube,
    Trash2,
    Edit2,
    Eye,
    Loader2,
    Share2
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { apiService } from "@/lib/api";

const AdminSermons = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [sermons, setSermons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchSermons = async () => {
        try {
            setLoading(true);
            const data = await apiService.getAdminSermons();
            setSermons(Array.isArray(data) ? data : (data.results || []));
        } catch (error) {
            toast.error(t("common.error_loading"));
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSermons();
    }, []);

    const handleDelete = async (id: number, title: string) => {
        if (window.confirm(t("common.confirm_delete"))) {
            try {
                await apiService.deleteSermon(id);
                toast.success(t("common.deleted_success"));
                fetchSermons();
            } catch (error) {
                toast.error(t("common.error_deleting"));
            }
        }
    };

    const handleShare = (sermon: any, platform: 'facebook' | 'whatsapp') => {
        const url = `${window.location.origin}/sermon/${sermon.slug}`;
        const title = sermon.title;
        if (platform === 'facebook') {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
        } else if (platform === 'whatsapp') {
            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(title + " " + url)}`, '_blank');
        }
    };

    const filteredSermons = sermons.filter(s =>
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.preacher_name && s.preacher_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-[#1d2327]">📜 {t("admin.sermons_page.title")}</h1>
                        <p className="text-sm text-gray-500">{t("admin.sermons_page.desc") || "Gérez vos messages audio, vidéos et liens YouTube"}</p>
                    </div>
                    <Link to="/admin/sermons/create">
                        <Button className="bg-[#2271b1] hover:bg-blue-700 text-white w-full sm:w-auto shadow-sm">
                            <Plus className="w-5 h-5 mr-1" /> {t("admin.sermons_page.create_title")}
                        </Button>
                    </Link>
                </header>

                {/* Filtres & Recherche */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <label htmlFor="sermons-search" className="sr-only">{t("admin.sermons_page.search_placeholder")}</label>
                        <input
                            id="sermons-search"
                            name="search"
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={t("admin.sermons_page.search_placeholder")}
                            autoComplete="off"
                            className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-xl text-sm focus:ring-2 focus:ring-blue-50 outline-none shadow-sm"
                        />
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Loader2 className="w-10 h-10 animate-spin mb-4" />
                        <p>{t("common.loading")}</p>
                    </div>
                ) : filteredSermons.length === 0 ? (
                    <div className="text-center py-20 bg-white border border-dashed border-gray-200 rounded-2xl">
                        <p className="text-gray-500">{t("common.no_results")}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredSermons.map((sermon) => (
                            <div key={sermon.id} className="bg-white border border-border rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-start sm:items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                                            {sermon.content_type === "video" && <Video className="w-6 h-6 text-blue-500" />}
                                            {sermon.content_type === "audio" && <Mic className="w-6 h-6 text-purple-500" />}
                                            {sermon.content_type === "youtube" && <Youtube className="w-6 h-6 text-red-500" />}
                                            {!sermon.content_type && <Video className="w-6 h-6 text-gray-400" />}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-[#1d2327] group-hover:text-[#2271b1] leading-tight capitalize">{sermon.title}</h3>
                                                {!sermon.is_active && (
                                                    <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded">{t("admin.sermons_page.table.status_draft")}</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 font-medium">
                                                {sermon.preacher_name || t("common.unknown_author")} • <span className="text-[#2271b1]">{sermon.category_title || t("common.no_category")}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8 border-t sm:border-t-0 pt-4 sm:pt-0">
                                        <div className="text-center sm:text-right">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{t("admin.sermons_page.table.date")}</p>
                                            <p className="text-sm font-bold text-gray-700">
                                                {sermon.sermon_date ? new Date(sermon.sermon_date).toLocaleDateString() : '—'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-9 w-9 p-0 hover:bg-blue-50 text-[#2271b1]"
                                                onClick={() => navigate(`/admin/sermons/edit/${sermon.id}`)}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-9 w-9 p-0 hover:bg-gray-50 text-gray-500"
                                                onClick={() => window.open(`/sermon/${sermon.slug}`, '_blank')}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-9 w-9 p-0 hover:bg-blue-50 text-blue-600"
                                                    >
                                                        <Share2 className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleShare(sermon, 'facebook')}>
                                                        Facebook
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleShare(sermon, 'whatsapp')}>
                                                        WhatsApp
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-9 w-9 p-0 hover:bg-red-50 text-red-500"
                                                onClick={() => handleDelete(sermon.id, sermon.title)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminSermons;
