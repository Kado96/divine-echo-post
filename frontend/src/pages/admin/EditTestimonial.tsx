import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, Star, Quote, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useState, useEffect } from "react";
import { apiService } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const EditTestimonial = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState({
        author: "",
        rating: "5",
        content: "",
        language: "fr",
        status: "Nouveau"
    });

    useEffect(() => {
        const fetchTestimonial = async () => {
            if (!id) return;
            try {
                const data = await apiService.getTestimonialById(id);
                setFormData({
                    author: data.author,
                    rating: data.rating.toString(),
                    content: data.content,
                    language: data.language || "fr",
                    status: data.status
                });
            } catch (error) {
                toast.error(t("common.error_loading"));
                navigate("/admin/testimonials");
            } finally {
                setFetching(false);
            }
        };

        fetchTestimonial();
    }, [id, navigate, t]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        try {
            setLoading(true);
            await apiService.updateTestimonial(id, {
                ...formData,
                rating: parseInt(formData.rating)
            });
            toast.success(t("common.saved_success"));
            navigate("/admin/testimonials");
        } catch (error) {
            toast.error(t("common.error_saving"));
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center py-20 text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto">
                <header className="flex flex-col gap-4 mb-8">
                    <Link to="/admin/testimonials" className="flex items-center gap-1 text-[#2271b1] hover:text-[#135e96] text-sm transition-colors w-fit">
                        <ChevronLeft className="w-4 h-4" />
                        <span>{t("admin.testimonials_page.back")}</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-[#1d2327]">💬 {t("admin.testimonials_page.edit_title") || "Modifier le témoignage"}</h1>
                </header>

                <div className="bg-white border border-border shadow-sm p-6 rounded-2xl">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 uppercase">{t("admin.testimonials_page.form.author")}</label>
                                <input
                                    type="text"
                                    value={formData.author}
                                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-border rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-[#2271b1] outline-none transition-all text-sm"
                                    placeholder={t("admin.testimonials_page.form.placeholder_author")}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 uppercase">{t("admin.testimonials_page.form.rating")}</label>
                                <select
                                    value={formData.rating}
                                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-border rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-[#2271b1] outline-none transition-all text-sm"
                                >
                                    <option value="5">⭐⭐⭐⭐⭐ ({t("admin.testimonials_page.form.rating_excellent")})</option>
                                    <option value="4">⭐⭐⭐⭐ ({t("admin.testimonials_page.form.rating_very_good")})</option>
                                    <option value="3">⭐⭐⭐ ({t("admin.testimonials_page.form.rating_good")})</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 uppercase">{t("admin.sermons_page.form.language")}</label>
                                <select
                                    value={formData.language}
                                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-border rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-[#2271b1] outline-none transition-all text-sm"
                                >
                                    <option value="fr">Français</option>
                                    <option value="rn">Kirundi</option>
                                    <option value="en">English</option>
                                    <option value="sw">Kiswahili</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2 relative">
                            <label className="text-xs font-bold text-gray-700 uppercase">{t("admin.testimonials_page.form.content")}</label>
                            <div className="relative">
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full h-40 pl-10 pr-4 py-3 bg-white border border-border rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-[#2271b1] outline-none transition-all text-sm resize-none italic"
                                    placeholder={t("admin.testimonials_page.form.placeholder_content")}
                                    required
                                />
                                <Quote className="w-5 h-5 absolute left-3 top-4 text-gray-300" />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 py-2">
                            <input
                                type="checkbox"
                                id="verify"
                                className="rounded-sm"
                                checked={formData.status === "Vérifié"}
                                onChange={(e) => setFormData({ ...formData, status: e.target.checked ? "Vérifié" : "Nouveau" })}
                            />
                            <label htmlFor="verify" className="text-sm text-gray-600 cursor-pointer">{t("admin.testimonials_page.form.verify")}</label>
                        </div>

                        <div className="pt-4">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-[#2271b1] hover:bg-[#135e96] text-white px-8 h-12 rounded-xl font-bold w-full sm:w-auto"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                {t("admin.testimonials_page.form.submit")}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
};

export default EditTestimonial;
