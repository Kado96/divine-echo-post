import AdminLayout from "@/components/layouts/AdminLayout";
import { Search, FileEdit, Eye, Layout, Type, Globe, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const AdminPages = () => {
    const { t } = useTranslation();

    const pages = [
        { id: 1, title: t("admin.pages_page.sections.hero"), section: t("admin.pages_page.sections.header"), lastMod: t("common.hours_ago", { count: 2 }), icon: Layout },
        { id: 2, title: t("admin.pages_page.sections.about"), section: t("admin.pages_page.sections.content"), lastMod: t("common.days_ago", { count: 1 }), icon: Type },
        { id: 5, title: t("admin.pages_page.sections.featured") || "Émissions en vedette", section: t("admin.pages_page.sections.content"), lastMod: t("common.hours_ago", { count: 5 }), icon: CheckCircle2 },
        { id: 6, title: t("admin.pages_page.sections.categories") || "Section Catégories", section: t("admin.pages_page.sections.content"), lastMod: t("common.days_ago", { count: 2 }), icon: Layout },
        { id: 7, title: t("admin.pages_page.sections.announcements") || "Section Annonces", section: t("admin.pages_page.sections.content"), lastMod: t("common.hours_ago", { count: 1 }), icon: Globe },
        { id: 8, title: t("admin.pages_page.sections.testimonials") || "Section Témoignages", section: t("admin.pages_page.sections.content"), lastMod: t("common.days_ago", { count: 4 }), icon: Type },
        { id: 3, title: t("admin.pages_page.sections.contact"), section: t("admin.pages_page.sections.footer_nav"), lastMod: t("common.days_ago", { count: 3 }), icon: Globe },
        { id: 4, title: t("admin.pages_page.sections.footer"), section: t("admin.pages_page.sections.structure"), lastMod: t("common.weeks_ago", { count: 1 }), icon: Layout },
    ];

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold text-[#1d2327]">📄 {t("admin.pages_page.title")}</h1>
                    <p className="text-sm text-gray-500">{t("admin.pages_page.desc")}</p>
                </header>

                <div className="mb-6 relative max-w-md">
                    <label htmlFor="pages-search" className="sr-only">{t("admin.pages_page.search_placeholder")}</label>
                    <input
                        id="pages-search"
                        name="search"
                        type="text"
                        placeholder={t("admin.pages_page.search_placeholder")}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pages.map((page) => (
                        <div key={page.id} className="bg-white border border-border rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between h-full">
                            <div>
                                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2271b1] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <page.icon className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-lg text-[#1d2327] mb-1">{page.title}</h3>
                                <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
                                    <span className="bg-gray-100 px-2 py-0.5 rounded-full font-bold text-gray-500 uppercase tracking-tighter">{page.section}</span>
                                    <span>•</span>
                                    <span>{page.lastMod}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-auto">
                                <Link
                                    to={`/admin/pages/edit/${page.id}`}
                                    className="flex-1 bg-[#2271b1] hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
                                >
                                    <FileEdit className="w-4 h-4" /> {t("admin.pages_page.modify_btn")}
                                </Link>
                                <button className="w-11 h-11 border border-border rounded-xl flex items-center justify-center text-gray-400 hover:text-[#2271b1] hover:border-[#2271b1] transition-all bg-white">
                                    <Eye className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 p-6 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white shrink-0">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-green-800 tracking-tight">{t("admin.pages_page.update_banner")}</p>
                        <p className="text-xs text-green-600">{t("admin.pages_page.update_banner_desc")}</p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminPages;
