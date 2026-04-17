import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Globe, Upload, Image as ImageIcon, Save, Loader2, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { apiService } from "@/lib/api";
import { toast } from "sonner";
import MediaPickerModal from "@/components/admin/MediaPickerModal";

const AdminSettings = () => {
    const { t, i18n } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<any>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [quoteAuthorPreview, setQuoteAuthorPreview] = useState<string | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [quoteFile, setQuoteFile] = useState<File | null>(null);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerTarget, setPickerTarget] = useState<'logo' | 'quote' | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const quoteAuthorFileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await apiService.getSettings();
                setSettings(data);
                if (data.logo_url_display || data.logo) {
                    setLogoPreview(data.logo_url_display || data.logo);
                }
                if (data.quote_author_image_display) {
                    setQuoteAuthorPreview(data.quote_author_image_display);
                }
            } catch (error) {
                toast.error("Erreur lors du chargement des paramètres");
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleQuoteAuthorPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setQuoteFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setQuoteAuthorPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleMediaSelect = async (fileInfo: {url: string, id: number, type: string}) => {
        try {
            const res = await fetch(fileInfo.url);
            const blob = await res.blob();
            const filename = fileInfo.url.split('/').pop() || 'image.jpg';
            const file = new File([blob], filename, { type: blob.type });

            if (pickerTarget === 'logo') {
                setLogoFile(file);
                setLogoPreview(fileInfo.url);
            } else if (pickerTarget === 'quote') {
                setQuoteFile(file);
                setQuoteAuthorPreview(fileInfo.url);
            }
        } catch (error) {
            toast.error("Erreur lors de la récupération de l'image");
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('site_name', settings.site_name || '');
            formData.append('description', settings.description || '');
            formData.append('ticker_enabled', String(settings.ticker_enabled ?? true));
            formData.append('ticker_speed', String(settings.ticker_speed || 30));
            formData.append('ticker_refresh_interval', String(settings.ticker_refresh_interval || 3600));
            formData.append('ticker_bg_color', settings.ticker_bg_color || "#e60000");
            formData.append('ticker_opacity', String(settings.ticker_opacity ?? 100));

            // Verset / Citation fields
            formData.append('quote_text_fr', settings.quote_text_fr || '');
            formData.append('quote_author_name_fr', settings.quote_author_name_fr || '');
            formData.append('quote_author_subtitle_fr', settings.quote_author_subtitle_fr || '');

            const file = logoFile || fileInputRef.current?.files?.[0];
            if (file) {
                formData.append('logo', file);
            }

            const authorFile = quoteFile || quoteAuthorFileInputRef.current?.files?.[0];
            if (authorFile) {
                formData.append('quote_author_image', authorFile);
            }

            await apiService.updateSettings(formData);
            toast.success("Paramètres enregistrés avec succès");
        } catch (error: any) {
            console.error("Save error:", error);
            if (error.data && typeof error.data === 'object') {
                const firstError = Object.values(error.data)[0];
                const msg = Array.isArray(firstError) ? firstError[0] : String(firstError);
                toast.error(`Erreur : ${msg}`);
            } else {
                toast.error("Erreur lors de l'enregistrement");
            }
        } finally {
            setSaving(false);
        }
    };

    const languages = [
        { code: 'fr', name: 'Français' },
        { code: 'en', name: 'English' },
        { code: 'rn', name: 'Kirundi' },
        { code: 'sw', name: 'Swahili' },
    ];

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin text-[#2271b1]" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="max-w-4xl">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-[#1d2327]">{t("admin.settings_page.title")}</h1>
                        <p className="text-sm text-gray-500 mt-1">{t("admin.settings_page.subtitle")}</p>
                    </div>
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-[#2271b1] hover:bg-[#135e96] text-white text-xs h-9 px-6 gap-2"
                    >
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        {t("admin.settings_page.save")}
                    </Button>
                </header>

                <div className="bg-white border border-border shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <tbody>
                            {/* Site Language Setting */}
                            <tr className="border-b border-gray-100">
                                <th className="px-6 py-5 w-1/3 text-sm font-semibold text-gray-700 bg-gray-50/50">
                                    <label htmlFor="admin-lang-select">{t("admin.settings_page.site_lang")}</label>
                                </th>
                                <td className="px-6 py-5">
                                    <div className="flex flex-col gap-3">
                                        <select
                                            id="admin-lang-select"
                                            name="admin_language"
                                            value={i18n.language}
                                            onChange={(e) => changeLanguage(e.target.value)}
                                            className="w-full max-w-xs px-3 py-1.5 bg-white border border-border text-sm focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none"
                                        >
                                            {languages.map(lang => (
                                                <option key={lang.code} value={lang.code}>{lang.name}</option>
                                            ))}
                                        </select>
                                        <p className="text-[11px] text-gray-500">
                                            {t("admin.settings_page.lang_help")}
                                        </p>
                                    </div>
                                </td>
                            </tr>

                            {/* Site Title */}
                            <tr className="border-b border-gray-100">
                                <th className="px-6 py-5 w-1/3 text-sm font-semibold text-gray-700 bg-gray-50/50">
                                    <label htmlFor="site-title-input">{t("admin.settings_page.site_title")}</label>
                                </th>
                                <td className="px-6 py-5">
                                    <input
                                        type="text"
                                        id="site-title-input"
                                        name="site_title"
                                        value={settings?.site_name || ""}
                                        onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                                        className="w-full max-w-md px-3 py-1.5 bg-white border border-border text-sm focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none"
                                    />
                                </td>
                            </tr>

                            {/* Tagline / Description */}
                            <tr className="border-b border-gray-100">
                                <th className="px-6 py-5 w-1/3 text-sm font-semibold text-gray-700 bg-gray-50/50">
                                    <label htmlFor="site-description-input">{t("admin.settings_page.slogan")}</label>
                                </th>
                                <td className="px-6 py-5">
                                    <input
                                        type="text"
                                        id="site-description-input"
                                        name="description"
                                        value={settings?.description || ""}
                                        onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                                        className="w-full max-w-md px-3 py-1.5 bg-white border border-border text-sm focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none"
                                    />
                                    <p className="text-[11px] text-gray-500 mt-1">{t("admin.settings_page.slogan_help")}</p>
                                </td>
                            </tr>

                            {/* Logo Upload */}
                            <tr className="border-b border-gray-100">
                                <th className="px-6 py-5 w-1/3 text-sm font-semibold text-gray-700 bg-gray-50/50">
                                    <span>{t("admin.settings_page.logo_section")}</span>
                                </th>
                                <td className="px-6 py-5">
                                    <div className="flex items-start gap-6">
                                        <div className="flex flex-col gap-2">
                                            <div className="w-24 h-24 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center bg-gray-50 overflow-hidden group relative">
                                                {logoPreview ? (
                                                    <img src={logoPreview} alt="Preview" className="w-full h-full object-contain" />
                                                ) : (
                                                    <ImageIcon className="w-8 h-8 text-gray-300" />
                                                )}
                                            </div>
                                            <p className="text-[10px] text-gray-400 text-center italic">{t("admin.settings_page.logo_preview")}</p>
                                        </div>
                                        <div className="flex flex-col gap-3 pt-1">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleLogoChange}
                                                accept="image/*"
                                                className="hidden"
                                                id="logo-upload"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="h-8 text-[11px] border-gray-200 hover:border-[#2271b1] hover:text-[#2271b1] transition-all gap-2"
                                                onClick={() => { setPickerTarget('logo'); setPickerOpen(true); }}
                                            >
                                                <ImageIcon className="w-3 h-3" />
                                                Choisir depuis la médiathèque
                                            </Button>
                                            <p className="text-[11px] text-gray-500 leading-relaxed max-w-xs">
                                                {t("admin.settings_page.logo_help")}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                            </tr>

                            {/* Gospel Quote / Verset du jour Section */}
                            <tr className="border-b border-gray-100 bg-blue-50/20">
                                <th className="px-6 py-8 w-1/3 text-sm font-semibold text-gray-700 bg-blue-50/50 flex flex-col items-start gap-1">
                                    <h3 className="text-[#2271b1] font-bold">📖 {t("admin.settings_page.verse_section") || "Verset du Jour / Citation"}</h3>
                                    <p className="text-[11px] font-normal text-blue-600/70">{t("admin.settings_page.verse_help") || "Gérez la parole affichée sur la page d'accueil."}</p>
                                </th>
                                <td className="px-6 py-8">
                                    <div className="space-y-6">
                                        {/* Verse Text */}
                                        <div className="space-y-2">
                                            <label htmlFor="quote-text-fr" className="text-xs font-bold text-gray-400 uppercase cursor-pointer">Texte du Verset / Citation</label>
                                            <textarea
                                                id="quote-text-fr"
                                                name="quote_text_fr"
                                                rows={3}
                                                value={settings?.quote_text_fr || ""}
                                                onChange={(e) => setSettings({ ...settings, quote_text_fr: e.target.value })}
                                                placeholder="Entrez le verset du jour..."
                                                className="w-full max-w-2xl px-3 py-2 bg-white border border-border text-sm focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none rounded-md"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            {/* Author Name */}
                                            <div className="space-y-2">
                                                <label htmlFor="quote-author-name-fr" className="text-xs font-bold text-gray-400 uppercase cursor-pointer">Nom de l'auteur</label>
                                                <input
                                                    type="text"
                                                    id="quote-author-name-fr"
                                                    name="quote_author_name_fr"
                                                    value={settings?.quote_author_name_fr || ""}
                                                    onChange={(e) => setSettings({ ...settings, quote_author_name_fr: e.target.value })}
                                                    className="w-full px-3 py-1.5 bg-white border border-border text-sm focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none"
                                                />
                                            </div>
                                            {/* Author Role */}
                                            <div className="space-y-2">
                                                <label htmlFor="quote-author-subtitle-fr" className="text-xs font-bold text-gray-400 uppercase cursor-pointer">Rôle / Sous-titre</label>
                                                <input
                                                    type="text"
                                                    id="quote-author-subtitle-fr"
                                                    name="quote_author_subtitle_fr"
                                                    value={settings?.quote_author_subtitle_fr || ""}
                                                    onChange={(e) => setSettings({ ...settings, quote_author_subtitle_fr: e.target.value })}
                                                    className="w-full px-3 py-1.5 bg-white border border-border text-sm focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none"
                                                />
                                            </div>
                                        </div>

                                        {/* Author Photo */}
                                        <div className="space-y-3">
                                            <label htmlFor="quote-author-upload" className="text-xs font-bold text-gray-400 uppercase cursor-pointer">Photo de l'auteur</label>
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-full border-2 border-accent/20 overflow-hidden bg-gray-50 flex-shrink-0 relative group">
                                                    {quoteAuthorPreview ? (
                                                        <div className="relative w-full h-full">
                                                            <img src={quoteAuthorPreview} alt="Auteur" className="w-full h-full object-cover" />
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    setQuoteAuthorPreview(null);
                                                                    if (quoteAuthorFileInputRef.current) {
                                                                        quoteAuthorFileInputRef.current.value = "";
                                                                    }
                                                                }}
                                                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                                title="Supprimer la photo"
                                                            >
                                                                <X className="w-5 h-5 text-white" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <ImageIcon className="w-6 h-6 text-gray-300" />
                                                        </div>
                                                    )}
                                                </div>
                                                <input
                                                    type="file"
                                                    id="quote-author-upload"
                                                    ref={quoteAuthorFileInputRef}
                                                    onChange={handleQuoteAuthorPhotoChange}
                                                    accept="image/*"
                                                    className="hidden"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-[10px] h-8 px-4 border-gray-200 hover:border-[#2271b1] transition-all"
                                                    onClick={() => { setPickerTarget('quote'); setPickerOpen(true); }}
                                                >
                                                    <ImageIcon className="w-3 h-3 mr-2" /> Choisir depuis la médiathèque
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            {/* News Ticker Toggle */}
                            <tr className="border-b border-gray-100">
                                <th className="px-6 py-5 w-1/3 text-sm font-semibold text-gray-700 bg-gray-50/50">
                                    <span>{t("admin.settings_page.form.ticker_section")}</span>
                                </th>
                                <td className="px-6 py-5">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                id="ticker-enabled"
                                                checked={settings?.ticker_enabled ?? true}
                                                onChange={(e) => setSettings({ ...settings, ticker_enabled: e.target.checked })}
                                                className="w-4 h-4 text-[#2271b1] rounded border-gray-300 focus:ring-[#2271b1]"
                                            />
                                            <label htmlFor="ticker-enabled" className="text-sm font-medium text-gray-700">
                                                {t("admin.settings_page.form.ticker_desc")}
                                            </label>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 max-w-md">
                                            <div className="space-y-1">
                                                <label htmlFor="ticker-speed" className="text-xs font-bold text-gray-400 uppercase cursor-pointer">{t("admin.settings_page.form.ticker_speed_label")}</label>
                                                <input
                                                    type="number"
                                                    id="ticker-speed"
                                                    name="ticker_speed"
                                                    value={settings?.ticker_speed || 30}
                                                    onChange={(e) => setSettings({ ...settings, ticker_speed: parseInt(e.target.value) })}
                                                    className="w-full px-3 py-1.5 bg-white border border-border text-sm focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none"
                                                    min="5"
                                                    max="300"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label htmlFor="ticker-refresh" className="text-xs font-bold text-gray-400 uppercase cursor-pointer">{t("admin.settings_page.form.ticker_refresh_label")}</label>
                                                <input
                                                    type="number"
                                                    id="ticker-refresh"
                                                    name="ticker_refresh_interval"
                                                    value={settings?.ticker_refresh_interval || 3600}
                                                    onChange={(e) => setSettings({ ...settings, ticker_refresh_interval: parseInt(e.target.value) })}
                                                    className="w-full px-3 py-1.5 bg-white border border-border text-sm focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none"
                                                    min="60"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label htmlFor="ticker-bg-color" className="text-xs font-bold text-gray-400 uppercase cursor-pointer">{t("admin.settings_page.form.ticker_color_label")}</label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="color"
                                                        id="ticker-bg-color"
                                                        name="ticker_bg_color"
                                                        value={settings?.ticker_bg_color || "#e60000"}
                                                        onChange={(e) => setSettings({ ...settings, ticker_bg_color: e.target.value })}
                                                        className="h-8 w-12 cursor-pointer border border-border"
                                                    />
                                                    <input
                                                        type="text"
                                                        id="ticker-bg-color-text"
                                                        name="ticker_bg_color_hex"
                                                        value={settings?.ticker_bg_color || "#e60000"}
                                                        onChange={(e) => setSettings({ ...settings, ticker_bg_color: e.target.value })}
                                                        className="flex-1 px-3 py-1.5 bg-white border border-border text-sm focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none"
                                                        aria-label="Code couleur HEX"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label htmlFor="ticker-opacity" className="text-xs font-bold text-gray-400 uppercase cursor-pointer">{t("admin.settings_page.form.ticker_opacity_label")} ({settings?.ticker_opacity ?? 100}%)</label>
                                                <input
                                                    type="range"
                                                    id="ticker-opacity"
                                                    name="ticker_opacity"
                                                    value={settings?.ticker_opacity ?? 100}
                                                    onChange={(e) => setSettings({ ...settings, ticker_opacity: parseInt(e.target.value) })}
                                                    className="w-full h-8 accent-[#2271b1] cursor-pointer"
                                                    min="0"
                                                    max="100"
                                                />
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-gray-500 italic">
                                            {t("admin.settings_page.form.ticker_help")}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="p-6 bg-gray-50/50 border-t border-border flex justify-end">
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-[#2271b1] hover:bg-[#135e96] text-white text-xs h-9 px-8 gap-2 shadow-sm"
                        >
                            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                            {t("admin.settings_page.save")}
                        </Button>
                    </div>
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

export default AdminSettings;
