import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Plus, Star, Trash2, CheckCircle2, User, Edit2, Loader2, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { apiService } from "@/lib/api";

const AdminTestimonials = () => {
    const { t } = useTranslation();
    const [testimonials, setTestimonials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all"); // all, new, verified
    const [langFilter, setLangFilter] = useState("all");

    const fetchTestimonials = async () => {
        try {
            setLoading(true);
            const data = await apiService.getTestimonials();
            setTestimonials(Array.isArray(data) ? data : (data.results || []));
        } catch (error) {
            toast.error(t("common.error_loading"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`${t("common.confirm_delete")} ${name}?`)) return;
        try {
            await apiService.deleteTestimonial(id);
            toast.success(t("common.deleted_success"));
            fetchTestimonials();
        } catch (error) {
            toast.error(t("common.error_deleting"));
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === "Vérifié" ? "Nouveau" : "Vérifié";
        try {
            await apiService.updateTestimonial(id, { status: newStatus });
            toast.success(t("common.updated_success"));
            fetchTestimonials();
        } catch (error) {
            toast.error(t("common.error_updating"));
        }
    };

    const filteredTestimonials = testimonials.filter(item => {
        const matchesStatus =
            filter === "all" ? true :
                filter === "new" ? item.status === "Nouveau" :
                    filter === "verified" ? item.status === "Vérifié" : true;

        const matchesLang =
            langFilter === "all" ? true :
                item.language === langFilter;

        return matchesStatus && matchesLang;
    });

    const stats = {
        all: testimonials.length,
        new: testimonials.filter(t => t.status === "Nouveau").length,
        verified: testimonials.filter(t => t.status === "Vérifié").length
    };

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-[#1d2327]">💬 {t("admin.testimonials_page.title")}</h1>
                        <p className="text-sm text-gray-500">{t("admin.testimonials_page.desc")}</p>
                    </div>
                    <Link to="/admin/testimonials/create">
                        <Button size="sm" className="bg-[#2271b1] hover:bg-[#135e96] text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            {t("admin.testimonials_page.add_btn")}
                        </Button>
                    </Link>
                </header>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border mb-8 pb-3 overflow-x-auto no-scrollbar">
                    <div className="flex items-center gap-6 text-sm font-bold">
                        <button
                            onClick={() => setFilter("all")}
                            className={`whitespace-nowrap transition-colors ${filter === "all" ? "text-[#2271b1] relative" : "text-gray-400 hover:text-gray-600"}`}
                        >
                            {t("admin.testimonials_page.filters.all")} ({stats.all})
                            {filter === "all" && <span className="absolute -bottom-3 left-0 w-full h-0.5 bg-[#2271b1]"></span>}
                        </button>
                        <button
                            onClick={() => setFilter("new")}
                            className={`whitespace-nowrap transition-colors ${filter === "new" ? "text-[#2271b1] relative" : "text-gray-400 hover:text-gray-600"}`}
                        >
                            {t("admin.testimonials_page.filters.to_verify")} ({stats.new})
                            {filter === "new" && <span className="absolute -bottom-3 left-0 w-full h-0.5 bg-[#2271b1]"></span>}
                        </button>
                        <button
                            onClick={() => setFilter("verified")}
                            className={`whitespace-nowrap transition-colors ${filter === "verified" ? "text-[#2271b1] relative" : "text-gray-400 hover:text-gray-600"}`}
                        >
                            {t("admin.testimonials_page.filters.published")} ({stats.verified})
                            {filter === "verified" && <span className="absolute -bottom-3 left-0 w-full h-0.5 bg-[#2271b1]"></span>}
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 font-medium uppercase">{t("admin.emissions_page.form.language")}:</span>
                        <select id="testimonials-select-1" name="testimonials-select-1"
                            value={langFilter}
                            onChange={(e) => setLangFilter(e.target.value)}
                            className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-1 text-xs font-bold text-[#1d2327] outline-none"
                        >
                            <option value="all">{t("categories.all")}</option>
                            <option value="fr">Français</option>
                            <option value="rn">Kirundi</option>
                            <option value="en">English</option>
                            <option value="sw">Kiswahili</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <p>{t("common.loading")}</p>
                    </div>
                ) : filteredTestimonials.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white border border-dashed border-border rounded-2xl">
                        <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                        <p className="font-medium">{t("common.no_data")}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTestimonials.map((item) => (
                            <div key={item.id} className="bg-white border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between group relative transition-all hover:scale-[1.02] hover:shadow-lg">
                                {item.status === "Vérifié" && (
                                    <div className="absolute top-4 right-4 bg-green-50 text-green-600 px-2 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> {t("admin.testimonials_page.item.verified")}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className="flex items-center gap-1 text-amber-400">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-4 h-4 ${i < item.rating ? "fill-current" : "text-gray-200"}`} />
                                        ))}
                                    </div>
                                    <p className="text-gray-700 text-sm leading-relaxed font-medium italic">"{item.content}"</p>
                                </div>

                                <div className="mt-8 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 text-[#2271b1] flex items-center justify-center font-bold shadow-inner text-sm uppercase">
                                            {item.author.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-[#1d2327]">{item.author}</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-[10px] text-gray-400">
                                                    {new Date(item.created_at).toLocaleDateString()}
                                                </p>
                                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${item.language === 'fr' ? 'bg-blue-50 text-blue-600' :
                                                    item.language === 'rn' ? 'bg-green-50 text-green-600' :
                                                        item.language === 'en' ? 'bg-purple-50 text-purple-600' :
                                                            'bg-orange-50 text-orange-600'
                                                    }`}>
                                                    {item.language === 'rn' ? 'Kirundi' :
                                                        item.language === 'sw' ? 'Swahili' :
                                                            item.language === 'en' ? 'English' : 'Français'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            title={item.status === "Vérifié" ? t("admin.testimonials_page.item.mark_as_pending") : t("admin.testimonials_page.item.mark_as_verified")}
                                            className={`p-2 rounded-lg transition-colors ${item.status === "Vérifié" ? "text-amber-500 hover:bg-amber-50" : "text-green-600 hover:bg-green-50"}`}
                                            onClick={() => handleToggleStatus(item.id, item.status)}
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                        </button>
                                        <Link to={`/admin/testimonials/edit/${item.id}`}>
                                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                        </Link>
                                        <button
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            onClick={() => handleDelete(item.id, item.author)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
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

export default AdminTestimonials;
