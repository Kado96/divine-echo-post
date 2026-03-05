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
    Settings
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { apiService } from "@/lib/api";
import { stripHtml } from "@/lib/utils";
import { toast } from "sonner";

const EditSermon = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [formData, setFormData] = useState<any>({
        title: "",
        content_type: "video",
        content_url: "",
        description: "",
        preacher_name: "",
        sermon_date: "",
        is_active: false,
        category: ""
    });

    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [coverImage, setCoverImage] = useState<File | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                const [sermonData, categoriesData] = await Promise.all([
                    apiService.getSermonById(id),
                    apiService.getSermonCategories()
                ]);

                setCategories(Array.isArray(categoriesData) ? categoriesData : (categoriesData.results || []));

                setFormData({
                    title: sermonData.title || "",
                    content_type: sermonData.content_type || "video",
                    content_url: sermonData.content_type === "youtube" ? sermonData.video_url : (sermonData.video_url || sermonData.audio_url || ""),
                    description: stripHtml(sermonData.description || ""),
                    preacher_name: sermonData.preacher_name || "",
                    sermon_date: sermonData.sermon_date ? (sermonData.sermon_date.includes('T') ? sermonData.sermon_date.split('T')[0] : sermonData.sermon_date) : "",
                    is_active: sermonData.is_active || false,
                    category: sermonData.category || "",
                    existingImage: sermonData.image_url || sermonData.image,
                    existingVideo: sermonData.video_file,
                    existingAudio: sermonData.audio_file
                });
            } catch (error) {
                toast.error(t("common.error_loading"));
                navigate("/admin/sermons");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]);

    const handleSave = async (publish = false) => {
        if (!id) return;
        try {
            setSaving(true);
            const dataToUpdate = new FormData();

            dataToUpdate.append('title', formData.title);
            dataToUpdate.append('content_type', formData.content_type);
            dataToUpdate.append('description', formData.description);
            dataToUpdate.append('preacher_name', formData.preacher_name);
            dataToUpdate.append('sermon_date', formData.sermon_date);
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
            }

            await apiService.updateSermon(id, dataToUpdate);
            toast.success(t("common.saved_success"));
            if (publish) navigate("/admin/sermons");
        } catch (error: any) {
            toast.error(error.message || t("common.error_saving"));
        } finally {
            setSaving(false);
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
                    <Link to="/admin/sermons" className="flex items-center gap-1 text-[#2271b1] hover:text-[#135e96] text-sm transition-colors w-fit">
                        <ChevronLeft className="w-4 h-4" />
                        <span>{t("admin.sermons")}</span>
                    </Link>
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-[#1d2327]">{t("common.edit_of")} {formData.title}</h1>
                        <Button
                            onClick={() => handleSave(false)}
                            disabled={saving}
                            className="bg-[#2271b1] hover:bg-blue-700 text-white gap-2"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {t("admin.sermons_page.form.update")}
                        </Button>
                    </div>
                </header>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Main Content Form */}
                    <div className="flex-1 space-y-6">
                        {/* Title */}
                        <div className="space-y-1.5">
                            <label htmlFor="sermon-title" className="text-sm font-semibold text-gray-700">{t("admin.sermons_page.form.title")}</label>
                            <input
                                id="sermon-title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                type="text"
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
                                </h2>
                                <Link
                                    to="/admin/categories"
                                    className="text-[10px] text-[#2271b1] hover:underline flex items-center gap-1"
                                >
                                    <Settings className="w-3 h-3" />
                                    {t("admin.categories_page.manage")}
                                </Link>
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
                            </div>
                        </div>

                        {/* URL or File Input based on selection */}
                        <div className="bg-white border border-border p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-semibold text-gray-700">
                                    {formData.content_type === "youtube" ? t("admin.sermons_page.form.url") : (formData.content_type === "video" ? t("admin.sermons_page.form.video_link_or_file") : t("admin.sermons_page.form.file"))}
                                </h2>
                                {formData.content_type === "video" && formData.content_url.includes("youtube") && (
                                    <span className="text-[10px] text-[#2271b1] font-bold">{t("admin.sermons_page.form.youtube_detected")}</span>
                                )}
                            </div>

                            {(formData.content_type === "youtube" || formData.content_type === "video") ? (
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">{t("admin.sermons_page.form.video_url_help")}</p>
                                        <input
                                            id="sermon-url"
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
                                    </div>

                                    {formData.content_type === "video" && (
                                        <div className="pt-2 border-t border-dashed border-border">
                                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight mb-2">{t("admin.sermons_page.form.local_file")}</p>
                                            <input id="editsermon-input-1" name="editsermon-input-1"
                                                type="file"
                                                accept="video/*"
                                                onChange={(e) => setMediaFile(e.target.files ? e.target.files[0] : null)}
                                                className="text-xs"
                                            />
                                            {mediaFile && <p className="text-[10px] text-green-600 font-medium mt-1">{mediaFile.name}</p>}
                                            {(!mediaFile && formData.existingVideo) && (
                                                <p className="text-[10px] text-blue-600 truncate italic mt-1 bg-blue-50 p-1 rounded">
                                                    {t("common.current_file")}: {formData.existingVideo}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <input id="editsermon-input-2" name="editsermon-input-2"
                                        type="file"
                                        accept="audio/*"
                                        onChange={(e) => setMediaFile(e.target.files ? e.target.files[0] : null)}
                                        className="text-xs"
                                    />
                                    {mediaFile && <p className="text-[10px] text-green-600 font-medium">{mediaFile.name}</p>}
                                    {(!mediaFile && formData.existingAudio) && (
                                        <p className="text-[10px] text-blue-600 truncate italic bg-blue-50 p-1 rounded">
                                            {t("common.current_file")}: {formData.existingAudio}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Cover Image */}
                        <div className="bg-white border border-border shadow-sm overflow-hidden">
                            <div className="p-3 border-b border-border bg-gray-50/50 flex items-center justify-between">
                                <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                    <ImageIcon className="w-3.5 h-3.5" /> {t("admin.sermons_page.form.image")}
                                </h2>
                                {(coverImage || formData.existingImage) && (
                                    <button
                                        onClick={() => {
                                            setCoverImage(null);
                                            // Optional: If you want to allow deleting existing image, handle that here
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
                                    {(coverImage || formData.existingImage) ? (
                                        <div className="relative w-full aspect-video">
                                            <img
                                                src={coverImage ? URL.createObjectURL(coverImage) : formData.existingImage}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="bg-white text-black hover:bg-gray-100"
                                                    onClick={() => document.getElementById('cover-upload-edit')?.click()}
                                                >
                                                    {t("admin.sermons_page.form.change_image")}
                                                </Button>
                                            </div>
                                            {coverImage && (
                                                <div className="absolute top-2 right-2 bg-green-600 text-white text-[9px] font-black px-2 py-0.5 rounded shadow-lg uppercase tracking-tight">
                                                    {t("common.new_selection")}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => document.getElementById('cover-upload-edit')?.click()}
                                            className="flex flex-col items-center gap-3 p-8 text-center"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                                                <Plus className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-700">{t("admin.sermons_page.form.click_to_add_image")}</p>
                                                <p className="text-[10px] text-gray-400 mt-1">{t("admin.sermons_page.form.recommended_format")}</p>
                                            </div>
                                        </button>
                                    )}
                                    <input
                                        id="cover-upload-edit"
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
                            <label htmlFor="sermon-description" className="block text-sm font-semibold text-gray-700 mb-2">{t("admin.sermons_page.form.content")}</label>
                            <textarea
                                id="sermon-description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full h-48 px-3 py-2 bg-white border border-border text-sm focus:ring-1 focus:ring-[#2271b1] outline-none resize-none"
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
                            <div className="p-4 space-y-4">
                                {/* Status Selector */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight flex items-center gap-1.5">
                                        <Eye className="w-3 h-3" /> {t("admin.sermons_page.form.status")}
                                    </label>
                                    <div className="flex bg-gray-50 p-1 rounded-md border border-gray-100">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, is_active: false })}
                                            className={`flex-1 py-1 px-2 text-[10px] font-bold rounded transition-all ${!formData.is_active ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-400 hover:text-gray-600"}`}
                                        >
                                            {t("admin.sermons_page.table.status_draft")}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, is_active: true })}
                                            className={`flex-1 py-1 px-2 text-[10px] font-bold rounded transition-all ${formData.is_active ? "bg-white text-[#2271b1] shadow-sm border border-gray-200" : "text-gray-400 hover:text-gray-600"}`}
                                        >
                                            {t("admin.sermons_page.table.status_published")}
                                        </button>
                                    </div>
                                </div>

                                {/* Current Status Info */}
                                <div className="flex items-center justify-between text-[11px] text-gray-600 pt-1 border-t border-gray-50">
                                    <div className="flex items-center gap-1.5">
                                        <div className={`w-1.5 h-1.5 rounded-full ${formData.is_active ? (new Date(formData.sermon_date) > new Date() ? "bg-orange-500" : "bg-green-500") : "bg-gray-300"}`} />
                                        <span>{t("admin.sermons_page.form.state_label")}</span>
                                    </div>
                                    <span className="font-bold text-gray-900">
                                        {!formData.is_active ? t("admin.sermons_page.table.status_draft") :
                                            (new Date(formData.sermon_date) > new Date() ? t("admin.sermons_page.form.status_scheduled") : t("admin.sermons_page.table.status_published"))}
                                    </span>
                                </div>

                                {/* Date Selector */}
                                <div className="flex items-center justify-between text-[11px] text-gray-600 pt-1">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>{t("admin.sermons_page.table.date")}:</span>
                                    </div>
                                    <input id="editsermon-input-3" name="editsermon-input-3"
                                        type="date"
                                        value={formData.sermon_date}
                                        onChange={(e) => setFormData({ ...formData, sermon_date: e.target.value })}
                                        className="font-bold text-gray-900 bg-transparent border-none p-0 text-[11px] w-24 text-right cursor-pointer hover:text-[#2271b1]"
                                    />
                                </div>
                            </div>
                            <div className="p-3 bg-gray-50/50 border-t border-border flex items-center justify-between">
                                <button
                                    onClick={() => handleDelete(id!)}
                                    className="text-[11px] text-red-600 hover:text-red-800 underline"
                                >
                                    {t("admin.sermons_page.form.trash")}
                                </button>
                                <Button
                                    onClick={() => handleSave(formData.is_active)}
                                    disabled={saving}
                                    size="sm"
                                    className="h-7 text-[10px] bg-[#2271b1] hover:bg-[#135e96] text-white px-4"
                                >
                                    {saving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                                    {t("admin.sermons_page.form.update")}
                                </Button>
                            </div>
                        </div>

                        {/* Author/Speaker Box */}
                        <div className="bg-white border border-border shadow-sm">
                            <div className="p-3 border-b border-border bg-gray-50/50">
                                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">{t("admin.sermons_page.form.author")}</h3>
                            </div>
                            <div className="p-4">
                                <input
                                    id="sermon-author"
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

    async function handleDelete(id: string) {
        if (window.confirm(t("common.confirm_delete"))) {
            try {
                await apiService.deleteSermon(id);
                toast.success(t("common.deleted_success"));
                navigate("/admin/sermons");
            } catch (error: any) {
                toast.error(error.message || t("common.error_deleting"));
            }
        }
    }
};

export default EditSermon;
