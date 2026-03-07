import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import {
    ChevronLeft,
    Image as ImageIcon,
    Video,
    Youtube,
    Mic,
    Calendar,
    Eye,
    Globe,
    Loader2,
    Plus,
    Tag,
    Settings
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { apiService } from "@/lib/api";
import { stripHtml } from "@/lib/utils";
import { toast } from "sonner";

const CreateSermon = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    const [formData, setFormData] = useState({
        title: "",
        content_type: "video",
        content_url: "",
        description: "",
        preacher_name: "",
        sermon_date: new Date().toISOString().split('T')[0],
        is_active: false,
        category: ""
    });

    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [coverImage, setCoverImage] = useState<File | null>(null);

    const fetchCategories = async () => {
        try {
            setCategoriesLoading(true);
            const data = await apiService.getSermonCategories();
            setCategories(Array.isArray(data) ? data : (data.results || []));
        } catch (err) {
            console.error("Failed to fetch categories", err);
            toast.error(t("common.error_loading_categories") || "Erreur de chargement des catégories");
        } finally {
            setCategoriesLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleCreate = async (publish = false) => {
        if (!formData.title) {
            toast.error(t("common.title_required"));
            return;
        }
        if (!formData.description.trim()) {
            toast.error(t("common.description_required") || "La description est obligatoire");
            return;
        }
        if (!formData.preacher_name.trim()) {
            toast.error(t("common.preacher_required") || "Le nom du prédicateur est obligatoire");
            return;
        }
        try {
            setLoading(true);
            const dataToCreate = new FormData();

            // Append basic fields
            dataToCreate.append('title', formData.title);
            dataToCreate.append('content_type', formData.content_type);
            dataToCreate.append('description', formData.description);
            dataToCreate.append('preacher_name', formData.preacher_name);
            dataToCreate.append('sermon_date', formData.sermon_date);
            dataToCreate.append('is_active', String(publish));

            if (formData.category) {
                dataToCreate.append('category', formData.category);
            }

            // Append URL if YouTube
            if (formData.content_type === "youtube") {
                dataToCreate.append('video_url', formData.content_url);
            }

            // Append files if available
            if (mediaFile) {
                if (formData.content_type === "video") {
                    dataToCreate.append('video_file', mediaFile);
                } else if (formData.content_type === "audio") {
                    dataToCreate.append('audio_file', mediaFile);
                }
            }

            if (coverImage) {
                dataToCreate.append('image', coverImage);
            }

            await apiService.post('/admin/sermons/sermons/', dataToCreate);
            toast.success(publish ? t("common.published_success") : t("common.draft_saved"));
            navigate("/admin/sermons");
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
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-col gap-4 mb-8">
                    <Link to="/admin/sermons" className="flex items-center gap-1 text-[#2271b1] hover:text-[#135e96] text-sm transition-colors w-fit">
                        <ChevronLeft className="w-4 h-4" />
                        <span>{t("admin.sermons")}</span>
                    </Link>
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-[#1d2327]">{t("admin.sermons_page.create_title")}</h1>
                        <Button
                            onClick={() => handleCreate(false)}
                            disabled={loading}
                            variant="outline"
                            className="bg-white border-gray-300 gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            {t("admin.sermons_page.form.save_draft")}
                        </Button>
                    </div>
                </header>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Main Content Form */}
                    <div className="flex-1 space-y-6">
                        {/* Title */}
                        <div className="space-y-1.5">
                            <label htmlFor="sermon-title" className="text-sm font-semibold text-gray-700 cursor-pointer">{t("admin.sermons_page.form.title")}</label>
                            <input
                                id="sermon-title"
                                name="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                type="text"
                                placeholder={t("admin.sermons_page.form.title")}
                                className="w-full px-3 py-2 text-xl font-medium bg-white border border-border focus:ring-1 focus:ring-[#2271b1] outline-none transition-all shadow-sm"
                            />
                        </div>

                        {/* Content Type Selector */}
                        <div className="bg-white border border-border p-4 shadow-sm">
                            <h2 className="text-sm font-semibold text-gray-700 mb-4">{t("admin.sermons_page.form.type")}</h2>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { id: "video", label: t("admin.sermons_page.form.type_video"), icon: Video },
                                    { id: "audio", label: t("admin.sermons_page.form.type_audio"), icon: Mic },
                                    { id: "youtube", label: t("admin.sermons_page.form.type_youtube"), icon: Youtube },
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
                                <label htmlFor="sermon-media-source" className="text-sm font-semibold text-gray-700 cursor-pointer">
                                    {(formData.content_type === "youtube" || (formData.content_type === "video" && formData.content_url.includes("youtube.com")))
                                        ? t("admin.sermons_page.form.url")
                                        : (formData.content_type === "video" ? t("admin.sermons_page.form.file") : t("admin.sermons_page.form.file"))
                                    }
                                </label>
                                {formData.content_type === "video" && (
                                    <span className="text-[10px] text-gray-400 italic">YouTube auto-détecté</span>
                                )}
                            </div>

                            {(formData.content_type === "youtube" || formData.content_type === "video") ? (
                                <div className="space-y-4">
                                    <input
                                        id="sermon-media-source"
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
                                        placeholder={t("admin.sermons_page.form.url_placeholder")}
                                        className="w-full px-3 py-1.5 bg-white border border-border text-xs focus:ring-1 focus:ring-[#2271b1] outline-none"
                                    />

                                    {formData.content_type === "video" && (
                                        <div className="pt-2 border-t border-dashed border-border">
                                            <label htmlFor="sermon-video-file" className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-tight cursor-pointer block">Ou charger un fichier local</label>
                                            <input
                                                id="sermon-video-file"
                                                name="video_file"
                                                type="file"
                                                accept="video/*"
                                                onChange={(e) => setMediaFile(e.target.files ? e.target.files[0] : null)}
                                                className="text-xs"
                                            />
                                            {mediaFile && <p className="text-[10px] text-green-600 font-medium mt-1">{mediaFile.name}</p>}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <input
                                        id="sermon-media-source"
                                        name="audio_file"
                                        type="file"
                                        accept="audio/*"
                                        onChange={(e) => setMediaFile(e.target.files ? e.target.files[0] : null)}
                                        className="text-xs"
                                    />
                                    {mediaFile && <p className="text-[10px] text-green-600 font-medium">{mediaFile.name}</p>}
                                </div>
                            )}
                        </div>

                        {/* Cover Image */}
                        <div className="bg-white border border-border shadow-sm overflow-hidden">
                            <div className="p-3 border-b border-border bg-gray-50/50 flex items-center justify-between">
                                <label htmlFor="cover-upload" className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2 cursor-pointer">
                                    <ImageIcon className="w-3.5 h-3.5" /> {t("admin.sermons_page.form.image")}
                                </label>
                                {coverImage && (
                                    <button
                                        onClick={() => setCoverImage(null)}
                                        className="text-[10px] text-red-600 hover:text-red-800 font-bold"
                                    >
                                        Effacer
                                    </button>
                                )}
                            </div>
                            <div className="p-4">
                                <div
                                    className={`relative group border-2 border-dashed rounded-xl transition-all duration-300 flex flex-col items-center justify-center overflow-hidden min-h-[200px] ${coverImage ? "border-accent bg-accent/5" : "border-gray-200 hover:border-accent/40 hover:bg-gray-50 bg-gray-50/30"
                                        }`}
                                >
                                    {coverImage ? (
                                        <div className="relative w-full aspect-video">
                                            <img
                                                src={URL.createObjectURL(coverImage)}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="bg-white text-black hover:bg-gray-100"
                                                    onClick={() => document.getElementById('cover-upload')?.click()}
                                                >
                                                    Changer l'image
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => document.getElementById('cover-upload')?.click()}
                                            className="flex flex-col items-center gap-3 p-8 text-center"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                                                <Plus className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-700">Cliquez pour ajouter une photo</p>
                                                <p className="text-[10px] text-gray-400 mt-1">Format recommandé : 1920x1080px (16:9)</p>
                                            </div>
                                        </button>
                                    )}
                                    <input
                                        id="cover-upload"
                                        name="image"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setCoverImage(e.target.files ? e.target.files[0] : null)}
                                        className="hidden"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-white border border-border p-4 shadow-sm">
                            <label htmlFor="sermon-description" className="block text-sm font-semibold text-gray-700 mb-2 cursor-pointer">{t("admin.sermons_page.form.content")}</label>
                            <textarea
                                id="sermon-description"
                                name="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: stripHtml(e.target.value) })}
                                className="w-full h-48 px-3 py-2 bg-white border border-border text-sm focus:ring-1 focus:ring-[#2271b1] outline-none resize-none"
                                placeholder="..."
                            />
                        </div>
                    </div>

                    {/* Sidebar Actions */}
                    <div className="w-full lg:w-[280px] space-y-6">
                        {/* Publish Box */}
                        <div className="bg-white border border-border shadow-sm">
                            <div className="p-3 border-b border-border bg-gray-50/50">
                                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">{t("admin.sermons_page.form.publish")}</h3>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="flex items-center justify-between text-[11px] text-gray-600">
                                    <label htmlFor="sermon-date" className="flex items-center gap-1.5 cursor-pointer">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>{t("admin.sermons_page.table.date")}:</span>
                                    </label>
                                    <input
                                        id="sermon-date"
                                        name="sermon_date"
                                        type="date"
                                        value={formData.sermon_date}
                                        onChange={(e) => setFormData({ ...formData, sermon_date: e.target.value })}
                                        className="font-bold text-gray-900 bg-transparent border-none p-0 text-[11px] w-24 outline-none"
                                    />
                                </div>
                            </div>
                            <div className="p-3 bg-gray-50/50 border-t border-border flex items-center justify-end">
                                <Button
                                    onClick={() => handleCreate(true)}
                                    disabled={loading}
                                    size="sm"
                                    className="h-7 text-[10px] bg-[#2271b1] hover:bg-[#135e96] text-white"
                                >
                                    {t("admin.sermons_page.form.publish")}
                                </Button>
                            </div>
                        </div>

                        {/* Author Box */}
                        <div className="bg-white border border-border shadow-sm">
                            <div className="p-3 border-b border-border bg-gray-50/50">
                                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">{t("admin.sermons_page.form.author")}</h3>
                            </div>
                            <div className="p-4">
                                <label htmlFor="preacher_name" className="sr-only">{t("admin.sermons_page.form.author")}</label>
                                <input
                                    id="preacher_name"
                                    name="preacher_name"
                                    type="text"
                                    value={formData.preacher_name}
                                    onChange={(e) => setFormData({ ...formData, preacher_name: e.target.value })}
                                    placeholder={t("admin.sermons_page.form.author_placeholder")}
                                    className="w-full px-2 py-1 bg-white border border-border text-[11px] outline-none focus:border-[#2271b1]"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default CreateSermon;
