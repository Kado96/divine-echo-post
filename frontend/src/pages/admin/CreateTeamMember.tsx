import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Users, Loader2, Upload, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useRef } from "react";
import { apiService } from "@/lib/api";
import { toast } from "sonner";

const CreateTeamMember = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
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
        if (!formData.name) {
            toast.error("Le nom est obligatoire");
            return;
        }

        try {
            setLoading(true);
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

            await apiService.createTeamMember(data);
            toast.success(t("common.saved_success"));
            navigate("/admin/team");
        } catch (error: any) {
            console.error("Error creating team member:", error);
            toast.error(error.message || t("common.error_saving"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto">
                <header className="flex flex-col gap-4 mb-8">
                    <Link to="/admin/team" className="flex items-center gap-1 text-[#2271b1] hover:text-[#135e96] text-sm transition-colors w-fit">
                        <ChevronLeft className="w-4 h-4" />
                        <span>{t("admin.team_page.back")}</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-[#1d2327]">👥 {t("admin.team_page.create_title")}</h1>
                </header>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Roles & Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white border border-border shadow-sm p-6 rounded-2xl space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 uppercase">{t("admin.team_page.form.name")}</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-border rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-[#2271b1] outline-none transition-all text-sm font-medium"
                                    placeholder="Ex: Pasteur Donald"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-700 uppercase">{t("admin.team_page.form.role_fr")}</label>
                                    <input
                                        type="text"
                                        value={formData.role_fr}
                                        onChange={(e) => setFormData({ ...formData, role_fr: e.target.value })}
                                        className="w-full px-4 py-2 bg-white border border-border rounded-xl focus:border-[#2271b1] outline-none text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-700 uppercase">{t("admin.team_page.form.role_rn")}</label>
                                    <input
                                        type="text"
                                        value={formData.role_rn}
                                        onChange={(e) => setFormData({ ...formData, role_rn: e.target.value })}
                                        className="w-full px-4 py-2 bg-white border border-border rounded-xl focus:border-[#2271b1] outline-none text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-700 uppercase">{t("admin.team_page.form.role_en")}</label>
                                    <input
                                        type="text"
                                        value={formData.role_en}
                                        onChange={(e) => setFormData({ ...formData, role_en: e.target.value })}
                                        className="w-full px-4 py-2 bg-white border border-border rounded-xl focus:border-[#2271b1] outline-none text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-700 uppercase">{t("admin.team_page.form.role_sw")}</label>
                                    <input
                                        type="text"
                                        value={formData.role_sw}
                                        onChange={(e) => setFormData({ ...formData, role_sw: e.target.value })}
                                        className="w-full px-4 py-2 bg-white border border-border rounded-xl focus:border-[#2271b1] outline-none text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Photo & Order */}
                    <div className="space-y-6">
                        <div className="bg-white border border-border shadow-sm p-6 rounded-2xl space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 uppercase">{t("admin.team_page.form.photo")}</label>
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
                                            <p className="text-xs text-gray-400 font-medium">Cliquez pour uploader</p>
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
                                <label className="text-xs font-bold text-gray-700 uppercase">{t("admin.team_page.form.order")}</label>
                                <input
                                    type="number"
                                    value={formData.order}
                                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-border rounded-xl focus:border-[#2271b1] outline-none text-sm font-medium"
                                />
                                <p className="text-[10px] text-gray-400 italic">Plus le chiffre est bas, plus le membre apparaît haut.</p>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#2271b1] hover:bg-[#135e96] text-white h-12 rounded-xl font-bold transition-all shadow-md"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t("admin.team_page.form.submit")}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
};

export default CreateTeamMember;
