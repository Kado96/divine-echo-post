import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Grid, List, Search, Plus, Trash2, Loader2, File, Image as ImageIcon, Music, Video, Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from "react";
import { apiService } from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface MediaFile {
    id: number;
    file: string;
    file_url: string;
    title: string;
    file_type: string;
    formatted_size: string;
    created_at: string;
}

const AdminMedia = () => {
    const { t } = useTranslation();
    const [mediaItems, setMediaItems] = useState<MediaFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filterType, setFilterType] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchMedia();
    }, []);

    const fetchMedia = async () => {
        setLoading(true);
        try {
            const data = await apiService.getMediaFiles();
            // Data could be paginated
            if (data.results) {
                setMediaItems(data.results);
            } else {
                setMediaItems(data);
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des médias:", error);
            toast.error("Impossible de charger les fichiers.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);
        
        setUploading(true);
        try {
            await apiService.uploadMediaFile(formData);
            toast.success("Fichier ajouté avec succès !");
            fetchMedia();
        } catch (error) {
            console.error("Erreur d'upload:", error);
            toast.error("Échec de l'upload du fichier.");
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Voulez-vous vraiment supprimer ce fichier définitivement ?")) return;
        
        setDeleting(id);
        try {
            await apiService.deleteMediaFile(id);
            toast.success("Fichier supprimé !");
            setMediaItems(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            console.error("Erreur de suppression:", error);
            toast.error("Échec de la suppression.");
        } finally {
            setDeleting(null);
        }
    };

    const handleCopyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        toast.info("Lien du fichier copié dans le presse-papiers.");
    };

    const getFileIcon = (type: string) => {
        switch(type) {
            case 'image': return <ImageIcon className="w-10 h-10 text-gray-400" />;
            case 'audio': return <Music className="w-10 h-10 text-blue-400" />;
            case 'video': return <Video className="w-10 h-10 text-purple-400" />;
            default: return <File className="w-10 h-10 text-gray-500" />;
        }
    };

    const filteredItems = mediaItems.filter(item => {
        const matchesFilter = filterType === 'all' || item.file_type === filterType;
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <AdminLayout>
            <div className="max-w-6xl">
                <header className="flex items-center gap-4 mb-6">
                    <h1 className="text-2xl font-bold text-[#1d2327]">Médiathèque</h1> {/* En dur ici pour correspondre au design wp */}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                    />
                    <Button 
                        size="sm" 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="bg-white hover:bg-gray-50 border border-[#2271b1] text-[#2271b1] h-8 px-4 text-xs font-semibold rounded"
                    >
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Ajouter un fichier
                    </Button>
                </header>

                {/* Media Toolbar - WP Style */}
                <div className="flex flex-col sm:flex-row items-center justify-between mb-4 bg-white p-2 border border-border gap-2">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex border border-gray-300">
                            <button 
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 ${viewMode === 'grid' ? 'bg-gray-100 text-gray-700' : 'bg-white text-gray-400'} border-r border-gray-300 transition-colors`}
                            >
                                <Grid className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 ${viewMode === 'list' ? 'bg-gray-100 text-gray-700' : 'bg-white text-gray-400'} transition-colors`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                        <select 
                            value={filterType} 
                            onChange={(e) => setFilterType(e.target.value)}
                            className="text-xs border-border bg-white py-1.5 px-2 border outline-none"
                        >
                            <option value="all">Tous les fichiers</option>
                            <option value="image">Images</option>
                            <option value="audio">Audio</option>
                            <option value="video">Vidéo</option>
                            <option value="document">Documents</option>
                        </select>
                        <select className="text-xs border-border bg-white py-1.5 px-2 border outline-none cursor-not-allowed text-gray-400">
                            <option>Toutes les dates</option>
                        </select>
                        <Button size="sm" variant="ghost" className="text-xs text-[#2271b1] p-0 h-auto hover:bg-transparent hover:underline">
                            Sélection groupée
                        </Button>
                    </div>

                    <div className="relative w-full sm:w-auto">
                        <input 
                            type="text" 
                            autoComplete="off" 
                            placeholder="Chercher dans les médias" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8 pr-3 py-1.5 bg-white border border-border text-xs focus:ring-1 focus:ring-[#2271b1] outline-none w-full sm:w-56" 
                        />
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>

                <div className="bg-white border border-border p-4 min-h-[400px]">
                    {loading ? (
                        <div className="flex items-center justify-center h-48">
                            <Loader2 className="w-8 h-8 animate-spin text-[#2271b1]" />
                        </div>
                    ) : (
                        <>
                            {filteredItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                    <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
                                    <p className="text-xl font-semibold text-gray-500">Aucun fichier trouvé</p>
                                    <Button onClick={() => fileInputRef.current?.click()} variant="link" className="text-[#2271b1]">
                                        Ajouter un nouveau fichier
                                    </Button>
                                </div>
                            ) : viewMode === 'grid' ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-3">
                                    <AnimatePresence>
                                        {filteredItems.map((item) => (
                                            <motion.div 
                                                layout
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                key={item.id} 
                                                className="aspect-square relative group cursor-pointer border border-[#c3c4c7] hover:border-[#2271b1] bg-gray-50 flex items-center justify-center"
                                                onClick={() => handleCopyUrl(item.file_url)}
                                            >
                                                {item.file_type === 'image' ? (
                                                    <img src={item.file_url} alt={item.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="flex-1 flex items-center justify-center w-full h-full pb-4">
                                                        {getFileIcon(item.file_type)}
                                                    </div>
                                                )}
                                                
                                                <div className="absolute bottom-0 left-0 right-0 bg-white/95 text-gray-700 text-[10px] p-1 px-1.5 truncate text-center font-medium border-t border-gray-100 shadow-sm z-10">
                                                    {item.title}
                                                </div>
                                                
                                                {/* Hover Overlay */}
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center text-white">
                                                    <p className="text-[10px] font-bold truncate w-full mb-1" title={item.title}>{item.title}</p>
                                                    <p className="text-[9px] text-gray-300 uppercase">{item.file_type} • {item.formatted_size}</p>
                                                </div>

                                                {/* Delete Button */}
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                                    disabled={deleting === item.id}
                                                    className="absolute top-1 right-1 p-1.5 bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                                                    title="Supprimer définitivement"
                                                >
                                                    {deleting === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                                </button>
                                            </motion.div>
                                        ))}

                                        {/* Add box */}
                                        <div 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="aspect-square border-2 border-dashed border-[#c3c4c7] flex flex-col items-center justify-center gap-2 text-[#646970] hover:text-[#2271b1] hover:border-[#2271b1] cursor-pointer transition-colors"
                                        >
                                            <div className="w-10 h-10 rounded-full border border-current flex items-center justify-center mb-1">
                                                <Plus className="w-6 h-6" />
                                            </div>
                                            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Ajouter</span>
                                        </div>
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-border bg-gray-50">
                                                <th className="px-4 py-3 font-semibold text-gray-700 w-16">Fichier</th>
                                                <th className="px-4 py-3 font-semibold text-gray-700">Titre</th>
                                                <th className="px-4 py-3 font-semibold text-gray-700 hidden sm:table-cell">Type</th>
                                                <th className="px-4 py-3 font-semibold text-gray-700 hidden md:table-cell">Date</th>
                                                <th className="px-4 py-3 font-semibold text-gray-700 w-24">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredItems.map(item => (
                                                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                                                    <td className="px-4 py-3">
                                                        <div className="w-10 h-10 rounded overflow-hidden bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200">
                                                            {item.file_type === 'image' ? (
                                                                <img src={item.file_url} className="w-full h-full object-cover" alt="" />
                                                            ) : getFileIcon(item.file_type)}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <p className="font-semibold text-[#2271b1]">{item.title}</p>
                                                        <span className="text-xs text-gray-500">{item.formatted_size}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell capitalize">
                                                        {item.file_type}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">
                                                        {new Date(item.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <Button onClick={() => handleCopyUrl(item.file_url)} size="sm" variant="ghost" className="h-8 w-8 p-0" title="Copier le lien">
                                                                <Download className="w-4 h-4 text-gray-500" />
                                                            </Button>
                                                            <Button 
                                                                onClick={() => handleDelete(item.id)} 
                                                                disabled={deleting === item.id}
                                                                size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600" title="Supprimer"
                                                            >
                                                                {deleting === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 text-red-500" />}
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminMedia;
