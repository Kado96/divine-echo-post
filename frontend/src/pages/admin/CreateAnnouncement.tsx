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
        title: "",
        priority: "normale",
        event_date: "",
        content: "",
        is_active: true
    });

    const handleSubmit = async (e: React.FormEvent, publish = true) => {
        e.preventDefault();
        try {
            setLoading(true);
            const dataToSubmit = { ...formData, is_active: publish };
            // Using the new standardized admin announcements endpoint
            await apiService.post('/announcements/admin/', dataToSubmit);
            toast.success(t("common.saved_success"));
            navigate("/admin/announcements");
        } catch (error: any) {
            console.error("Error saving announcement:", error);
            toast.error(error.message || t("common.error_saving"));
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
                    <form className="space-y-6" onSubmit={(e) => handleSubmit(e, true)}>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700 uppercase">{t("admin.announcements_page.form.title")}</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-3 bg-white border border-border rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-[#2271b1] outline-none transition-all text-sm"
                                placeholder={t("admin.announcements_page.form.placeholder_title")}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 uppercase">{t("admin.announcements_page.form.priority")}</label>
                                <select
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-border rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-[#2271b1] outline-none transition-all text-sm"
                                >
                                    <option value="normale">{t("admin.announcements_page.item.priority_normal")}</option>
                                    <option value="haute">{t("admin.announcements_page.form.priority_high_help")}</option>
                                    <option value="basse">{t("admin.announcements_page.item.priority_low") || "Basse"}</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 uppercase">{t("admin.announcements_page.form.event_date")}</label>
                                <input
                                    type="date"
                                    value={formData.event_date}
                                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-border rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-[#2271b1] outline-none transition-all text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700 uppercase">{t("admin.announcements_page.form.message")}</label>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: stripHtml(e.target.value) })}
                                className="w-full h-40 px-4 py-3 bg-white border border-border rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-[#2271b1] outline-none transition-all text-sm resize-none"
                                placeholder="..."
                                required
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
