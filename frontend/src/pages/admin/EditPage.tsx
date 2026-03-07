import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, Save, Eye, Languages, Upload, Image as ImageIcon, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { apiService } from "@/lib/api";
import { stripHtml } from "@/lib/utils";
import { toast } from "sonner";
import TeamManagement from "@/components/admin/TeamManagement";
import { Camera } from "lucide-react";

const AdminEditPage = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const [activeLang, setActiveLang] = useState("fr");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<any>(null);
    const [heroPreview, setHeroPreview] = useState<string | null>(null);
    const [aboutPreview, setAboutPreview] = useState<string | null>(null);

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
                if (cleanedData.about_image_display) {
                    setAboutPreview(cleanedData.about_image_display);
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

            // List of image fields that should only be appended if they are File objects
            const imageFields = [
                'logo', 'hero_image', 'about_image', 'team_image', 'quote_author_image'
            ];

            // List of read-only or display fields to skip
            const skipFields = [
                'id', 'created_at', 'updated_at', 'logo_url_display',
                'hero_image_display', 'about_image_display',
                'team_image_display', 'quote_author_image_display'
            ];

            // Append all settings to FormData selectively
            Object.keys(settings).forEach(key => {
                const value = settings[key];

                // Skip read-only fields
                if (skipFields.includes(key)) return;

                // Handle image fields
                if (imageFields.includes(key)) {
                    if (value instanceof File) {
                        formData.append(key, value);
                    }
                    // If it's a string (URL) or null, we don't send it 
                    // unless it's null and we want to clear it? 
                    // Standard PATCH: skip if not changing.
                    return;
                }

                // Append everything else if not null/undefined
                if (value !== null && value !== undefined) {
                    formData.append(key, value);
                }
            });

            await apiService.updateSettings(formData);
            toast.success("Contenu mis à jour avec succès");
        } catch (error: any) {
            console.error("Save error:", error);
            if (error.data && typeof error.data === 'object') {
                const firstError = Object.values(error.data)[0];
                const msg = Array.isArray(firstError) ? firstError[0] : String(firstError);
                toast.error(`Erreur : ${msg}`);
            } else {
                toast.error("Erreur lors de la sauvegarde");
            }
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

                {/* Language Tabs - Modern Design */}
                <div className="flex items-center gap-1 bg-gray-100/50 p-1 rounded-lg w-fit mb-8 border border-gray-200/50">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => setActiveLang(lang.code)}
                            className={cn(
                                "px-6 py-2 text-xs font-bold transition-all rounded-md flex items-center gap-2",
                                activeLang === lang.code
                                    ? "bg-white text-[#2271b1] shadow-sm ring-1 ring-black/5"
                                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                            )}
                        >
                            <img
                                src={`https://flagcdn.com/w20/${lang.code === 'en' ? 'gb' : lang.code === 'rn' ? 'bi' : lang.code === 'sw' ? 'tz' : 'fr'}.png`}
                                alt=""
                                className="w-4 h-3 object-cover rounded-[1px] opacity-80"
                            />
                            {lang.name}
                        </button>
                    ))}
                </div>

                <div className="bg-white border border-border shadow-sm p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {id === "1" && (
                        <>
                            <div className="space-y-1.5">
                                <label htmlFor={`hero_badge_${activeLang}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">Badge Héro ({activeLang.toUpperCase()})</label>
                                <input
                                    id={`hero_badge_${activeLang}`}
                                    name={`hero_badge_${activeLang}`}
                                    type="text"
                                    value={getFieldValue("hero_badge")}
                                    onChange={(e) => handleFieldChange("hero_badge", e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor={`hero_subtitle_${activeLang}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">{t("admin.pages_page.form.subtitle")} ({activeLang.toUpperCase()})</label>
                                <input
                                    id={`hero_subtitle_${activeLang}`}
                                    name={`hero_subtitle_${activeLang}`}
                                    type="text"
                                    value={getFieldValue("hero_subtitle")}
                                    onChange={(e) => handleFieldChange("hero_subtitle", e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor={`hero_title_${activeLang}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">{t("admin.pages_page.form.main_title")} ({activeLang.toUpperCase()})</label>
                                <input
                                    id={`hero_title_${activeLang}`}
                                    name={`hero_title_${activeLang}`}
                                    type="text"
                                    value={getFieldValue("hero_title")}
                                    onChange={(e) => handleFieldChange("hero_title", e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-bold text-lg"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor={`hero_description_${activeLang}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">{t("admin.pages_page.form.description")} ({activeLang.toUpperCase()})</label>
                                <textarea
                                    id={`hero_description_${activeLang}`}
                                    name={`hero_description_${activeLang}`}
                                    value={getFieldValue("hero_description")}
                                    onChange={(e) => handleFieldChange("hero_description", e.target.value)}
                                    className="w-full h-32 px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm resize-none leading-relaxed"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("admin.settings_page.form.emissions")} ({activeLang.toUpperCase()})</label>
                                    <input id="editpage-input-4" name="editpage-input-4"
                                        type="text"
                                        value={getFieldValue("btn_emissions")}
                                        onChange={(e) => handleFieldChange("btn_emissions", e.target.value)}
                                        className="w-full px-4 py-2 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-xs font-bold"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("admin.settings_page.form.teachings")} ({activeLang.toUpperCase()})</label>
                                    <input id="editpage-input-5" name="editpage-input-5"
                                        type="text"
                                        value={getFieldValue("btn_teachings")}
                                        onChange={(e) => handleFieldChange("btn_teachings", e.target.value)}
                                        className="w-full px-4 py-2 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-xs font-bold"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("admin.settings_page.form.meditation")} ({activeLang.toUpperCase()})</label>
                                    <input id="editpage-input-6" name="editpage-input-6"
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
                                            <div className="relative w-full h-full">
                                                <img src={heroPreview} alt="Preview" className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => {
                                                        setSettings({ ...settings, hero_image: null });
                                                        setHeroPreview(null);
                                                    }}
                                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                                                    title="Supprimer l'image"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
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
                                                <input id="editpage-input-7" name="editpage-input-7"
                                                    type="text"
                                                    value={settings?.[stat.valueKey] || ""}
                                                    onChange={(e) => updateField(stat.valueKey, e.target.value)}
                                                    className="w-full px-3 py-2 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-xs font-bold"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Label ({activeLang.toUpperCase()})</label>
                                                <input id="editpage-input-8" name="editpage-input-8"
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
                                    <label htmlFor={`about_title_${activeLang}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">Titre À Propos ({activeLang.toUpperCase()})</label>
                                    <input
                                        id={`about_title_${activeLang}`}
                                        name={`about_title_${activeLang}`}
                                        type="text"
                                        value={getFieldValue("about_title")}
                                        onChange={(e) => handleFieldChange("about_title", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor={`about_title_accent_${activeLang}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">Accent Titre ({activeLang.toUpperCase()})</label>
                                    <input
                                        id={`about_title_accent_${activeLang}`}
                                        name={`about_title_accent_${activeLang}`}
                                        type="text"
                                        value={getFieldValue("about_title_accent")}
                                        onChange={(e) => handleFieldChange("about_title_accent", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor={`about_badge_${activeLang}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">Badge ({activeLang.toUpperCase()})</label>
                                    <input
                                        id={`about_badge_${activeLang}`}
                                        name={`about_badge_${activeLang}`}
                                        type="text"
                                        value={getFieldValue("about_badge")}
                                        onChange={(e) => handleFieldChange("about_badge", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                            </div>

                            {/* About Image */}
                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Image Principale À Propos</label>
                                <div className="flex items-center gap-6">
                                    <div className="w-40 h-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden flex items-center justify-center relative">
                                        {aboutPreview ? (
                                            <div className="relative w-full h-full group">
                                                <img
                                                    src={aboutPreview}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    onClick={() => {
                                                        setSettings({
                                                            ...settings,
                                                            about_image: null,
                                                            about_image_display: null
                                                        });
                                                        setAboutPreview(null);
                                                    }}
                                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                                                    title="Supprimer l'image"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <ImageIcon className="w-8 h-8 text-gray-300" />
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <input
                                            type="file"
                                            id="about-image-upload"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setSettings({ ...settings, about_image: file });
                                                    setAboutPreview(URL.createObjectURL(file));
                                                }
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-8 text-[11px] gap-2"
                                            onClick={() => document.getElementById('about-image-upload')?.click()}
                                        >
                                            <Upload className="w-3.5 h-3.5" />
                                            Changer l'image
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor={`about_content_${activeLang}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">{t("admin.pages_page.form.description")} ({activeLang.toUpperCase()})</label>
                                <textarea
                                    id={`about_content_${activeLang}`}
                                    name={`about_content_${activeLang}`}
                                    value={getFieldValue("about_content")}
                                    onChange={(e) => handleFieldChange("about_content", e.target.value)}
                                    className="w-full h-40 px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm resize-none leading-relaxed"
                                />
                            </div>

                            <div className="pt-6 border-t border-gray-100 space-y-4">
                                <h3 className="text-sm font-bold text-[#1d2327]">Points clés (Cards)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { id: "1", label: "Point Clé 1", key: "about_feature1" },
                                        { id: "2", label: "Point Clé 2", key: "about_feature2" },
                                        { id: "3", label: "Point Clé 3", key: "about_feature3" },
                                        { id: "4", label: "Point Clé 4", key: "about_feature4" },
                                    ].map((feat) => (
                                        <div key={feat.id} className="space-y-1.5">
                                            <label htmlFor={`${feat.key}_${activeLang}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">{feat.label} ({activeLang.toUpperCase()})</label>
                                            <input
                                                id={`${feat.key}_${activeLang}`}
                                                name={`${feat.key}_${activeLang}`}
                                                type="text"
                                                value={getFieldValue(feat.key)}
                                                onChange={(e) => handleFieldChange(feat.key, e.target.value)}
                                                className="w-full px-4 py-2 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-xs font-medium"
                                                placeholder={`${feat.key}...`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Section Gestion d'équipe */}
                            <TeamManagement activeLang={activeLang} />
                        </div>
                    )}

                    {id === "3" && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label htmlFor={`contact_title_${activeLang}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">Titre Contact ({activeLang.toUpperCase()})</label>
                                    <input
                                        id={`contact_title_${activeLang}`}
                                        name={`contact_title_${activeLang}`}
                                        type="text"
                                        value={getFieldValue("contact_title")}
                                        onChange={(e) => handleFieldChange("contact_title", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor={`contact_title_accent_${activeLang}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">Accent Titre ({activeLang.toUpperCase()})</label>
                                    <input
                                        id={`contact_title_accent_${activeLang}`}
                                        name={`contact_title_accent_${activeLang}`}
                                        type="text"
                                        value={getFieldValue("contact_title_accent")}
                                        onChange={(e) => handleFieldChange("contact_title_accent", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor={`contact_badge_${activeLang}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">Badge ({activeLang.toUpperCase()})</label>
                                    <input
                                        id={`contact_badge_${activeLang}`}
                                        name={`contact_badge_${activeLang}`}
                                        type="text"
                                        value={getFieldValue("contact_badge")}
                                        onChange={(e) => handleFieldChange("contact_badge", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor={`contact_description_${activeLang}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">Description Contact ({activeLang.toUpperCase()})</label>
                                <textarea
                                    id={`contact_description_${activeLang}`}
                                    name={`contact_description_${activeLang}`}
                                    value={getFieldValue("contact_description")}
                                    onChange={(e) => handleFieldChange("contact_description", e.target.value)}
                                    className="w-full h-24 px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm resize-none leading-relaxed"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label htmlFor="contact_email" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">Email de contact</label>
                                    <input
                                        id="contact_email"
                                        name="contact_email"
                                        type="email"
                                        value={settings?.contact_email || ""}
                                        onChange={(e) => updateField("contact_email", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor="contact_phone" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">Téléphone</label>
                                    <input
                                        id="contact_phone"
                                        name="contact_phone"
                                        type="text"
                                        value={settings?.contact_phone || ""}
                                        onChange={(e) => updateField("contact_phone", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor="contact_address" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">Adresse Physique</label>
                                    <input
                                        id="contact_address"
                                        name="contact_address"
                                        type="text"
                                        value={settings?.contact_address || ""}
                                        onChange={(e) => updateField("contact_address", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor={`contact_hours_${activeLang}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">Heures d'ouverture ({activeLang.toUpperCase()})</label>
                                    <input
                                        id={`contact_hours_${activeLang}`}
                                        name={`contact_hours_${activeLang}`}
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
                                <input id="editpage-input-21" name="editpage-input-21"
                                    type="text"
                                    value={settings?.site_name || ""}
                                    onChange={(e) => updateField("site_name", e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-bold"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description Pied de page ({activeLang.toUpperCase()})</label>
                                <textarea id="editpage-textarea-22" name="editpage-textarea-22"
                                    value={getFieldValue("footer_description")}
                                    onChange={(e) => handleFieldChange("footer_description", e.target.value)}
                                    className="w-full h-32 px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm resize-none leading-relaxed"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Titre Liens Rapides ({activeLang.toUpperCase()})</label>
                                    <input id="editpage-input-23" name="editpage-input-23"
                                        type="text"
                                        value={getFieldValue("footer_quick_links_title")}
                                        onChange={(e) => handleFieldChange("footer_quick_links_title", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Titre Contact ({activeLang.toUpperCase()})</label>
                                    <input id="editpage-input-24" name="editpage-input-24"
                                        type="text"
                                        value={getFieldValue("footer_contact_title")}
                                        onChange={(e) => handleFieldChange("footer_contact_title", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Titre Réseaux Sociaux ({activeLang.toUpperCase()})</label>
                                    <input id="editpage-input-25" name="editpage-input-25"
                                        type="text"
                                        value={getFieldValue("footer_social_title")}
                                        onChange={(e) => handleFieldChange("footer_social_title", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mention Copyright ({activeLang.toUpperCase()})</label>
                                    <input id="editpage-input-26" name="editpage-input-26"
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
                                    <input id="editpage-input-27" name="editpage-input-27"
                                        type="text"
                                        value={getFieldValue("section_featured_badge")}
                                        onChange={(e) => handleFieldChange("section_featured_badge", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Accent Titre ({activeLang.toUpperCase()})</label>
                                    <input id="editpage-input-28" name="editpage-input-28"
                                        type="text"
                                        value={getFieldValue("section_featured_accent")}
                                        onChange={(e) => handleFieldChange("section_featured_accent", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Titre Principal ({activeLang.toUpperCase()})</label>
                                <input id="editpage-input-29" name="editpage-input-29"
                                    type="text"
                                    value={getFieldValue("section_featured")}
                                    onChange={(e) => handleFieldChange("section_featured", e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-bold"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description ({activeLang.toUpperCase()})</label>
                                <textarea id="editpage-textarea-30" name="editpage-textarea-30"
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
                                    <input id="editpage-input-31" name="editpage-input-31"
                                        type="text"
                                        value={getFieldValue("section_categories")}
                                        onChange={(e) => handleFieldChange("section_categories", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-bold"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Accent Titre ({activeLang.toUpperCase()})</label>
                                    <input id="editpage-input-32" name="editpage-input-32"
                                        type="text"
                                        value={getFieldValue("section_categories_accent")}
                                        onChange={(e) => handleFieldChange("section_categories_accent", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description ({activeLang.toUpperCase()})</label>
                                <textarea id="editpage-textarea-33" name="editpage-textarea-33"
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
                                    <input id="editpage-input-34" name="editpage-input-34"
                                        type="text"
                                        value={getFieldValue("section_announcements_badge")}
                                        onChange={(e) => handleFieldChange("section_announcements_badge", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Accent Titre ({activeLang.toUpperCase()})</label>
                                    <input id="editpage-input-35" name="editpage-input-35"
                                        type="text"
                                        value={getFieldValue("section_announcements_accent")}
                                        onChange={(e) => handleFieldChange("section_announcements_accent", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Titre Principal ({activeLang.toUpperCase()})</label>
                                <input id="editpage-input-36" name="editpage-input-36"
                                    type="text"
                                    value={getFieldValue("section_announcements_title")}
                                    onChange={(e) => handleFieldChange("section_announcements_title", e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-bold"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description ({activeLang.toUpperCase()})</label>
                                <textarea id="editpage-textarea-37" name="editpage-textarea-37"
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
                                    <input id="editpage-input-38" name="editpage-input-38"
                                        type="text"
                                        value={getFieldValue("section_testimonials_badge")}
                                        onChange={(e) => handleFieldChange("section_testimonials_badge", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Accent Titre ({activeLang.toUpperCase()})</label>
                                    <input id="editpage-input-39" name="editpage-input-39"
                                        type="text"
                                        value={getFieldValue("section_testimonials_accent")}
                                        onChange={(e) => handleFieldChange("section_testimonials_accent", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Titre Principal ({activeLang.toUpperCase()})</label>
                                <input id="editpage-input-40" name="editpage-input-40"
                                    type="text"
                                    value={getFieldValue("section_testimonials_title")}
                                    onChange={(e) => handleFieldChange("section_testimonials_title", e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-bold"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description ({activeLang.toUpperCase()})</label>
                                <textarea id="editpage-textarea-41" name="editpage-textarea-41"
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
