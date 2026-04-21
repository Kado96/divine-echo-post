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
    const [activeTab, setActiveTab] = useState('fr');
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
            
            // Iterate through all settings to append them to the request
            // Exclude read-only fields and images (handled separately)
            const excludeFields = [
                'id', 'created_at', 'updated_at', 
                'logo', 'logo_url_display', 
                'hero_image', 'hero_image_display',
                'about_image', 'about_image_display',
                'team_image', 'team_image_display',
                'quote_author_image', 'quote_author_image_display'
            ];

            Object.keys(settings).forEach(key => {
                if (!excludeFields.includes(key)) {
                    const value = settings[key];
                    if (value !== null && value !== undefined) {
                        // Booleans must be strings for FormData
                        if (typeof value === 'boolean') {
                            formData.append(key, value ? 'true' : 'false');
                        } else {
                            formData.append(key, String(value));
                        }
                    }
                }
            });

            // Handle Files
            const logo = logoFile || fileInputRef.current?.files?.[0];
            if (logo) formData.append('logo', logo);

            const authorFile = quoteFile || quoteAuthorFileInputRef.current?.files?.[0];
            if (authorFile) formData.append('quote_author_image', authorFile);

            // Add other section images if they are in state as Files
            if (settings.hero_image instanceof File) formData.append('hero_image', settings.hero_image);
            if (settings.about_image instanceof File) formData.append('about_image', settings.about_image);
            if (settings.team_image instanceof File) formData.append('team_image', settings.team_image);

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

    const RenderInput = (label: string, fieldBase: string, type: 'text' | 'textarea' | 'number' = 'text', isMultilingual: boolean = true) => {
        const fieldName = isMultilingual ? `${fieldBase}_${activeTab}` : fieldBase;
        const value = settings[fieldName] || "";

        return (
            <div className="space-y-1.5 p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                <div className="flex justify-between items-center mb-1">
                    <label htmlFor={fieldName} className="text-[11px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">
                        {label} {isMultilingual && <span className="text-[#2271b1] ml-1">({activeTab.toUpperCase()})</span>}
                    </label>
                </div>
                {type === 'textarea' ? (
                    <textarea
                        id={fieldName}
                        value={value}
                        onChange={(e) => setSettings({ ...settings, [fieldName]: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 bg-white border border-border text-sm focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none rounded-md transition-all"
                    />
                ) : (
                    <input
                        id={fieldName}
                        type={type}
                        value={value}
                        onChange={(e) => setSettings({ ...settings, [fieldName]: type === 'number' ? parseInt(e.target.value) : e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-border text-sm focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none rounded-md transition-all"
                    />
                )}
            </div>
        );
    };

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

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Primary Settings Column */}
                    <div className="flex-1 space-y-8">
                        {/* Tab Selector for Multilingual Content */}
                        <div className="bg-white border border-border shadow-sm rounded-2xl overflow-hidden p-1 flex gap-1 mb-2">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    type="button"
                                    onClick={() => setActiveTab(lang.code)}
                                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === lang.code ? 'bg-[#2271b1] text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
                                >
                                    {lang.name}
                                </button>
                            ))}
                        </div>

                        {/* Section: Hero */}
                        <div className="bg-white border border-border shadow-sm rounded-2xl overflow-hidden">
                            <div className="px-6 py-4 bg-gray-50/50 border-b border-border flex items-center justify-between">
                                <h3 className="text-sm font-bold text-gray-700">🚀 Section Héro</h3>
                                <span className="text-[10px] bg-blue-100 text-[#2271b1] px-2 py-0.5 rounded-full font-bold">ACCUEIL</span>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {RenderInput("Badge Héro", "hero_badge")}
                                {RenderInput("Titre Héro", "hero_title")}
                                {RenderInput("Sous-titre Héro", "hero_subtitle", "textarea")}
                                {RenderInput("Description Héro", "hero_description", "textarea")}
                                {RenderInput("Bouton Émissions", "btn_emissions")}
                                {RenderInput("Bouton Enseignements", "btn_teachings")}
                                {RenderInput("Bouton Méditation", "btn_meditation")}
                            </div>
                        </div>

                        {/* Section: À Propos */}
                        <div className="bg-white border border-border shadow-sm rounded-2xl overflow-hidden">
                            <div className="px-6 py-4 bg-gray-50/50 border-b border-border">
                                <h3 className="text-sm font-bold text-gray-700">✨ Section À Propos</h3>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {RenderInput("Badge À Propos", "about_badge")}
                                {RenderInput("Titre À Propos", "about_title")}
                                {RenderInput("Accent Titre À Propos", "about_title_accent")}
                                {RenderInput("Contenu Principal", "about_content", "textarea")}
                                <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-50/20">
                                    {RenderInput("Feature 1", "about_feature1")}
                                    {RenderInput("Feature 2", "about_feature2")}
                                    {RenderInput("Feature 3", "about_feature3")}
                                    {RenderInput("Feature 4", "about_feature4")}
                                </div>
                            </div>
                        </div>

                        {/* Section: Verset du jour / Citation */}
                        <div className="bg-white border border-border shadow-sm rounded-2xl overflow-hidden">
                            <div className="px-6 py-4 bg-blue-50/50 border-b border-blue-100 flex items-center justify-between">
                                <h3 className="text-sm font-bold text-blue-800">📖 Verset du Jour / Citation</h3>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full border-2 border-accent/20 overflow-hidden bg-gray-50 group relative">
                                        {quoteAuthorPreview ? (
                                            <img src={quoteAuthorPreview} alt="Auteur" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-3 h-3 text-gray-300" /></div>
                                        )}
                                        <button onClick={() => { setPickerTarget('quote'); setPickerOpen(true); }} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Upload className="w-3 h-3 text-white" /></button>
                                    </div>
                                </div>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {RenderInput("Texte de la citation", "quote_text", "textarea")}
                                <div className="grid grid-cols-1 md:grid-cols-2">
                                    {RenderInput("Nom de l'auteur", "quote_author_name")}
                                    {RenderInput("Rôle de l'auteur", "quote_author_subtitle")}
                                </div>
                                {RenderInput("Verset Biblique", "bible_verse", "textarea")}
                                {RenderInput("Référence du Verset", "bible_verse_ref")}
                            </div>
                        </div>

                        {/* Section: Équipe */}
                        <div className="bg-white border border-border shadow-sm rounded-2xl overflow-hidden">
                            <div className="px-6 py-4 bg-gray-50/50 border-b border-border">
                                <h3 className="text-sm font-bold text-gray-700">👥 Section Équipe</h3>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {RenderInput("Titre Équipe", "team_title")}
                                {RenderInput("Description Équipe", "team_description", "textarea")}
                            </div>
                        </div>

                        {/* Section: Statistiques */}
                        <div className="bg-white border border-border shadow-sm rounded-2xl overflow-hidden">
                            <div className="px-6 py-4 bg-emerald-50/50 border-b border-emerald-100 flex items-center justify-between">
                                <h3 className="text-sm font-bold text-emerald-800">📊 Statistiques & Impact</h3>
                            </div>
                            <div className="divide-y divide-gray-50 p-4 space-y-4">
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Années d'Expérience</label>
                                        <input type="number" value={settings?.stat_years_value || 0} onChange={(e) => setSettings({...settings, stat_years_value: parseInt(e.target.value)})} className="w-full px-3 py-2 bg-gray-50 border border-border rounded-lg text-sm" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Émissions Produites</label>
                                        <input type="number" value={settings?.stat_emissions_value || 0} onChange={(e) => setSettings({...settings, stat_emissions_value: parseInt(e.target.value)})} className="w-full px-3 py-2 bg-gray-50 border border-border rounded-lg text-sm" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Audience Mensuelle</label>
                                        <input type="number" value={settings?.stat_audience_value || 0} onChange={(e) => setSettings({...settings, stat_audience_value: parseInt(e.target.value)})} className="w-full px-3 py-2 bg-gray-50 border border-border rounded-lg text-sm" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Langues Diffusées</label>
                                        <input type="number" value={settings?.stat_languages_value || 0} onChange={(e) => setSettings({...settings, stat_languages_value: parseInt(e.target.value)})} className="w-full px-3 py-2 bg-gray-50 border border-border rounded-lg text-sm" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-50">
                                    {RenderInput("Label Années", "stat_years_label")}
                                    {RenderInput("Label Émissions", "stat_emissions")}
                                    {RenderInput("Label Audience", "stat_audience")}
                                    {RenderInput("Label Langues", "stat_languages")}
                                </div>
                            </div>
                        </div>

                        {/* Section: Footer */}
                        <div className="bg-white border border-border shadow-sm rounded-2xl overflow-hidden">
                            <div className="px-6 py-4 bg-gray-50/50 border-b border-border">
                                <h3 className="text-sm font-bold text-gray-700">⚓ Footer & Pages</h3>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {RenderInput("Description Footer", "footer_description", "textarea")}
                                <div className="grid grid-cols-1 md:grid-cols-2">
                                    {RenderInput("Titre Liens Rapides", "footer_quick_links_title")}
                                    {RenderInput("Titre Contact", "footer_contact_title")}
                                    {RenderInput("Titre Réseaux Sociaux", "footer_social_title")}
                                    {RenderInput("Copyright", "footer_copyright")}
                                </div>
                                <div className="p-4 bg-gray-50/30">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-4">Titres des Pages</p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                        {RenderInput("Page Émissions", "page_courses_title")}
                                        {RenderInput("Page À Propos", "page_about_title")}
                                        {RenderInput("Page Contact", "page_contact_title")}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Global Settings */}
                    <div className="w-full md:w-80 space-y-6">
                        {/* Branding Card */}
                        <div className="bg-white border border-border shadow-sm rounded-2xl p-6 space-y-6">
                            <h3 className="text-xs font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                                <Globe className="w-4 h-4 text-[#2271b1]" /> IDENTITÉ GÉNÉRALE
                            </h3>
                            
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Nom du Site</label>
                                    <input
                                        type="text"
                                        value={settings?.site_name || ""}
                                        onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-50 border border-border rounded-lg text-sm focus:border-[#2271b1] outline-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Slogan Global</label>
                                    <textarea
                                        value={settings?.description || ""}
                                        onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-50 border border-border rounded-lg text-sm focus:border-[#2271b1] outline-none h-20"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Logo</label>
                                    <div className="relative group w-32 h-32 mx-auto bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center">
                                        {logoPreview ? (
                                            <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
                                        ) : (
                                            <ImageIcon className="w-8 h-8 text-gray-200" />
                                        )}
                                        <button onClick={() => { setPickerTarget('logo'); setPickerOpen(true); }} className="absolute inset-0 bg-[#2271b1]/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <Upload className="w-6 h-6 text-white" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bandéau défilant (Ticker) */}
                        <div className="bg-[#1d2327] text-white shadow-xl rounded-2xl p-6 space-y-6 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#2271b1] blur-[60px] opacity-20 -mr-16 -mt-16"></div>
                            <h3 className="text-xs font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2 relative z-10">
                                📣 BANDEAU DÉFILANT
                            </h3>
                            
                            <div className="space-y-5 relative z-10">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Activer le bandeau</label>
                                    <button 
                                        onClick={() => setSettings({ ...settings, ticker_enabled: !settings.ticker_enabled })}
                                        className={`w-10 h-5 rounded-full relative transition-colors ${settings.ticker_enabled ? 'bg-[#2271b1]' : 'bg-gray-700'}`}
                                    >
                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.ticker_enabled ? 'left-6' : 'left-1'}`}></div>
                                    </button>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Vitesse (sec)</label>
                                    <input 
                                        type="number" 
                                        value={settings?.ticker_speed || 30}
                                        onChange={(e) => setSettings({...settings, ticker_speed: parseInt(e.target.value)})}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" 
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Couleur de fond</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="color" 
                                            value={settings?.ticker_bg_color || "#e60000"}
                                            onChange={(e) => setSettings({...settings, ticker_bg_color: e.target.value})}
                                            className="h-9 w-12 bg-transparent cursor-pointer" 
                                        />
                                        <input 
                                            type="text" 
                                            value={settings?.ticker_bg_color || "#e60000"}
                                            onChange={(e) => setSettings({...settings, ticker_bg_color: e.target.value})}
                                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs" 
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase">
                                        <span>Opacité</span>
                                        <span>{settings?.ticker_opacity || 100}%</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="0" max="100"
                                        value={settings?.ticker_opacity || 100}
                                        onChange={(e) => setSettings({...settings, ticker_opacity: parseInt(e.target.value)})}
                                        className="w-full accent-[#2271b1]" 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Save Button Sidebar */}
                        <div className="bg-white border border-border shadow-sm rounded-2xl p-4">
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full bg-[#2271b1] hover:bg-[#135e96] text-white py-6 rounded-xl font-bold flex flex-col gap-1 h-auto"
                            >
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                <span>Sauvegarder tout</span>
                            </Button>
                        </div>
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
