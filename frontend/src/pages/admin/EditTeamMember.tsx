import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Users, Loader2, Upload, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useRef, useEffect } from "react";
import { apiService } from "@/lib/api";
import { toast } from "sonner";
import { getFullImageUrl } from "@/lib/utils";

const EditTeamMember = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        role_fr: "",
        role_en: "",
        role_rn: "",
        role_sw: "",
        order: "0",
        photo: null as File | null
    });

    useEffect(() => {
        const fetchMember = async () => {
            if (!id) return;
            try {
                const data = await apiService.getTeamMemberById(id);
                setFormData({
                    name: data.name || "",
                    role_fr: data.role_fr || "",
                    role_en: data.role_en || "",
                    role_rn: data.role_rn || "",
                    role_sw: data.role_sw || "",
                    order: String(data.order || 0),
                    photo: null
                });
                if (data.photo_display) {
                    setPreviewUrl(data.photo_display);
                }
            } catch (error) {
                toast.error(t("common.error_loading"));
                navigate("/admin/team");
            } finally {
                setLoading(false);
            }
        };
        fetchMember();
    }, [id, navigate, t]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData({ ...formData, photo: file });
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const removePhoto = () => {
        setFormData({ ...formData, photo: null });
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        if (!formData.name) {
            toast.error("Le nom est obligatoire");
            return;
        }

        try {
            setSaving(true);
            const data = new FormData();
            data.append("name", formData.name);
            data.append("role_fr", formData.role_fr);
            data.append("role_en", formData.role_en);
            data.append("role_rn", formData.role_rn);
            data.append("role_sw", formData.role_sw);
            data.append("order", formData.order);
            if (formData.photo) {
                data.append("photo", formData.photo);
            }

            await apiService.updateTeamMember(parseInt(id), data);
            toast.success(t("common.saved_success"));
            navigate("/admin/team");
        } catch (error: any) {
            console.error("Error updating team member:", error);
            toast.error(error.message || t("common.error_saving"));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <p>{t("common.loading")}</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto">
                <header className="flex flex-col gap-4 mb-8">
                    <Link to="/admin/team" className="flex items-center gap-1 text-[#2271b1] hover:text-[#135e96] text-sm transition-colors w-fit">
                        <ChevronLeft className="w-4 h-4" />
                        <span>{t("admin.team_page.back")}</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-[#1d2327]">👥 {t("admin.team_page.edit_title")}</h1>
                </header>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white border border-border shadow-sm p-6 rounded-2xl space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="member-name" className="text-xs font-bold text-gray-700 uppercase">{t("admin.team_page.form.name")}</label>
                                <input
                                    id="member-name"
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-border rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-[#2271b1] outline-none transition-all text-sm font-medium"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="member-role-fr" className="text-xs font-bold text-gray-700 uppercase">{t("admin.team_page.form.role_fr")}</label>
                                    <input
                                        id="member-role-fr"
                                        name="role_fr"
                                        type="text"
                                        value={formData.role_fr}
                                        onChange={(e) => setFormData({ ...formData, role_fr: e.target.value })}
                                        className="w-full px-4 py-2 bg-white border border-border rounded-xl focus:border-[#2271b1] outline-none text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="member-role-rn" className="text-xs font-bold text-gray-700 uppercase">{t("admin.team_page.form.role_rn")}</label>
                                    <input
                                        id="member-role-rn"
                                        name="role_rn"
                                        type="text"
                                        value={formData.role_rn}
                                        onChange={(e) => setFormData({ ...formData, role_rn: e.target.value })}
                                        className="w-full px-4 py-2 bg-white border border-border rounded-xl focus:border-[#2271b1] outline-none text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="member-role-en" className="text-xs font-bold text-gray-700 uppercase">{t("admin.team_page.form.role_en")}</label>
                                    <input
                                        id="member-role-en"
                                        name="role_en"
                                        type="text"
                                        value={formData.role_en}
                                        onChange={(e) => setFormData({ ...formData, role_en: e.target.value })}
                                        className="w-full px-4 py-2 bg-white border border-border rounded-xl focus:border-[#2271b1] outline-none text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="member-role-sw" className="text-xs font-bold text-gray-700 uppercase">{t("admin.team_page.form.role_sw")}</label>
                                    <input
                                        id="member-role-sw"
                                        name="role_sw"
                                        type="text"
                                        value={formData.role_sw}
                                        onChange={(e) => setFormData({ ...formData, role_sw: e.target.value })}
                                        className="w-full px-4 py-2 bg-white border border-border rounded-xl focus:border-[#2271b1] outline-none text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white border border-border shadow-sm p-6 rounded-2xl space-y-6">
                            <div className="space-y-2">
                                <div className="text-xs font-bold text-gray-700 uppercase">{t("admin.team_page.form.photo")}</div>
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`relative aspect-square rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden ${previewUrl ? 'border-solid border-[#2271b1]' : 'border-gray-200 hover:border-[#2271b1] bg-gray-50'}`}
                                >
                                    {previewUrl ? (
                                        <>
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                            <button 
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); removePhoto(); }}
                                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="text-center p-4">
                                            <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                            <p className="text-xs text-gray-400 font-medium font-bold">Cliquez pour changer</p>
                                        </div>
                                    )}
                                </div>
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden" 
                                    accept="image/*"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="member-order" className="text-xs font-bold text-gray-700 uppercase">{t("admin.team_page.form.order")}</label>
                                <input
                                    id="member-order"
                                    name="order"
                                    type="number"
                                    value={formData.order}
                                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-border rounded-xl focus:border-[#2271b1] outline-none text-sm font-medium"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={saving}
                                className="w-full bg-[#2271b1] hover:bg-[#135e96] text-white h-12 rounded-xl font-bold transition-all shadow-md"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : t("admin.team_page.form.submit")}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
};

export default EditTeamMember;
