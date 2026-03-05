import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const categories = [
    { id: 1, name: "Enseignement", slug: "enseignement", count: 15 },
    { id: 2, name: "Vie Chrétienne", slug: "vie-chretienne", count: 8 },
    { id: 3, name: "Méditation", slug: "meditation", count: 4 },
    { id: 4, name: "Guerre Spirituelle", slug: "guerre-spirituelle", count: 12 },
    { id: 5, name: "Louange", slug: "louange", count: 6 },
];

const AdminCategories = () => {
    const { t } = useTranslation();

    return (
        <AdminLayout>
            <div className="max-w-6xl">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold text-[#1d2327]">{t("admin.categories_page.title")}</h1>
                </header>

                <div className="grid lg:grid-cols-5 gap-8">
                    {/* Left Column: Add New Category form (WP Style) */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-base font-semibold text-gray-700">{t("admin.categories_page.add_new")}</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="category-name" className="block text-xs font-medium text-gray-700 mb-1">{t("admin.categories_page.name")}</label>
                                <input id="category-name" name="name" type="text" className="w-full px-3 py-1.5 bg-white border border-border text-sm focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none" />
                                <p className="text-[11px] text-gray-500 mt-1">{t("admin.categories_page.name_help")}</p>
                            </div>
                            <div>
                                <label htmlFor="category-slug" className="block text-xs font-medium text-gray-700 mb-1">{t("admin.categories_page.slug")}</label>
                                <input id="category-slug" name="slug" type="text" className="w-full px-3 py-1.5 bg-white border border-border text-sm focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none" />
                                <p className="text-[11px] text-gray-500 mt-1">{t("admin.categories_page.slug_help")}</p>
                            </div>
                            <div>
                                <label htmlFor="category-description" className="block text-xs font-medium text-gray-700 mb-1">{t("admin.categories_page.description")}</label>
                                <textarea id="category-description" name="description" rows={4} className="w-full px-3 py-1.5 bg-white border border-border text-sm focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none resize-none"></textarea>
                                <p className="text-[11px] text-gray-500 mt-1">{t("admin.categories_page.desc_help")}</p>
                            </div>
                            <Button className="bg-[#2271b1] hover:bg-[#135e96] text-white text-xs h-8">
                                {t("admin.categories_page.add_btn")}
                            </Button>
                        </div>
                    </div>

                    {/* Right Column: Category Table (WP Style) */}
                    <div className="lg:col-span-3">
                        <div className="flex items-center justify-end gap-2 mb-2">
                            <div className="relative">
                                <label htmlFor="category-search" className="sr-only">{t("admin.categories_page.search")}</label>
                                <input
                                    id="category-search"
                                    name="search"
                                    type="text"
                                    placeholder={t("admin.categories_page.search")}
                                    className="pl-8 pr-3 py-1 bg-white border border-border text-xs focus:ring-1 focus:ring-[#2271b1] outline-none w-48"
                                />
                                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                            <Button size="sm" variant="outline" className="h-7 py-0 px-3 text-[11px] bg-white">{t("admin.categories_page.search_btn")}</Button>
                        </div>

                        <div className="bg-white border border-border shadow-sm overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white border-b border-border text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        <th className="px-3 py-2 w-8"><input id="categories-input-1" name="categories-input-1" type="checkbox" aria-label={t("common.select_all")} /></th>
                                        <th className="px-3 py-2">{t("admin.categories_page.table.name")}</th>
                                        <th className="px-3 py-2">{t("admin.categories_page.table.slug")}</th>
                                        <th className="px-3 py-2 text-right">{t("admin.categories_page.table.total")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map((cat) => (
                                        <tr key={cat.id} className="border-b border-gray-100 hover:bg-[#f6f7f7] group">
                                            <td className="px-3 py-3 w-8"><input id="categories-input-2" name="categories-input-2" type="checkbox" aria-label={cat.name} /></td>
                                            <td className="px-3 py-3">
                                                <span className="text-sm font-bold text-[#2271b1] cursor-pointer hover:text-[#135e96]">{cat.name}</span>
                                                <div className="flex items-center gap-2 text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                                                    <button
                                                        className="text-[#2271b1] hover:text-[#135e96]"
                                                        onClick={() => toast.info(`${t("common.edit_of")} ${cat.name}`)}
                                                    >
                                                        {t("admin.categories_page.table.modify")}
                                                    </button>
                                                    <span>|</span>
                                                    <button
                                                        className="text-[#2271b1] hover:text-[#135e96]"
                                                        onClick={() => toast.info(`${t("common.quick_edit_of")} ${cat.name}`)}
                                                    >
                                                        {t("admin.categories_page.table.quick_edit")}
                                                    </button>
                                                    <span>|</span>
                                                    <button
                                                        className="text-red-600 hover:text-red-800"
                                                        onClick={() => toast.error(`${t("common.delete_of")} ${cat.name}`)}
                                                    >
                                                        {t("admin.categories_page.table.delete")}
                                                    </button>
                                                    <span>|</span>
                                                    <button
                                                        className="text-[#2271b1] hover:text-[#135e96]"
                                                        onClick={() => toast.info(`${t("common.view_of")} ${cat.name}`)}
                                                    >
                                                        {t("admin.categories_page.table.show")}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 text-xs text-gray-600">{cat.slug}</td>
                                            <td className="px-3 py-3 text-xs text-[#2271b1] text-right font-medium">{cat.count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminCategories;
