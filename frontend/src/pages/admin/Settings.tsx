import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Globe, Upload, Image as ImageIcon, Save, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { apiService } from "@/lib/api";
import { toast } from "sonner";

const AdminSettings = () => {
    const { t, i18n } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<any>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await apiService.getSettings();
                setSettings(data);
                if (data.logo) {
                    setLogoPreview(data.logo);
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

    const handleSave = async () => {
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('site_name', settings.site_name || '');
            formData.append('description', settings.description || '');

            const file = fileInputRef.current?.files?.[0];
            if (file) {
                formData.append('logo', file);
            }

            await apiService.updateSettings(formData);
            toast.success("Paramètres enregistrés avec succès");
        } catch (error) {
            toast.error("Erreur lors de l'enregistrement");
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
                        <p className="text-sm text-gray-500 mt-1">Gérez l'identité et les paramètres de votre plateforme</p>
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
                                    <label>Logo du Site</label>
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
                                            <p className="text-[10px] text-gray-400 text-center italic">Aperçu du logo</p>
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
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <Upload className="w-3 h-3" />
                                                {logoPreview ? "Changer le logo" : "Choisir un logo"}
                                            </Button>
                                            <p className="text-[11px] text-gray-500 leading-relaxed max-w-xs">
                                                Format recommandé : PNG ou SVG transparent.<br />
                                                Taille suggérée : 200x200px.
                                            </p>
                                        </div>
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
        </AdminLayout>
    );
};

export default AdminSettings;
