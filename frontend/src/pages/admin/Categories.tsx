import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { useState, useEffect } from "react";
import { apiService } from "@/lib/api";
import { Loader2 } from "lucide-react";

const AdminCategories = () => {
    const { t } = useTranslation();
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [editingSlug, setEditingSlug] = useState<string | null>(null);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await apiService.getSermonCategories();
            setCategories(Array.isArray(data) ? data : (data.results || []));
        } catch (err) {
            console.error("Failed to fetch categories", err);
            toast.error(t("common.error_loading_categories"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Auto-generate slug from name (ONLY if NOT editing)
    useEffect(() => {
        if (!editingSlug) {
            const generatedSlug = name
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
            setSlug(generatedSlug);
        }
    }, [name, editingSlug]);

    const handleEditClick = (category: any) => {
        setEditingSlug(category.slug);
        setName(category.name);
        setSlug(category.slug);
        setDescription(category.description || "");
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingSlug(null);
        setName("");
        setSlug("");
        setDescription("");
    };

    const handleSaveCategory = async () => {
        if (!name.trim()) {
            toast.error(t("admin.categories_page.validation.name_required"));
            return;
        }
        try {
            setSaving(true);
            const payload = {
                name,
                slug: slug || name.toLowerCase().replace(/ /g, '-'),
                description
            };

            if (editingSlug) {
                await apiService.updateSermonCategory(editingSlug, payload);
                toast.success(t("common.saved_success"));
            } else {
                await apiService.createSermonCategory(payload);
                toast.success(t("common.saved_success"));
            }

            handleCancelEdit();
            fetchCategories();
        } catch (error: any) {
            console.error("Save error:", error);
            if (error.data && typeof error.data === 'object') {
                const firstError = Object.values(error.data)[0];
                const msg = Array.isArray(firstError) ? firstError[0] : String(firstError);
                toast.error(`Erreur : ${msg}`);
            } else {
                toast.error(error.message || t("common.error_saving"));
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteCategory = async (slug: string, catName: string) => {
        if (window.confirm(t("admin.categories_page.validation.confirm_delete", { name: catName }))) {
            try {
                await apiService.deleteSermonCategory(slug);
                toast.success(t("common.deleted_success"));
                fetchCategories();
            } catch (error: any) {
                toast.error(error.message || t("common.error_deleting"));
            }
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-6xl">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold text-[#1d2327]">📁 {t("admin.categories_page.title")}</h1>
                </header>

                <div className="grid lg:grid-cols-5 gap-8">
                    {/* Left Column: Form (Edit or Add) */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-base font-semibold text-gray-700">
                            {editingSlug ? `Modifier : ${name}` : t("admin.categories_page.add_new")}
                        </h2>
                        <div className="space-y-4 bg-white p-6 border border-border shadow-sm">
                            <div>
                                <label htmlFor="category-name" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-tight">{t("admin.categories_page.name")}</label>
                                <input
                                    id="category-name"
                                    name="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-border text-sm focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none"
                                />
                                <p className="text-[10px] text-gray-400 mt-1.5 italic font-medium">{t("admin.categories_page.name_help")}</p>
                            </div>
                            <div>
                                <label htmlFor="category-slug" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-tight">{t("admin.categories_page.slug")}</label>
                                <input
                                    id="category-slug"
                                    name="slug"
                                    type="text"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-border text-sm focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none"
                                />
                                <p className="text-[10px] text-gray-400 mt-1.5 italic font-medium">{t("admin.categories_page.slug_help")}</p>
                            </div>
                            <div>
                                <label htmlFor="category-description" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-tight">{t("admin.categories_page.description")}</label>
                                <textarea
                                    id="category-description"
                                    name="description"
                                    rows={4}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-border text-sm focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none resize-none"
                                ></textarea>
                                <p className="text-[10px] text-gray-400 mt-1.5 italic font-medium">{t("admin.categories_page.desc_help")}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button
                                    onClick={handleSaveCategory}
                                    disabled={saving}
                                    className="bg-[#2271b1] hover:bg-[#135e96] text-white px-6 py-2 rounded shadow-sm text-xs font-bold uppercase tracking-tight gap-2"
                                >
                                    {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                                    {editingSlug ? "Mettre à jour" : t("admin.categories_page.add_btn")}
                                </Button>
                                {editingSlug && (
                                    <Button
                                        onClick={handleCancelEdit}
                                        variant="outline"
                                        className="text-xs h-9 border-gray-300"
                                    >
                                        {t("common.cancel") || "Annuler"}
                                    </Button>
                                )}
                            </div>
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
                                    <tr className="bg-white border-b border-border text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        <th className="px-3 py-3 w-8"><input id="categories-list-all" type="checkbox" aria-label={t("common.select_all")} /></th>
                                        <th className="px-3 py-3">{t("admin.categories_page.table.name")}</th>
                                        <th className="px-3 py-3">{t("admin.categories_page.table.slug")}</th>
                                        <th className="px-3 py-3 text-right">{t("admin.categories_page.table.total")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={4} className="px-3 py-10 text-center">
                                                <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#2271b1]" />
                                            </td>
                                        </tr>
                                    ) : categories.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-3 py-10 text-center text-gray-400 text-sm italic">
                                                {t("common.no_data")}
                                            </td>
                                        </tr>
                                    ) : categories.map((cat) => (
                                        <tr key={cat.id} className="border-b border-gray-100 hover:bg-[#f6f7f7] group transition-colors">
                                            <td className="px-3 py-4 w-8"><input id={`cat-list-check-${cat.id}`} type="checkbox" aria-label={cat.name} /></td>
                                            <td className="px-3 py-4">
                                                <span
                                                    className="text-sm font-bold text-[#2271b1] cursor-pointer hover:text-[#135e96]"
                                                    onClick={() => handleEditClick(cat)}
                                                >
                                                    {cat.name}
                                                </span>
                                                <div className="flex items-center gap-2 text-[9px] font-black uppercase text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity mt-1.5">
                                                    <button
                                                        className="text-[#2271b1] hover:text-[#135e96] tracking-tighter"
                                                        onClick={() => handleEditClick(cat)}
                                                    >
                                                        {t("admin.categories_page.table.modify")}
                                                    </button>
                                                    <span className="text-gray-200">|</span>
                                                    <button
                                                        className="text-red-500 hover:text-red-700 tracking-tighter"
                                                        onClick={() => handleDeleteCategory(cat.slug, cat.name)}
                                                    >
                                                        {t("admin.categories_page.table.delete")}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-3 py-4 text-xs font-medium text-gray-500">{cat.slug}</td>
                                            <td className="px-3 py-4 text-xs text-[#2271b1] text-right font-black">{cat.count || 0}</td>
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
