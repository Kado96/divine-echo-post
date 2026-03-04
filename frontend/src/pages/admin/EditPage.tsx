import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, Save, Eye, Languages, Upload, Image as ImageIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { apiService } from "@/lib/api";
import { stripHtml } from "@/lib/utils";
import { toast } from "sonner";

const AdminEditPage = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const [activeLang, setActiveLang] = useState("fr");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<any>(null);
    const [heroPreview, setHeroPreview] = useState<string | null>(null);

    const languages = [
        { code: "fr", name: "Français" },
        { code: "en", name: "English" },
        { code: "rn", name: "Kirundi" },
        { code: "sw", name: "Swahili" }
    ];

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await apiService.getSettings();
                // Clean about_content for all languages on load
                const cleanedData = { ...data };
                Object.keys(cleanedData).forEach(key => {
                    if (key.startsWith('about_content') && typeof cleanedData[key] === 'string') {
                        cleanedData[key] = stripHtml(cleanedData[key]);
                    }
                });
                setSettings(cleanedData);
                if (cleanedData.hero_image_display) {
                    setHeroPreview(cleanedData.hero_image_display);
                }
            } catch (error) {
                toast.error("Erreur lors du chargement des paramètres");
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        try {
            setSaving(true);
            const formData = new FormData();

            // Append all settings to FormData
            Object.keys(settings).forEach(key => {
                const value = settings[key];
                if (value !== null && value !== undefined) {
                    formData.append(key, value);
                }
            });

            await apiService.updateSettings(formData);
            toast.success("Contenu mis à jour avec succès");
        } catch (error) {
            toast.error("Erreur lors de la sauvegarde");
        } finally {
            setSaving(false);
        }
    };

    const updateField = (field: string, value: string) => {
        setSettings({ ...settings, [field]: value });
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2271b1]"></div>
                </div>
            </AdminLayout>
        );
    }

    const pageTitles: Record<string, string> = {
        "1": "Accueil - Section Héro",
        "2": "Accueil - À Propos",
        "3": "Accueil - Contact & Localisation",
        "4": "Accueil - Pied de page",
        "5": "Accueil - Émissions en vedette",
        "6": "Accueil - Section Catégories",
        "7": "Accueil - Section Annonces",
        "8": "Accueil - Section Témoignages"
    };

    const pageTitle = pageTitles[id || ""] || "Modification de page";

    // Dynamic field mapping
    const getFieldValue = (key: string) => {
        const fieldName = `${key}_${activeLang}`;
        return settings?.[fieldName] || "";
    };

    const handleFieldChange = (key: string, value: string) => {
        const fieldName = `${key}_${activeLang}`;
        const cleanedValue = (key === "about_content" || key === "footer_description" || key.includes("description") || key.includes("desc")) ? stripHtml(value) : value;
        updateField(fieldName, cleanedValue);
    };

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto pb-12">
                <header className="flex flex-col gap-4 mb-8">
                    <Link to="/admin/pages" className="flex items-center gap-1 text-[#2271b1] hover:text-[#135e96] text-sm transition-colors w-fit">
                        <ChevronLeft className="w-4 h-4" />
                        <span>{t("admin.pages")}</span>
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-[#1d2327]">{pageTitle}</h1>
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <Languages className="w-3 h-3 text-[#2271b1]" />
                                {t("admin.pages_page.edit_subtitle")}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="h-8 text-xs bg-white gap-2">
                                <Eye className="w-3.5 h-3.5" /> {t("admin.categories_page.table.show")}
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                                size="sm"
                                className="h-8 text-xs bg-[#2271b1] hover:bg-[#135e96] gap-2"
                            >
                                {saving ? <span className="animate-spin h-3.5 w-3.5 border-2 border-white/20 border-t-white rounded-full" /> : <Save className="w-3.5 h-3.5" />}
                                {t("admin.settings_page.save")}
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Language Tabs */}
                <div className="flex border-b border-border mb-6 overflow-x-auto no-scrollbar">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => setActiveLang(lang.code)}
                            className={cn(
                                "px-6 py-3 text-sm font-bold transition-all border-b-2 relative",
                                activeLang === lang.code
                                    ? "border-[#2271b1] text-[#2271b1] bg-white"
                                    : "border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                            )}
                        >
                            {lang.name}
                        </button>
                    ))}
                </div>

                <div className="bg-white border border-border shadow-sm p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {id === "1" && (
                        <>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("admin.pages_page.form.subtitle")} ({activeLang.toUpperCase()})</label>
                                <input
                                    type="text"
                                    value={getFieldValue("hero_subtitle")}
                                    onChange={(e) => handleFieldChange("hero_subtitle", e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("admin.pages_page.form.main_title")} ({activeLang.toUpperCase()})</label>
                                <input
                                    type="text"
                                    value={getFieldValue("hero_title")}
                                    onChange={(e) => handleFieldChange("hero_title", e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-bold text-lg"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("admin.pages_page.form.description")} ({activeLang.toUpperCase()})</label>
                                <textarea
                                    value={getFieldValue("hero_description")}
                                    onChange={(e) => handleFieldChange("hero_description", e.target.value)}
                                    className="w-full h-32 px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm resize-none leading-relaxed"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("admin.settings_page.form.emissions")} ({activeLang.toUpperCase()})</label>
                                    <input
                                        type="text"
                                        value={getFieldValue("btn_emissions")}
                                        onChange={(e) => handleFieldChange("btn_emissions", e.target.value)}
                                        className="w-full px-4 py-2 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-xs font-bold"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("admin.settings_page.form.teachings")} ({activeLang.toUpperCase()})</label>
                                    <input
                                        type="text"
                                        value={getFieldValue("btn_teachings")}
                                        onChange={(e) => handleFieldChange("btn_teachings", e.target.value)}
                                        className="w-full px-4 py-2 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-xs font-bold"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("admin.settings_page.form.meditation")} ({activeLang.toUpperCase()})</label>
                                    <input
                                        type="text"
                                        value={getFieldValue("btn_meditation")}
                                        onChange={(e) => handleFieldChange("btn_meditation", e.target.value)}
                                        className="w-full px-4 py-2 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-xs font-bold"
                                    />
                                </div>
                            </div>

                            {/* Hero Image */}
                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Image de Fond Héro</label>
                                <div className="flex items-center gap-6">
                                    <div className="w-40 h-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden flex items-center justify-center relative group">
                                        {heroPreview ? (
                                            <img src={heroPreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="w-8 h-8 text-gray-300" />
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <input
                                            type="file"
                                            id="hero-image-upload"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setSettings({ ...settings, hero_image: file });
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => setHeroPreview(reader.result as string);
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-8 text-[11px] gap-2"
                                            onClick={() => document.getElementById('hero-image-upload')?.click()}
                                        >
                                            <Upload className="w-3.5 h-3.5" />
                                            Changer l'image
                                        </Button>
                                        <p className="text-[10px] text-gray-400">Recommandé : 1920x1080px, format JPG ou PNG</p>
                                    </div>
                                </div>
                            </div>

                            {/* Impact Stats */}
                            <div className="space-y-6 pt-6 border-t border-gray-100">
                                <h3 className="text-sm font-bold text-[#1d2327]">Statistiques d'Impact</h3>
                                <div className="grid grid-cols-1 gap-6">
                                    {[
                                        { key: "stat_emissions", valueKey: "stat_emissions_value", label: "Statistique 1" },
                                        { key: "stat_audience", valueKey: "stat_audience_value", label: "Statistique 2" },
                                        { key: "stat_languages", valueKey: "stat_languages_value", label: "Statistique 3" },
                                    ].map((stat) => (
                                        <div key={stat.key} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Valeur (ex: 120+)</label>
                                                <input
                                                    type="text"
                                                    value={settings?.[stat.valueKey] || ""}
                                                    onChange={(e) => updateField(stat.valueKey, e.target.value)}
                                                    className="w-full px-3 py-2 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-xs font-bold"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Label ({activeLang.toUpperCase()})</label>
                                                <input
                                                    type="text"
                                                    value={getFieldValue(stat.key)}
                                                    onChange={(e) => handleFieldChange(stat.key, e.target.value)}
                                                    className="w-full px-3 py-2 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-xs font-medium"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {id === "2" && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Titre À Propos ({activeLang.toUpperCase()})</label>
                                    <input
                                        type="text"
                                        value={getFieldValue("about_title")}
                                        onChange={(e) => handleFieldChange("about_title", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Accent Titre ({activeLang.toUpperCase()})</label>
                                    <input
                                        type="text"
                                        value={getFieldValue("about_title_accent")}
                                        onChange={(e) => handleFieldChange("about_title_accent", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Badge ({activeLang.toUpperCase()})</label>
                                    <input
                                        type="text"
                                        value={getFieldValue("about_badge")}
                                        onChange={(e) => handleFieldChange("about_badge", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("admin.pages_page.form.description")} ({activeLang.toUpperCase()})</label>
                                <textarea
                                    value={getFieldValue("about_content")}
                                    onChange={(e) => handleFieldChange("about_content", e.target.value)}
                                    className="w-full h-80 px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm resize-none leading-relaxed"
                                />
                            </div>
                        </div>
                    )}

                    {id === "3" && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Titre Contact ({activeLang.toUpperCase()})</label>
                                    <input
                                        type="text"
                                        value={getFieldValue("contact_title")}
                                        onChange={(e) => handleFieldChange("contact_title", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Accent Titre ({activeLang.toUpperCase()})</label>
                                    <input
                                        type="text"
                                        value={getFieldValue("contact_title_accent")}
                                        onChange={(e) => handleFieldChange("contact_title_accent", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Badge ({activeLang.toUpperCase()})</label>
                                    <input
                                        type="text"
                                        value={getFieldValue("contact_badge")}
                                        onChange={(e) => handleFieldChange("contact_badge", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description Contact ({activeLang.toUpperCase()})</label>
                                <textarea
                                    value={getFieldValue("contact_description")}
                                    onChange={(e) => handleFieldChange("contact_description", e.target.value)}
                                    className="w-full h-24 px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm resize-none leading-relaxed"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email de contact</label>
                                    <input
                                        type="email"
                                        value={settings?.contact_email || ""}
                                        onChange={(e) => updateField("contact_email", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Téléphone</label>
                                    <input
                                        type="text"
                                        value={settings?.contact_phone || ""}
                                        onChange={(e) => updateField("contact_phone", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Adresse Physique</label>
                                    <input
                                        type="text"
                                        value={settings?.contact_address || ""}
                                        onChange={(e) => updateField("contact_address", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Heures d'ouverture ({activeLang.toUpperCase()})</label>
                                    <input
                                        type="text"
                                        value={getFieldValue("contact_hours")}
                                        onChange={(e) => handleFieldChange("contact_hours", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {id === "4" && (
                        <div className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nom du Ministère / Site</label>
                                <input
                                    type="text"
                                    value={settings?.site_name || ""}
                                    onChange={(e) => updateField("site_name", e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-bold"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description Pied de page ({activeLang.toUpperCase()})</label>
                                <textarea
                                    value={getFieldValue("footer_description")}
                                    onChange={(e) => handleFieldChange("footer_description", e.target.value)}
                                    className="w-full h-32 px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm resize-none leading-relaxed"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Titre Liens Rapides ({activeLang.toUpperCase()})</label>
                                    <input
                                        type="text"
                                        value={getFieldValue("footer_quick_links_title")}
                                        onChange={(e) => handleFieldChange("footer_quick_links_title", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Titre Contact ({activeLang.toUpperCase()})</label>
                                    <input
                                        type="text"
                                        value={getFieldValue("footer_contact_title")}
                                        onChange={(e) => handleFieldChange("footer_contact_title", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Titre Réseaux Sociaux ({activeLang.toUpperCase()})</label>
                                    <input
                                        type="text"
                                        value={getFieldValue("footer_social_title")}
                                        onChange={(e) => handleFieldChange("footer_social_title", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mention Copyright ({activeLang.toUpperCase()})</label>
                                    <input
                                        type="text"
                                        value={getFieldValue("footer_copyright")}
                                        onChange={(e) => handleFieldChange("footer_copyright", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {id === "5" && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Badge ({activeLang.toUpperCase()})</label>
                                    <input
                                        type="text"
                                        value={getFieldValue("section_featured_badge")}
                                        onChange={(e) => handleFieldChange("section_featured_badge", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Accent Titre ({activeLang.toUpperCase()})</label>
                                    <input
                                        type="text"
                                        value={getFieldValue("section_featured_accent")}
                                        onChange={(e) => handleFieldChange("section_featured_accent", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Titre Principal ({activeLang.toUpperCase()})</label>
                                <input
                                    type="text"
                                    value={getFieldValue("section_featured")}
                                    onChange={(e) => handleFieldChange("section_featured", e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-bold"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description ({activeLang.toUpperCase()})</label>
                                <textarea
                                    value={getFieldValue("section_featured_desc")}
                                    onChange={(e) => handleFieldChange("section_featured_desc", e.target.value)}
                                    className="w-full h-24 px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm resize-none leading-relaxed"
                                />
                            </div>
                        </div>
                    )}

                    {id === "6" && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Titre Principal ({activeLang.toUpperCase()})</label>
                                    <input
                                        type="text"
                                        value={getFieldValue("section_categories")}
                                        onChange={(e) => handleFieldChange("section_categories", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-bold"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Accent Titre ({activeLang.toUpperCase()})</label>
                                    <input
                                        type="text"
                                        value={getFieldValue("section_categories_accent")}
                                        onChange={(e) => handleFieldChange("section_categories_accent", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description ({activeLang.toUpperCase()})</label>
                                <textarea
                                    value={getFieldValue("section_categories_desc")}
                                    onChange={(e) => handleFieldChange("section_categories_desc", e.target.value)}
                                    className="w-full h-24 px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm resize-none leading-relaxed"
                                />
                            </div>
                        </div>
                    )}

                    {id === "7" && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Badge ({activeLang.toUpperCase()})</label>
                                    <input
                                        type="text"
                                        value={getFieldValue("section_announcements_badge")}
                                        onChange={(e) => handleFieldChange("section_announcements_badge", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Accent Titre ({activeLang.toUpperCase()})</label>
                                    <input
                                        type="text"
                                        value={getFieldValue("section_announcements_accent")}
                                        onChange={(e) => handleFieldChange("section_announcements_accent", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Titre Principal ({activeLang.toUpperCase()})</label>
                                <input
                                    type="text"
                                    value={getFieldValue("section_announcements_title")}
                                    onChange={(e) => handleFieldChange("section_announcements_title", e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-bold"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description ({activeLang.toUpperCase()})</label>
                                <textarea
                                    value={getFieldValue("section_announcements_desc")}
                                    onChange={(e) => handleFieldChange("section_announcements_desc", e.target.value)}
                                    className="w-full h-24 px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm resize-none leading-relaxed"
                                />
                            </div>
                        </div>
                    )}

                    {id === "8" && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Badge ({activeLang.toUpperCase()})</label>
                                    <input
                                        type="text"
                                        value={getFieldValue("section_testimonials_badge")}
                                        onChange={(e) => handleFieldChange("section_testimonials_badge", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Accent Titre ({activeLang.toUpperCase()})</label>
                                    <input
                                        type="text"
                                        value={getFieldValue("section_testimonials_accent")}
                                        onChange={(e) => handleFieldChange("section_testimonials_accent", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Titre Principal ({activeLang.toUpperCase()})</label>
                                <input
                                    type="text"
                                    value={getFieldValue("section_testimonials_title")}
                                    onChange={(e) => handleFieldChange("section_testimonials_title", e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-bold"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description ({activeLang.toUpperCase()})</label>
                                <textarea
                                    value={getFieldValue("section_testimonials_desc")}
                                    onChange={(e) => handleFieldChange("section_testimonials_desc", e.target.value)}
                                    className="w-full h-24 px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm resize-none leading-relaxed"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-8 p-4 bg-amber-50 border border-amber-100 rounded-lg flex items-start gap-3">
                    <span className="text-amber-500 font-bold block mt-0.5">⚠️</span>
                    <p className="text-xs text-amber-700 leading-relaxed font-medium">
                        {t("admin.pages_page.form.save_note")}
                    </p>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminEditPage;
