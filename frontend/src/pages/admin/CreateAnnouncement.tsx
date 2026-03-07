import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Megaphone, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { apiService } from "@/lib/api";
import { stripHtml } from "@/lib/utils";
import { toast } from "sonner";

const CreateAnnouncement = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title_fr: "",
        title_en: "",
        title_rn: "",
        title_sw: "",
        content_fr: "",
        content_en: "",
        content_rn: "",
        content_sw: "",
        priority: "normale",
        event_date: "",
        is_active: true
    });

    const [activeTab, setActiveTab] = useState('fr');

    const handleSubmit = async (e: React.FormEvent, publish = true) => {
        e.preventDefault();
        if (!formData.title_fr) {
            toast.error(t("admin.announcements_page.validation.title_fr_required"));
            return;
        }
        if (!formData.content_fr.trim()) {
            toast.error(t("admin.announcements_page.validation.content_fr_required"));
            return;
        }
        try {
            setLoading(true);
            const dataToSubmit = {
                ...formData,
                is_active: publish,
                event_date: formData.event_date || null
            };
            // Using the new standardized admin announcements endpoint
            await apiService.post('/announcements/admin/', dataToSubmit);
            toast.success(t("common.saved_success"));
            navigate("/admin/announcements");
        } catch (error: any) {
            console.error("Error saving announcement:", error);
            if (error.data && typeof error.data === 'object') {
                const firstError = Object.values(error.data)[0];
                const msg = Array.isArray(firstError) ? firstError[0] : String(firstError);
                toast.error(`Erreur : ${msg}`);
            } else {
                toast.error(error.message || t("common.error_saving"));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto">
                <header className="flex flex-col gap-4 mb-8">
                    <Link to="/admin/announcements" className="flex items-center gap-1 text-[#2271b1] hover:text-[#135e96] text-sm transition-colors w-fit">
                        <ChevronLeft className="w-4 h-4" />
                        <span>{t("admin.announcements_page.back")}</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-[#1d2327]">📢 {t("admin.announcements_page.create_title")}</h1>
                </header>

                <div className="bg-white border border-border shadow-sm p-6 rounded-2xl">
                    <div className="flex gap-2 mb-6 border-b border-gray-100 pb-4">
                        {[
                            { id: 'fr', label: 'Français' },
                            { id: 'rn', label: 'Kirundi' },
                            { id: 'en', label: 'English' },
                            { id: 'sw', label: 'Kiswahili' }
                        ].map((lang) => (
                            <button
                                key={lang.id}
                                type="button"
                                onClick={() => setActiveTab(lang.id)}
                                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === lang.id ? 'bg-[#2271b1] text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                            >
                                {lang.label}
                            </button>
                        ))}
                    </div>

                    <form className="space-y-6" onSubmit={(e) => handleSubmit(e, true)}>
                        {/* Dynamic Title based on Active Tab */}
                        <div className="space-y-2">
                            <label htmlFor={`title-${activeTab}`} className="text-xs font-bold text-gray-700 uppercase cursor-pointer">
                                {t("admin.announcements_page.form.title")} ({activeTab.toUpperCase()})
                            </label>
                            <input
                                id={`title-${activeTab}`}
                                name={`title_${activeTab}`}
                                type="text"
                                value={formData[`title_${activeTab}` as keyof typeof formData] as string}
                                onChange={(e) => setFormData({ ...formData, [`title_${activeTab}`]: e.target.value })}
                                className="w-full px-4 py-3 bg-white border border-border rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-[#2271b1] outline-none transition-all text-sm"
                                placeholder={t("admin.announcements_page.form.placeholder_title")}
                                required={activeTab === 'fr'}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="priority" className="text-xs font-bold text-gray-700 uppercase cursor-pointer">{t("admin.announcements_page.form.priority")}</label>
                                <select
                                    id="priority"
                                    name="priority"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-border rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-[#2271b1] outline-none transition-all text-sm"
                                >
                                    <option value="normale">{t("admin.announcements_page.item.priority_normal")}</option>
                                    <option value="haute">{t("admin.announcements_page.item.priority_high")}</option>
                                    <option value="basse">{t("admin.announcements_page.item.priority_low")}</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="event_date" className="text-xs font-bold text-gray-700 uppercase cursor-pointer">{t("admin.announcements_page.form.event_date")}</label>
                                <input
                                    id="event_date"
                                    name="event_date"
                                    type="date"
                                    value={formData.event_date}
                                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-border rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-[#2271b1] outline-none transition-all text-sm"
                                />
                            </div>
                        </div>

                        {/* Dynamic Content based on Active Tab */}
                        <div className="space-y-2">
                            <label htmlFor={`content-${activeTab}`} className="text-xs font-bold text-gray-700 uppercase cursor-pointer">
                                {t("admin.announcements_page.form.message")} ({activeTab.toUpperCase()})
                            </label>
                            <textarea
                                id={`content-${activeTab}`}
                                name={`content_${activeTab}`}
                                value={formData[`content_${activeTab}` as keyof typeof formData] as string}
                                onChange={(e) => setFormData({ ...formData, [`content_${activeTab}`]: e.target.value })}
                                className="w-full h-40 px-4 py-3 bg-white border border-border rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-[#2271b1] outline-none transition-all text-sm resize-none"
                                placeholder="..."
                                required={activeTab === 'fr'}
                            />
                        </div>

                        <div className="pt-4 flex items-center gap-4">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-[#2271b1] hover:bg-[#135e96] text-white px-8 h-12 rounded-xl font-bold"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                {t("admin.announcements_page.form.submit")}
                            </Button>
                            <button
                                type="button"
                                onClick={(e) => handleSubmit(e as any, false)}
                                disabled={loading}
                                className="text-sm font-bold text-gray-400 hover:text-gray-600"
                            >
                                {t("admin.sermons_page.form.save_draft")}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
};

export default CreateAnnouncement;
