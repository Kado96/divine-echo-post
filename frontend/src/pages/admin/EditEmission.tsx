import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
    ChevronLeft,
    Image as ImageIcon,
    Video,
    Youtube,
    Mic,
    Calendar,
    Eye,
    Globe,
    Edit2,
    Loader2,
    Save,
    Plus,
    Tag,
    Settings,
    Share2,
    Facebook,
    MessageCircle,
    Users,
    ChevronDown,
    Check
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { apiService } from "@/lib/api";
import { stripHtml } from "@/lib/utils";
import { toast } from "sonner";
import MediaPickerModal from "@/components/admin/MediaPickerModal";
import ReactPlayer from "react-player";

const EditEmission = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [teamMembers, setTeamMembers] = useState<any[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [teamLoading, setTeamLoading] = useState(false);
    const [formData, setFormData] = useState<any>({
        title_fr: "",
        title_en: "",
        title_rn: "",
        title_sw: "",
        title: "",
        content_type: "video",
        content_url: "",
        description_fr: "",
        description_en: "",
        description_rn: "",
        description_sw: "",
        description: "",
        preacher_name: "",
        emission_date: "",
        is_active: false,
        category: "",
        slug: ""
    });

    const [activeTab, setActiveTab] = useState('fr');

    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerTarget, setPickerTarget] = useState<'cover' | 'media' | null>(null);
    const [isAuthorDropdownOpen, setIsAuthorDropdownOpen] = useState(false);

    const fetchTeam = async () => {
        try {
            setTeamLoading(true);
            const data = await apiService.getTeamMembers();
            const results = Array.isArray(data) ? data : (data.results || []);
            setTeamMembers(results);
        } catch (err) {
            console.error("Failed to fetch team members", err);
        } finally {
            setTeamLoading(false);
        }
    };

    const teamFallback = [
        { id: 'p1', name: "Jean Emmanuel" },
        { id: 'p2', name: "Donald Nom" },
        { id: 'p3', name: "kandeke Donald" },
        { id: 'p4', name: "Patrick Kandeke" }
    ];

    const displayTeam = teamMembers.length > 0 ? teamMembers : teamFallback;

    const fetchCategories = async () => {
        try {
            setCategoriesLoading(true);
            const data = await apiService.getEmissionCategories();
            const results = Array.isArray(data) ? data : (data.results || []);
            setCategories(results);
            return results;
        } catch (err) {
            console.error("Failed to fetch categories", err);
            return [];
        } finally {
            setCategoriesLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                const [emissionData, categoriesData, teamData] = await Promise.all([
                    apiService.getEmissionById(id),
                    fetchCategories(),
                    fetchTeam()
                ]);

                setFormData({
                    title_fr: emissionData.title_fr || emissionData.title || "",
                    title_en: emissionData.title_en || "",
                    title_rn: emissionData.title_rn || "",
                    title_sw: emissionData.title_sw || "",
                    title: emissionData.title || "",
                    content_type: emissionData.content_type || "video",
                    content_url: emissionData.content_type === "youtube" ? emissionData.video_url : (emissionData.video_url || emissionData.audio_url || ""),
                    description_fr: emissionData.description_fr || emissionData.description || "",
                    description_en: emissionData.description_en || "",
                    description_rn: emissionData.description_rn || "",
                    description_sw: emissionData.description_sw || "",
                    description: stripHtml(emissionData.description || ""),
                    preacher_name: emissionData.preacher_name || "",
                    emission_date: emissionData.emission_date || emissionData.sermon_date ? (emissionDateToISO(emissionData.emission_date || emissionData.sermon_date)) : "",
                    is_active: emissionData.is_active || false,
                    category: emissionData.category || "",
                    slug: emissionData.slug || "",
                    existingImage: emissionData.image_url || emissionData.image,
                    existingVideo: emissionData.video_file,
                    existingAudio: emissionData.audio_file
                });
            } catch (error) {
                toast.error(t("common.error_loading") || "Erreur de chargement");
                navigate("/admin/emissions");
            } finally {
                setLoading(false);
            }
        };

        const emissionDateToISO = (dateStr: string) => {
            if (!dateStr) return "";
            return dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
        };

        fetchData();
    }, [id, navigate, t]);

    const handleSave = async (publish = false) => {
        if (!id) return;
        if (!formData.title) {
            toast.error(t("common.title_required"));
            return;
        }
        if (!formData.description.trim()) {
            toast.error(t("common.description_required"));
            return;
        }
        if (!formData.preacher_name.trim()) {
            toast.error(t("common.preacher_required"));
            return;
        }
        try {
            setSaving(true);
            const dataToUpdate = new FormData();

            dataToUpdate.append('title', formData.title_fr);
            dataToUpdate.append('title_fr', formData.title_fr);
            dataToUpdate.append('title_en', formData.title_en);
            dataToUpdate.append('title_rn', formData.title_rn);
            dataToUpdate.append('title_sw', formData.title_sw);
            
            dataToUpdate.append('content_type', formData.content_type);
            
            dataToUpdate.append('description', formData.description_fr);
            dataToUpdate.append('description_fr', formData.description_fr);
            dataToUpdate.append('description_en', formData.description_en);
            dataToUpdate.append('description_rn', formData.description_rn);
            dataToUpdate.append('description_sw', formData.description_sw);
            
            dataToUpdate.append('preacher_name', formData.preacher_name);
            dataToUpdate.append('emission_date', formData.emission_date);
            dataToUpdate.append('is_active', String(publish ? true : formData.is_active));

            if (formData.category) {
                dataToUpdate.append('category', formData.category);
            }

            if (formData.content_type === "youtube") {
                dataToUpdate.append('video_url', formData.content_url);
            }

            if (mediaFile) {
                if (formData.content_type === "video") {
                    dataToUpdate.append('video_file', mediaFile);
                } else if (formData.content_type === "audio") {
                    dataToUpdate.append('audio_file', mediaFile);
                }
            }

            if (coverImage) {
                dataToUpdate.append('image', coverImage);
            } else if (formData.existingImage === null) {
                // Signal to backend to clear the image field
                dataToUpdate.append('image', "");
            }

            await apiService.updateEmission(id, dataToUpdate);
            toast.success(t("common.saved_success"));
            if (publish) navigate("/admin/emissions");
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

    const handleShare = (platform: 'facebook' | 'whatsapp') => {
        if (!formData.slug) {
            toast.error("L'émission doit être enregistrée pour être partagée");
            return;
        }
        const url = `${window.location.origin}/emission/${formData.slug}`;
        const title = formData.title;
        if (platform === 'facebook') {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
        } else if (platform === 'whatsapp') {
            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(title + " " + url)}`, '_blank');
        }
    };

    const handleMediaSelect = async (fileInfo: {url: string, id: number, type: string}) => {
        try {
            const res = await fetch(fileInfo.url);
            const blob = await res.blob();
            const filename = fileInfo.url.split('/').pop() || 'file_upload';
            const file = new File([blob], filename, { type: blob.type });

            if (pickerTarget === 'cover') {
                setCoverImage(file);
                setCoverPreview(fileInfo.url);
                setFormData({ ...formData, existingImage: null }); // Remove existing image tracking
            } else if (pickerTarget === 'media') {
                setMediaFile(file);
                setMediaPreview(fileInfo.url);
                setFormData({ ...formData, existingVideo: null, existingAudio: null });
            }
        } catch (error) {
            toast.error("Erreur lors de la récupération du fichier");
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <Loader2 className="w-10 h-10 animate-spin mb-4" />
                    <p>{t("common.loading")}</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-col gap-4 mb-8">
                    <Link to="/admin/emissions" className="flex items-center gap-1 text-[#2271b1] hover:text-[#135e96] text-sm transition-colors w-fit">
                        <ChevronLeft className="w-4 h-4" />
                        <span>{t("admin.emissions")}</span>
                    </Link>
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-[#1d2327]">{t("common.edit_of")} {formData.title}</h1>
                        <div className="flex items-center gap-3">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="gap-2 border-blue-200 text-[#2271b1] hover:bg-blue-50 h-10">
                                        <Share2 className="w-4 h-4" />
                                        Partager
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleShare('facebook')} className="gap-2">
                                        <Facebook className="w-4 h-4 text-blue-600" /> Facebook
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleShare('whatsapp')} className="gap-2">
                                        <MessageCircle className="w-4 h-4 text-green-600" /> WhatsApp
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button
                                onClick={() => handleSave(false)}
                                disabled={saving}
                                className="bg-[#2271b1] hover:bg-blue-700 text-white gap-2 h-10"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {t("admin.emissions_page.form.update")}
                            </Button>
                        </div>
                    </div>
                </header>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Main Content Form */}
                    <div className="flex-1 space-y-6">
                    {/* Language Tabs */}
                    <div className="flex gap-2 mb-4 border-b border-gray-100 pb-2">
                        {[
                            { id: 'fr', label: 'Français' },
                            { id: 'rn', label: 'Kirundi' },
                            { id: 'en', label: 'English' },
                            { id: 'sw', label: 'Kiswahili' }
                        ].map((lang) => (
                            <button
                                key={lang.id}
                                type="button"
                                onClick={() => setActiveTab(lang.id)}
                                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === lang.id ? 'bg-[#2271b1] text-white' : 'bg-white text-gray-400 border border-gray-100'}`}
                            >
                                {lang.label}
                            </button>
                        ))}
                    </div>

                    {/* Title */}
                    <div className="space-y-1.5">
                        <label htmlFor={`emission-title-${activeTab}`} className="text-sm font-semibold text-gray-700 cursor-pointer">
                            {t("admin.emissions_page.form.title")} ({activeTab.toUpperCase()})
                        </label>
                        <input
                            id={`emission-title-${activeTab}`}
                            name={`title_${activeTab}`}
                            value={formData[`title_${activeTab}`] || ""}
                            onChange={(e) => setFormData({ ...formData, [`title_${activeTab}`]: e.target.value })}
                            type="text"
                            className="w-full px-3 py-2 text-xl font-medium bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all shadow-sm"
                            required={activeTab === 'fr'}
                        />
                    </div>

                        {/* Content Type Selector */}
                        <div className="bg-white border border-border p-4 shadow-sm">
                            <h2 className="text-sm font-semibold text-gray-700 mb-4">{t("admin.emissions_page.form.type")}</h2>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { id: "video", label: t("admin.emissions_page.form.type_video"), icon: Video },
                                    { id: "audio", label: t("admin.emissions_page.form.type_audio"), icon: Mic },
                                    { id: "youtube", label: t("admin.emissions_page.form.type_youtube"), icon: Youtube },
                                ].map((type) => (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={() => {
                                            setFormData({ ...formData, content_type: type.id });
                                            setMediaFile(null);
                                        }}
                                        className={`flex flex-col items-center justify-center gap-2 p-4 border rounded-md transition-all ${formData.content_type === type.id
                                            ? "border-[#2271b1] bg-[#f0f6fb] text-[#2271b1]"
                                            : "border-border hover:bg-gray-50 text-gray-500"
                                            }`}
                                    >
                                        <type.icon className="w-6 h-6" />
                                        <span className="text-xs font-medium">{type.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Category Selector */}
                        <div className="bg-white border border-border p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-accent" />
                                    {t("admin.categories")}
                                    {categoriesLoading && <Loader2 className="w-3 h-3 animate-spin text-gray-400" />}
                                </h2>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={fetchCategories}
                                        className="text-[10px] text-gray-400 hover:text-accent transition-colors"
                                        title="Actualiser"
                                    >
                                        <Loader2 className={`w-3 h-3 ${categoriesLoading ? 'animate-spin' : ''}`} />
                                    </button>
                                    <Link
                                        to="/admin/categories"
                                        className="text-[10px] text-[#2271b1] hover:underline flex items-center gap-1"
                                    >
                                        <Settings className="w-3 h-3" />
                                        {t("admin.categories_page.manage") || "Gérer"}
                                    </Link>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, category: "" })}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${formData.category === ""
                                        ? "bg-accent text-white border-accent shadow-sm"
                                        : "bg-white text-gray-600 border-gray-200 hover:border-accent/40"
                                        }`}
                                >
                                    {t("common.no_category")}
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, category: cat.id })}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${String(formData.category) === String(cat.id)
                                            ? "bg-accent text-white border-accent shadow-sm"
                                            : "bg-white text-gray-600 border-gray-200 hover:border-accent/40"
                                            }`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                                {!categoriesLoading && categories.length === 0 && (
                                    <p className="text-[10px] text-gray-400 italic py-1">
                                        {t("admin.categories_page.no_categories_found") || "Aucune catégorie trouvée"}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* URL or File Input based on selection */}
                        <div className="bg-white border border-border p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <label htmlFor="emission-media-source" className="text-sm font-semibold text-gray-700 cursor-pointer">
                                    {formData.content_type === "youtube" ? t("admin.emissions_page.form.url") : (formData.content_type === "video" ? t("admin.emissions_page.form.video_link_or_file") : t("admin.emissions_page.form.file"))}
                                </label>
                                {formData.content_type === "video" && formData.content_url.includes("youtube") && (
                                    <span className="text-[10px] text-[#2271b1] font-bold">{t("admin.emissions_page.form.youtube_detected")}</span>
                                )}
                            </div>

                            {(formData.content_type === "youtube" || formData.content_type === "video") ? (
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label htmlFor="emission-media-source" className="text-[10px] text-gray-400 uppercase font-bold tracking-tight cursor-pointer block">{t("admin.emissions_page.form.video_url_help")}</label>
                                        <input
                                            id="emission-media-source"
                                            name="content_url"
                                            type="text"
                                            value={formData.content_url}
                                            onChange={(e) => {
                                                const url = e.target.value;
                                                const isYoutube = url.includes("youtube.com") || url.includes("youtu.be");
                                                setFormData({
                                                    ...formData,
                                                    content_url: url,
                                                    content_type: isYoutube ? "youtube" : formData.content_type
                                                });
                                            }}
                                            className="w-full px-3 py-1.5 bg-white border border-border text-xs focus:ring-1 focus:ring-[#2271b1] outline-none"
                                        />
                                        {formData.content_type === "youtube" && formData.content_url && (
                                            <div className="mt-3 rounded-xl overflow-hidden bg-black aspect-video w-full">
                                                <ReactPlayer 
                                                    url={formData.content_url} 
                                                    width="100%" 
                                                    height="100%" 
                                                    controls 
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {formData.content_type === "video" && (
                                        <div className="pt-2 border-t border-dashed border-border">
                                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight mb-2 block">{t("admin.emissions_page.form.local_file")}</span>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="text-xs w-full justify-start text-gray-500"
                                                onClick={(e) => { e.preventDefault(); setPickerTarget('media'); setPickerOpen(true); }}
                                            >
                                                <Video className="w-4 h-4 mr-2" /> Choisir depuis la médiathèque
                                            </Button>
                                            
                                            {mediaFile && mediaPreview && (
                                                <div className="mt-3 rounded-xl overflow-hidden bg-black aspect-video w-full">
                                                    <ReactPlayer url={mediaPreview} width="100%" height="100%" controls />
                                                </div>
                                            )}
                                            {mediaFile && !mediaPreview && <p className="text-[10px] text-[#2271b1] font-medium mt-2 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> {mediaFile.name}</p>}
                                            
                                            {(!mediaFile && formData.existingVideo) && (
                                                <div className="mt-3 flex flex-col gap-2">
                                                    <div className="rounded-xl overflow-hidden bg-black aspect-video w-full">
                                                        <ReactPlayer url={formData.existingVideo} width="100%" height="100%" controls />
                                                    </div>
                                                    <p className="text-[10px] text-blue-600 truncate italic bg-blue-50 p-1 rounded">
                                                        {t("common.current_file")}: {formData.existingVideo}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight mb-2 block">{t("admin.emissions_page.form.select_audio_file")}</span>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="text-xs w-full justify-start text-gray-500 py-6"
                                        onClick={(e) => { e.preventDefault(); setPickerTarget('media'); setPickerOpen(true); }}
                                    >
                                        <Mic className="w-6 h-6 mr-3 text-gray-400" /> Choisir un audio depuis la médiathèque
                                    </Button>
                                    
                                    {mediaFile && mediaPreview && (
                                        <div className="mt-3 w-full rounded-xl overflow-hidden">
                                            <ReactPlayer url={mediaPreview} width="100%" height="50px" controls className="bg-gray-100" />
                                        </div>
                                    )}
                                    {mediaFile && !mediaPreview && <p className="text-[10px] text-[#2271b1] font-medium mt-2 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> {mediaFile.name}</p>}
                                    
                                    {(!mediaFile && formData.existingAudio) && (
                                        <div className="mt-3 flex flex-col gap-2">
                                            <div className="w-full rounded-xl overflow-hidden">
                                                <ReactPlayer url={formData.existingAudio} width="100%" height="50px" controls className="bg-gray-100" />
                                            </div>
                                            <p className="text-[10px] text-blue-600 truncate italic bg-blue-50 p-1 rounded">
                                                {t("common.current_file")}: {formData.existingAudio}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Cover Image */}
                        <div className="bg-white border border-border shadow-sm overflow-hidden">
                            <div className="p-3 border-b border-border bg-gray-50/50 flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                    <ImageIcon className="w-3.5 h-3.5" /> {t("admin.emissions_page.form.image")}
                                </span>
                                {(coverImage || formData.existingImage) && (
                                    <button
                                        onClick={() => {
                                            setCoverImage(null);
                                            setCoverPreview(null);
                                            setFormData({ ...formData, existingImage: null });
                                        }}
                                        className="text-[10px] text-red-600 hover:text-red-800 font-bold"
                                    >
                                        {t("common.reset")}
                                    </button>
                                )}
                            </div>
                            <div className="p-4">
                                <div
                                    className={`relative group border-2 border-dashed rounded-xl transition-all duration-300 flex flex-col items-center justify-center overflow-hidden min-h-[200px] ${(coverImage || formData.existingImage) ? "border-accent bg-accent/5" : "border-gray-200 hover:border-accent/40 hover:bg-gray-50 bg-gray-50/30"
                                        }`}
                                >
                                    {(coverPreview || formData.existingImage) ? (
                                        <div className="relative w-full aspect-video">
                                            <img
                                                src={coverPreview ? coverPreview : formData.existingImage}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="sm"
                                                    className="bg-white text-black hover:bg-gray-100 cursor-pointer"
                                                    onClick={(e) => { e.preventDefault(); setPickerTarget('cover'); setPickerOpen(true); }}
                                                >
                                                    {t("admin.emissions_page.form.change_image")}
                                                </Button>
                                            </div>
                                            {coverPreview && (
                                                <div className="absolute top-2 right-2 bg-green-600 text-white text-[9px] font-black px-2 py-0.5 rounded shadow-lg uppercase tracking-tight">
                                                    {t("common.new_selection")}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={(e) => { e.preventDefault(); setPickerTarget('cover'); setPickerOpen(true); }}
                                            className="flex flex-col items-center gap-3 p-8 text-center"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                                                <ImageIcon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-700">Choisir depuis la médiathèque</p>
                                                <p className="text-[10px] text-gray-400 mt-1">{t("admin.emissions_page.form.recommended_format")}</p>
                                            </div>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-white border border-border p-4 shadow-sm">
                            <label htmlFor={`emission-description-${activeTab}`} className="block text-sm font-semibold text-gray-700 mb-2 cursor-pointer">
                                {t("admin.emissions_page.form.content")} ({activeTab.toUpperCase()})
                            </label>
                            <textarea
                                id={`emission-description-${activeTab}`}
                                name={`description_${activeTab}`}
                                value={formData[`description_${activeTab}`] || ""}
                                onChange={(e) => setFormData({ ...formData, [`description_${activeTab}`]: e.target.value })}
                                className="w-full h-48 px-3 py-2 bg-white border border-border text-sm focus:ring-1 focus:ring-[#2271b1] outline-none resize-none"
                                required={activeTab === 'fr'}
                            />
                        </div>
                    </div>

                    {/* Sidebar Actions */}
                    <div className="w-full lg:w-[280px] space-y-6">
                        {/* Publish Box */}
                        <div className="bg-white border border-border shadow-sm">
                            <div className="p-3 border-b border-border bg-gray-50/50">
                                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">{t("admin.emissions_page.form.publish")}</h3>
                            </div>
                            <div className="p-4 space-y-4">
                                {/* Status Selector */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight flex items-center gap-1.5">
                                        <Eye className="w-3 h-3" /> {t("admin.emissions_page.form.status")}
                                    </label>
                                    <div className="flex bg-gray-50 p-1 rounded-md border border-gray-100">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, is_active: false })}
                                            className={`flex-1 py-1 px-2 text-[10px] font-bold rounded transition-all ${!formData.is_active ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-400 hover:text-gray-600"}`}
                                        >
                                            {t("admin.emissions_page.table.status_draft")}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, is_active: true })}
                                            className={`flex-1 py-1 px-2 text-[10px] font-bold rounded transition-all ${formData.is_active ? "bg-white text-[#2271b1] shadow-sm border border-gray-200" : "text-gray-400 hover:text-gray-600"}`}
                                        >
                                            {t("admin.emissions_page.table.status_published")}
                                        </button>
                                    </div>
                                </div>

                                {/* Current Status Info */}
                                <div className="flex items-center justify-between text-[11px] text-gray-600 pt-1 border-t border-gray-50">
                                    <div className="flex items-center gap-1.5">
                                        <div className={`w-1.5 h-1.5 rounded-full ${formData.is_active ? (new Date(formData.emission_date) > new Date() ? "bg-orange-500" : "bg-green-500") : "bg-gray-300"}`} />
                                        <span>{t("admin.emissions_page.form.state_label")}</span>
                                    </div>
                                    <span className="font-bold text-gray-900">
                                        {!formData.is_active ? t("admin.emissions_page.table.status_draft") :
                                            (new Date(formData.emission_date) > new Date() ? t("admin.emissions_page.form.status_scheduled") : t("admin.emissions_page.table.status_published"))}
                                    </span>
                                </div>

                                {/* Date Selector */}
                                <div className="flex items-center justify-between text-[11px] text-gray-600 pt-1">
                                    <label htmlFor="emission-date" className="flex items-center gap-1.5 cursor-pointer">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>{t("admin.emissions_page.table.date")}:</span>
                                    </label>
                                    <input
                                        id="emission-date"
                                        name="emission_date"
                                        type="date"
                                        value={formData.emission_date}
                                        onChange={(e) => setFormData({ ...formData, emission_date: e.target.value })}
                                        className="font-bold text-gray-900 bg-transparent border-none p-0 text-[11px] w-24 text-right cursor-pointer hover:text-[#2271b1]"
                                    />
                                </div>
                            </div>
                            <div className="p-3 bg-gray-50/50 border-t border-border flex items-center justify-between">
                                <button
                                    onClick={() => handleDelete(id!)}
                                    className="text-[11px] text-red-600 hover:text-red-800 underline"
                                >
                                    {t("admin.emissions_page.form.trash")}
                                </button>
                                <Button
                                    onClick={() => handleSave(formData.is_active)}
                                    disabled={saving}
                                    size="sm"
                                    className="h-7 text-[10px] bg-[#2271b1] hover:bg-[#135e96] text-white px-4"
                                >
                                    {saving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                                    {t("admin.emissions_page.form.update")}
                                </Button>
                            </div>
                        </div>

                        <div className="bg-white border border-border shadow-sm">
                            <div className="p-3 border-b border-border bg-gray-50/50 flex items-center justify-between">
                                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">ÉDITEUR</h3>
                                {teamLoading && <Loader2 className="w-3 h-3 animate-spin text-gray-400" />}
                            </div>
                            <div className="p-4 space-y-4">
                                {/* Quick Select */}
                                {/* Author Selection Dropdown */}
                                <div className="space-y-2 relative">
                                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-tight flex items-center gap-2">
                                        <Users className="w-3.5 h-3.5" /> Sélectionner l'éditeur
                                    </label>
                                    
                                    <button 
                                        type="button"
                                        onClick={() => setIsAuthorDropdownOpen(!isAuthorDropdownOpen)}
                                        className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl hover:border-[#2271b1]/50 transition-all shadow-sm group focus:outline-none focus:ring-2 focus:ring-[#2271b1]/20"
                                    >
                                        {formData.preacher_name ? (
                                            <div className="flex items-center gap-3">
                                                <div className="w-7 h-7 rounded-full bg-[#2271b1] text-white flex items-center justify-center text-xs font-bold shadow-sm">
                                                    {formData.preacher_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                                                </div>
                                                <span className="text-sm font-semibold text-gray-800">{formData.preacher_name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-400 font-medium">Choisir un éditeur...</span>
                                        )}
                                        <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-[#2271b1] transition-transform duration-300 ${isAuthorDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isAuthorDropdownOpen && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl shadow-blue-900/5 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                            {displayTeam.map((member) => {
                                                const isSelected = formData.preacher_name === member.name;
                                                const initials = member.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
                                                return (
                                                    <button
                                                        key={member.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData({ ...formData, preacher_name: member.name });
                                                            setIsAuthorDropdownOpen(false);
                                                        }}
                                                        className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50/50 transition-colors ${isSelected ? 'bg-blue-50/30' : ''}`}
                                                    >
                                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${isSelected ? 'bg-[#2271b1] text-white shadow-sm' : 'bg-gray-100 text-gray-600'}`}>
                                                            {initials}
                                                        </div>
                                                        <span className={`text-sm ${isSelected ? 'font-bold text-[#2271b1]' : 'font-medium text-gray-700'}`}>
                                                            {member.name}
                                                        </span>
                                                        {isSelected && (
                                                            <Check className="w-4 h-4 text-[#2271b1] ml-auto" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <MediaPickerModal 
                isOpen={pickerOpen} 
                onClose={() => setPickerOpen(false)} 
                onSelect={handleMediaSelect} 
                acceptedTypes={pickerTarget === 'cover' ? ['image'] : pickerTarget === 'media' ? (formData.content_type === 'video' ? ['video'] : ['audio']) : []} 
            />
        </AdminLayout>
    );

    async function handleDelete(id: string) {
        if (window.confirm(t("common.confirm_delete"))) {
            try {
                await apiService.deleteEmission(id);
                toast.success(t("common.deleted_success"));
                navigate("/admin/emissions");
            } catch (error: any) {
                toast.error(error.message || t("common.error_deleting"));
            }
        }
    }
};

export default EditEmission;
