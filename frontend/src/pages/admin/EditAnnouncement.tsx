import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Megaphone, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { apiService } from "@/lib/api";
import { stripHtml } from "@/lib/utils";
import { toast } from "sonner";

const EditAnnouncement = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        priority: "normale",
        event_date: "",
        content: "",
        is_active: true
    });

    useEffect(() => {
        const fetchAnnouncement = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await apiService.getAnnouncementById(id);
                setFormData({
                    title: data.title || "",
                    priority: data.priority || "normale",
                    event_date: data.event_date || "",
                    content: stripHtml(data.content || ""),
                    is_active: data.is_active ?? true
                });
            } catch (error) {
                console.error("Error fetching announcement:", error);
                toast.error(t("common.error_loading"));
                navigate("/admin/announcements");
            } finally {
                setLoading(false);
            }
        };

        fetchAnnouncement();
    }, [id, t, navigate]);

    const handleSubmit = async (e: React.FormEvent, publish = true) => {
        e.preventDefault();
        if (!id) return;
        try {
            setSaving(true);
            const dataToSubmit = { ...formData, is_active: publish };
            await apiService.updateAnnouncement(id, dataToSubmit);
            toast.success(t("common.updated_success"));
            navigate("/admin/announcements");
        } catch (error: any) {
            console.error("Error updating announcement:", error);
            toast.error(error.message || t("common.error_saving"));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-[#2271b1]" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto">
                <header className="flex flex-col gap-4 mb-8">
                    <Link to="/admin/announcements" className="flex items-center gap-1 text-[#2271b1] hover:text-[#135e96] text-sm transition-colors w-fit">
                        <ChevronLeft className="w-4 h-4" />
                        <span>{t("admin.announcements_page.back")}</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-[#1d2327]">📢 {t("admin.announcements_page.create_title")} (Edit)</h1>
                </header>

                <div className="bg-white border border-border shadow-sm p-6 rounded-2xl">
                    <form className="space-y-6" onSubmit={(e) => handleSubmit(e, formData.is_active)}>
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
                                disabled={saving}
                                className="bg-[#2271b1] hover:bg-[#135e96] text-white px-8 h-12 rounded-xl font-bold"
                            >
                                {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                {t("common.saved_success")}
                            </Button>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="rounded border-gray-300 text-[#2271b1] focus:ring-[#2271b1]"
                                />
                                <label htmlFor="is_active" className="text-sm font-medium text-gray-600">
                                    {t("admin.announcements_page.filters.online")}
                                </label>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
};

export default EditAnnouncement;
