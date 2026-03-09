import { useState, useEffect } from "react";
import { Plus, Trash2, Camera, User, Save, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiService } from "@/lib/api";
import { getFullImageUrl } from "@/lib/utils";
import { toast } from "sonner";

interface TeamMember {
    id: number;
    name: string;
    role_fr: string;
    role_rn: string;
    role_en: string;
    role_sw: string;
    photo: string | null;
    photo_display: string | null;
    order: number;
}

const TeamManagement = ({ activeLang }: { activeLang: string }) => {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<number | null>(null);

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const data = await apiService.getTeamMembers();
            setMembers(Array.isArray(data) ? data : (data?.results || []));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async () => {
        const formData = new FormData();
        formData.append('name', 'Nouveau membre');
        formData.append('role_fr', 'Rôle');
        formData.append('order', (members.length).toString());

        try {
            const newMember = await apiService.createTeamMember(formData);
            setMembers([...members, newMember]);
            toast.success("Membre ajouté");
        } catch (err) {
            toast.error("Erreur lors de l'ajout");
        }
    };

    const handleDeleteMember = async (id: number) => {
        if (!confirm("Supprimer ce membre ?")) return;
        try {
            await apiService.deleteTeamMember(id);
            setMembers(members.filter(m => m.id !== id));
            toast.success("Membre supprimé");
        } catch (err) {
            toast.error("Erreur lors de la suppression");
        }
    };

    const handleSaveMember = async (id: number, memberData: any) => {
        setSaving(id);
        const formData = new FormData();
        Object.keys(memberData).forEach(key => {
            if (memberData[key] !== null && memberData[key] !== undefined) {
                if (key === 'photo' && !(memberData[key] instanceof File)) return;
                formData.append(key, memberData[key]);
            }
        });

        try {
            const updated = await apiService.updateTeamMember(id, formData);
            setMembers(members.map(m => m.id === id ? updated : m));
            toast.success("Enregistré");
        } catch (err) {
            toast.error("Erreur lors de l'enregistrement");
        } finally {
            setSaving(null);
        }
    };

    const handleChange = (id: number, field: string, value: any) => {
        setMembers(members.map(m => m.id === id ? { ...m, [field]: value } : m));
    };

    if (loading) return <div className="p-8 text-center text-gray-400">Chargement de l'équipe...</div>;

    return (
        <div className="space-y-8 mt-12 pt-12 border-t border-gray-100">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-[#1d2327]">Gérer l'équipe</h3>
                    <p className="text-xs text-gray-500">Ajoutez les membres de l'équipe Shalom qui seront affichés sur le site.</p>
                </div>
                <Button onClick={handleAddMember} className="bg-[#2271b1] hover:bg-blue-700 gap-2">
                    <Plus className="w-4 h-4" /> Ajouter un membre
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {members.map((member) => (
                    <div key={member.id} className="bg-white border border-border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
                        {/* Member Photo */}
                        <div className="shrink-0 flex flex-col items-center gap-4">
                            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 relative group">
                                {member.photo || member.photo_display ? (
                                    <div className="relative w-full h-full">
                                        <img
                                            src={member.photo && typeof member.photo !== 'string' ? URL.createObjectURL(member.photo as unknown as Blob) : getFullImageUrl(member.photo_display || (member.photo as string))}
                                            alt={member.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setMembers(members.map(m => m.id === member.id ? { ...m, photo: null, photo_display: null } : m));
                                            }}
                                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600 z-10"
                                            title="Supprimer la photo"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <User className="w-12 h-12" />
                                    </div>
                                )}
                                <label className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleChange(member.id, 'photo', file);
                                        }}
                                    />
                                    <Camera className="w-6 h-6" />
                                </label>
                            </div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Photo du membre</p>
                        </div>

                        {/* Member Details */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2 space-y-1.5">
                                <label htmlFor={`member_name_${member.id}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">Nom Complet</label>
                                <input
                                    id={`member_name_${member.id}`}
                                    name={`member_name_${member.id}`}
                                    type="text"
                                    value={member.name}
                                    onChange={(e) => handleChange(member.id, 'name', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-border focus:ring-1 focus:ring-[#2271b1] outline-none rounded-lg text-sm font-bold"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor={`member_role_${activeLang}_${member.id}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">Rôle ({activeLang.toUpperCase()})</label>
                                <input
                                    id={`member_role_${activeLang}_${member.id}`}
                                    name={`member_role_${activeLang}_${member.id}`}
                                    type="text"
                                    value={member[`role_${activeLang}` as keyof TeamMember] as string || ""}
                                    onChange={(e) => handleChange(member.id, `role_${activeLang}`, e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-border focus:ring-1 focus:ring-[#2271b1] outline-none rounded-lg text-sm"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor={`member_order_${member.id}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">Ordre d'affichage</label>
                                <input
                                    id={`member_order_${member.id}`}
                                    name={`member_order_${member.id}`}
                                    type="number"
                                    value={member.order}
                                    onChange={(e) => handleChange(member.id, 'order', parseInt(e.target.value))}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-border focus:ring-1 focus:ring-[#2271b1] outline-none rounded-lg text-sm"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex md:flex-col justify-end gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSaveMember(member.id, member)}
                                disabled={saving === member.id}
                                className="border-[#2271b1] text-[#2271b1] hover:bg-blue-50"
                            >
                                {saving === member.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteMember(member.id)}
                                className="border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300"
                                title="Supprimer ce membre"
                                aria-label="Supprimer ce membre"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}

                {members.length === 0 && (
                    <div className="py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                        <User className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400 text-sm">Aucun membre dans l'équipe pour le moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamManagement;
