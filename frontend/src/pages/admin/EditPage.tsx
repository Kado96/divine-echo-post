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
import MediaPickerModal from "@/components/admin/MediaPickerModal";

const AdminEditPage = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const [activeLang, setActiveLang] = useState("fr");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<any>(null);
    const [heroPreview, setHeroPreview] = useState<string | null>(null);
    const [aboutPreview, setAboutPreview] = useState<string | null>(null);
    const [heroFile, setHeroFile] = useState<File | null>(null);
    const [aboutFile, setAboutFile] = useState<File | null>(null);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerTarget, setPickerTarget] = useState<'hero' | 'about' | null>(null);

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
                    } else if (value === null) {
                        // Explicitly send empty string to clear the image in Django
                        formData.append(key, "");
                    }
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

    const handleMediaSelect = async (fileInfo: {url: string, id: number, type: string}) => {
        try {
            const res = await fetch(fileInfo.url);
            const blob = await res.blob();
            const filename = fileInfo.url.split('/').pop() || 'image.jpg';
            const file = new File([blob], filename, { type: blob.type });

            if (pickerTarget === 'hero') {
                setSettings({ ...settings, hero_image: file });
                setHeroPreview(fileInfo.url);
                setHeroFile(file);
            } else if (pickerTarget === 'about') {
                setSettings({ ...settings, about_image: file });
                setAboutPreview(fileInfo.url);
                setAboutFile(file);
            }
        } catch (error) {
            toast.error("Erreur lors de la récupération de l'image");
        }
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
                                <label htmlFor={`hero_badge_${activeLang}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">Petit Badge (ex: Shalom Ministry, Live) ({activeLang.toUpperCase()})</label>
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
                                <label htmlFor={`hero_subtitle_${activeLang}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">Sous-titre / Message d'accroche ({activeLang.toUpperCase()})</label>
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
                                    <label htmlFor="btn_emissions" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">{t("admin.settings_page.form.emissions")} ({activeLang.toUpperCase()})</label>
                                    <input id="btn_emissions" name="btn_emissions"
                                        type="text"
                                        value={getFieldValue("btn_emissions")}
                                        onChange={(e) => handleFieldChange("btn_emissions", e.target.value)}
                                        className="w-full px-4 py-2 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-xs font-bold"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor="btn_teachings" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">{t("admin.settings_page.form.teachings")} ({activeLang.toUpperCase()})</label>
                                    <input id="btn_teachings" name="btn_teachings"
                                        type="text"
                                        value={getFieldValue("btn_teachings")}
                                        onChange={(e) => handleFieldChange("btn_teachings", e.target.value)}
                                        className="w-full px-4 py-2 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-xs font-bold"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor="btn_meditation" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">{t("admin.settings_page.form.meditation")} ({activeLang.toUpperCase()})</label>
                                    <input id="btn_meditation" name="btn_meditation"
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
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-8 text-[11px] gap-2"
                                            onClick={(e) => { e.preventDefault(); setPickerTarget('hero'); setPickerOpen(true); }}
                                        >
                                            <Upload className="w-3.5 h-3.5" />
                                            Choisir depuis la médiathèque
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
                                                <label htmlFor={stat.valueKey} className="text-[9px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">Valeur (ex: 120+)</label>
                                                <input id={stat.valueKey} name={stat.valueKey}
                                                    type="text"
                                                    value={settings?.[stat.valueKey] || ""}
                                                    onChange={(e) => updateField(stat.valueKey, e.target.value)}
                                                    className="w-full px-3 py-2 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-xs font-bold"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label htmlFor={stat.key} className="text-[9px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">Label ({activeLang.toUpperCase()})</label>
                                                <input id={stat.key} name={stat.key}
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
                                                            about_image: null
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
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-8 text-[11px] gap-2"
                                            onClick={(e) => { e.preventDefault(); setPickerTarget('about'); setPickerOpen(true); }}
                                        >
                                            <Upload className="w-3.5 h-3.5" />
                                            Choisir depuis la médiathèque
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
                             <div className="space-y-1.5">
                                 <label htmlFor={`section_testimonials_desc_${activeLang}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">Description ({activeLang.toUpperCase()})</label>
                                 <textarea id={`section_testimonials_desc_${activeLang}`} name={`section_testimonials_desc_${activeLang}`}
                                     value={getFieldValue("section_testimonials_desc")}
                                     onChange={(e) => handleFieldChange("section_testimonials_desc", e.target.value)}
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
                                    <label htmlFor={`contact_address_${activeLang}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">Adresse Physique ({activeLang.toUpperCase()})</label>
                                    <input
                                        id={`contact_address_${activeLang}`}
                                        name={`contact_address_${activeLang}`}
                                        type="text"
                                        value={getFieldValue("contact_address")}
                                        onChange={(e) => handleFieldChange("contact_address", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                        placeholder="Ville, Pays..."
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor={`contact_hours_${activeLang}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">Heures d'ouverture / Horaires ({activeLang.toUpperCase()})</label>
                                    <input
                                        id={`contact_hours_${activeLang}`}
                                        name={`contact_hours_${activeLang}`}
                                        type="text"
                                        value={getFieldValue("contact_hours")}
                                        onChange={(e) => handleFieldChange("contact_hours", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                        placeholder="Lun - Ven : 08:00 - 18:00..."
                                    />
                                </div>
                            </div>

                            {/* Réseaux Sociaux */}
                            <div className="space-y-4 pt-6 border-t border-gray-100">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                    🌐 Réseaux Sociaux
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label htmlFor="facebook_url" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer flex items-center gap-1.5">
                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                            Facebook
                                        </label>
                                        <input
                                            id="facebook_url"
                                            name="facebook_url"
                                            type="url"
                                            value={settings?.facebook_url || ""}
                                            onChange={(e) => updateField("facebook_url", e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                            placeholder="https://facebook.com/votre-page"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label htmlFor="youtube_url" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer flex items-center gap-1.5">
                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                                            YouTube
                                        </label>
                                        <input
                                            id="youtube_url"
                                            name="youtube_url"
                                            type="url"
                                            value={settings?.youtube_url || ""}
                                            onChange={(e) => updateField("youtube_url", e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                            placeholder="https://youtube.com/@votre-chaine"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label htmlFor="instagram_url" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer flex items-center gap-1.5">
                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#E4405F"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 1 0 0-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 1 1-2.882 0 1.441 1.441 0 0 1 2.882 0z"/></svg>
                                            Instagram
                                        </label>
                                        <input
                                            id="instagram_url"
                                            name="instagram_url"
                                            type="url"
                                            value={settings?.instagram_url || ""}
                                            onChange={(e) => updateField("instagram_url", e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                            placeholder="https://instagram.com/votre-compte"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label htmlFor="tiktok_url" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer flex items-center gap-1.5">
                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#000000"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
                                            TikTok
                                        </label>
                                        <input
                                            id="tiktok_url"
                                            name="tiktok_url"
                                            type="url"
                                            value={settings?.tiktok_url || ""}
                                            onChange={(e) => updateField("tiktok_url", e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                            placeholder="https://tiktok.com/@votre-compte"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {id === "4" && (
                        <div className="space-y-6">
                            <div className="space-y-1.5">
                                <label htmlFor="site_name" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">Nom du Ministère / Site</label>
                                <input id="site_name" name="site_name"
                                    type="text"
                                    value={settings?.site_name || ""}
                                    onChange={(e) => updateField("site_name", e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-bold"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor={`footer_description_${activeLang}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">Description Pied de page ({activeLang.toUpperCase()})</label>
                                <textarea id={`footer_description_${activeLang}`} name={`footer_description_${activeLang}`}
                                    value={getFieldValue("footer_description")}
                                    onChange={(e) => handleFieldChange("footer_description", e.target.value)}
                                    className="w-full h-32 px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm resize-none leading-relaxed"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label htmlFor={`footer_quick_links_title_${activeLang}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">Titre Liens Rapides ({activeLang.toUpperCase()})</label>
                                    <input id={`footer_quick_links_title_${activeLang}`} name={`footer_quick_links_title_${activeLang}`}
                                        type="text"
                                        value={getFieldValue("footer_quick_links_title")}
                                        onChange={(e) => handleFieldChange("footer_quick_links_title", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor={`footer_contact_title_${activeLang}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">Titre Contact ({activeLang.toUpperCase()})</label>
                                    <input id={`footer_contact_title_${activeLang}`} name={`footer_contact_title_${activeLang}`}
                                        type="text"
                                        value={getFieldValue("footer_contact_title")}
                                        onChange={(e) => handleFieldChange("footer_contact_title", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor={`footer_social_title_${activeLang}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">Titre Réseaux Sociaux ({activeLang.toUpperCase()})</label>
                                    <input id={`footer_social_title_${activeLang}`} name={`footer_social_title_${activeLang}`}
                                        type="text"
                                        value={getFieldValue("footer_social_title")}
                                        onChange={(e) => handleFieldChange("footer_social_title", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor={`footer_copyright_${activeLang}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">Mention Copyright ({activeLang.toUpperCase()})</label>
                                    <input id={`footer_copyright_${activeLang}`} name={`footer_copyright_${activeLang}`}
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
                                    <label htmlFor={`section_featured_badge_${activeLang}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">Badge ({activeLang.toUpperCase()})</label>
                                    <input id={`section_featured_badge_${activeLang}`} name={`section_featured_badge_${activeLang}`}
                                        type="text"
                                        value={getFieldValue("section_featured_badge")}
                                        onChange={(e) => handleFieldChange("section_featured_badge", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor={`section_featured_accent_${activeLang}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">Accent Titre ({activeLang.toUpperCase()})</label>
                                    <input id={`section_featured_accent_${activeLang}`} name={`section_featured_accent_${activeLang}`}
                                        type="text"
                                        value={getFieldValue("section_featured_accent")}
                                        onChange={(e) => handleFieldChange("section_featured_accent", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor={`section_featured_title_${activeLang}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">Titre Principal ({activeLang.toUpperCase()})</label>
                                <input id={`section_featured_title_${activeLang}`} name={`section_featured_title_${activeLang}`}
                                    type="text"
                                    value={getFieldValue("section_featured")}
                                    onChange={(e) => handleFieldChange("section_featured", e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-bold"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor={`section_featured_desc_${activeLang}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">Description ({activeLang.toUpperCase()})</label>
                                <textarea id={`section_featured_desc_${activeLang}`} name={`section_featured_desc_${activeLang}`}
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
                                    <label htmlFor={`section_categories_title_${activeLang}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">Titre Principal ({activeLang.toUpperCase()})</label>
                                    <input id={`section_categories_title_${activeLang}`} name={`section_categories_title_${activeLang}`}
                                        type="text"
                                        value={getFieldValue("section_categories")}
                                        onChange={(e) => handleFieldChange("section_categories", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-bold"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor={`section_categories_accent_${activeLang}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">Accent Titre ({activeLang.toUpperCase()})</label>
                                    <input id={`section_categories_accent_${activeLang}`} name={`section_categories_accent_${activeLang}`}
                                        type="text"
                                        value={getFieldValue("section_categories_accent")}
                                        onChange={(e) => handleFieldChange("section_categories_accent", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor={`section_categories_desc_${activeLang}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">Description ({activeLang.toUpperCase()})</label>
                                <textarea id={`section_categories_desc_${activeLang}`} name={`section_categories_desc_${activeLang}`}
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
                                    <label htmlFor={`section_announcements_badge_${activeLang}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">Badge ({activeLang.toUpperCase()})</label>
                                    <input id={`section_announcements_badge_${activeLang}`} name={`section_announcements_badge_${activeLang}`}
                                        type="text"
                                        value={getFieldValue("section_announcements_badge")}
                                        onChange={(e) => handleFieldChange("section_announcements_badge", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor={`section_announcements_accent_${activeLang}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">Accent Titre ({activeLang.toUpperCase()})</label>
                                    <input id={`section_announcements_accent_${activeLang}`} name={`section_announcements_accent_${activeLang}`}
                                        type="text"
                                        value={getFieldValue("section_announcements_accent")}
                                        onChange={(e) => handleFieldChange("section_announcements_accent", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor={`section_announcements_title_${activeLang}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">Titre Principal ({activeLang.toUpperCase()})</label>
                                <input id={`section_announcements_title_${activeLang}`} name={`section_announcements_title_${activeLang}`}
                                    type="text"
                                    value={getFieldValue("section_announcements_title")}
                                    onChange={(e) => handleFieldChange("section_announcements_title", e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-bold"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor={`section_announcements_desc_${activeLang}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">Description ({activeLang.toUpperCase()})</label>
                                <textarea id={`section_announcements_desc_${activeLang}`} name={`section_announcements_desc_${activeLang}`}
                                    value={getFieldValue("section_announcements_desc")}
                                    onChange={(handleFieldChange as any)("section_announcements_desc")}
                                    className="w-full h-24 px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm resize-none leading-relaxed"
                                />
                            </div>
                        </div>
                    )}

                    {id === "8" && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label htmlFor={`section_testimonials_badge_${activeLang}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">Badge ({activeLang.toUpperCase()})</label>
                                    <input id={`section_testimonials_badge_${activeLang}`} name={`section_testimonials_badge_${activeLang}`}
                                        type="text"
                                        value={getFieldValue("section_testimonials_badge")}
                                        onChange={(e) => handleFieldChange("section_testimonials_badge", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor={`section_testimonials_accent_${activeLang}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">Accent Titre ({activeLang.toUpperCase()})</label>
                                    <input id={`section_testimonials_accent_${activeLang}`} name={`section_testimonials_accent_${activeLang}`}
                                        type="text"
                                        value={getFieldValue("section_testimonials_accent")}
                                        onChange={(e) => handleFieldChange("section_testimonials_accent", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor={`section_testimonials_title_${activeLang}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">Titre Principal ({activeLang.toUpperCase()})</label>
                                <input id={`section_testimonials_title_${activeLang}`} name={`section_testimonials_title_${activeLang}`}
                                    type="text"
                                    value={getFieldValue("section_testimonials_title")}
                                    onChange={(e) => handleFieldChange("section_testimonials_title", e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all text-sm font-bold"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor={`section_testimonials_desc_${activeLang}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">Description ({activeLang.toUpperCase()})</label>
                                <textarea id={`section_testimonials_desc_${activeLang}`} name={`section_testimonials_desc_${activeLang}`}
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

            <MediaPickerModal 
                isOpen={pickerOpen} 
                onClose={() => setPickerOpen(false)} 
                onSelect={handleMediaSelect} 
                acceptedTypes={['image']} 
            />
        </AdminLayout>
    );
};

export default AdminEditPage;
