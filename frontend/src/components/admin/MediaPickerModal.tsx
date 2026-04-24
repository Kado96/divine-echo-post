import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { X, Search, Loader2, Image as ImageIcon, File, Video, Music, Check } from 'lucide-react';
import { toast } from 'sonner';

interface MediaFile {
    id: number;
    file: string;
    file_url: string;
    title: string;
    file_type: string;
    formatted_size: string;
}

interface MediaPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (fileInfo: { url: string; id: number; type: string }) => void;
    acceptedTypes?: string[]; // e.g. ['image']
}

const MediaPickerModal: React.FC<MediaPickerModalProps> = ({ isOpen, onClose, onSelect, acceptedTypes = [] }) => {
    const [mediaItems, setMediaItems] = useState<MediaFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedItem, setSelectedItem] = useState<MediaFile | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchMedia();
            setSelectedItem(null);
        }
    }, [isOpen]);

    const fetchMedia = async () => {
        setLoading(true);
        try {
            const data = await apiService.getMediaFiles();
            let items = data.results || data;
            if (acceptedTypes.length > 0) {
                items = items.filter((item: MediaFile) => acceptedTypes.includes(item.file_type));
            }
            setMediaItems(items);
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors du chargement des médias.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);
        
        setUploading(true);
        try {
            await apiService.uploadMediaFile(formData);
            toast.success("Fichier téléversé !");
            fetchMedia();
        } catch (error) {
            toast.error("Échec de l'upload du fichier.");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleConfirm = () => {
        if (selectedItem) {
            onSelect({ url: selectedItem.file_url, id: selectedItem.id, type: selectedItem.file_type });
            onClose();
        }
    };

    if (!isOpen) return null;

    const filteredItems = mediaItems.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getFileIcon = (type: string) => {
        switch(type) {
            case 'image': return <ImageIcon className="w-8 h-8 text-gray-400" />;
            case 'audio': return <Music className="w-8 h-8 text-blue-400" />;
            case 'video': return <Video className="w-8 h-8 text-purple-400" />;
            default: return <File className="w-8 h-8 text-gray-500" />;
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[95vh] sm:h-[85vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200">
                    <h2 className="text-base sm:text-xl font-semibold text-gray-800">Sélectionner un média</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-3 sm:p-4 border-b border-gray-100 bg-gray-50/50 gap-2 sm:gap-4">
                    <div className="flex gap-2 sm:gap-4">
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleUpload} 
                            className="hidden" 
                            accept={acceptedTypes.length > 0 ? (acceptedTypes.includes('image') ? 'image/*' : undefined) : undefined}
                        />
                        <Button 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="bg-[#2271b1] hover:bg-[#135e96] text-white h-9 text-xs sm:text-sm whitespace-nowrap"
                        >
                            {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Téléverser un fichier
                        </Button>
                    </div>
                    <div className="relative w-full sm:w-auto">
                        <input 
                            id="media-search"
                            name="media-search"
                            type="text" 
                            placeholder="Chercher..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8 pr-3 py-1.5 border border-gray-300 rounded-md text-sm outline-none focus:border-[#2271b1] w-full sm:w-64"
                        />
                        <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                    {/* Media Grid */}
                    <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gray-50">
                        {loading ? (
                            <div className="flex items-center justify-center h-full min-h-[200px]">
                                <Loader2 className="w-8 h-8 animate-spin text-[#2271b1]" />
                            </div>
                        ) : filteredItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-gray-400">
                                <File className="w-12 h-12 mb-3 opacity-20" />
                                <p>Aucun média trouvé.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-2 sm:gap-3">
                                {filteredItems.map(item => (
                                    <div 
                                        key={item.id}
                                        onClick={() => setSelectedItem(item)}
                                        className={`aspect-square relative cursor-pointer border-2 bg-white flex flex-col items-center justify-center overflow-hidden rounded-sm
                                            ${selectedItem?.id === item.id ? 'border-[#2271b1] shadow-sm relative z-10' : 'border-transparent hover:border-gray-300'}`}
                                        title={item.title}
                                    >
                                        {item.file_type === 'image' ? (
                                            <img src={item.file_url} alt={item.title} className="w-full h-full object-cover p-0.5" />
                                        ) : (
                                            <div className="flex-1 flex items-center justify-center w-full bg-gray-50 pb-4">
                                                {getFileIcon(item.file_type)}
                                            </div>
                                        )}
                                        
                                        <div className="absolute bottom-0 left-0 right-0 bg-white/95 text-gray-700 text-[9px] sm:text-[10px] p-0.5 sm:p-1 px-1 sm:px-1.5 truncate text-center font-medium border-t border-gray-100">
                                            {item.title}
                                        </div>
                                        
                                        {selectedItem?.id === item.id && (
                                            <div className="absolute top-1 right-1 bg-[#2271b1] text-white rounded p-0.5 z-20 shadow-sm">
                                                <Check className="w-3 h-3" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar Details — visible on md+ as sidebar, on mobile as bottom panel */}
                    {selectedItem && (
                        <div className="w-full md:w-72 bg-gray-50 border-t md:border-t-0 md:border-l border-gray-200 p-3 sm:p-4 flex flex-row md:flex-col overflow-y-auto gap-3 md:gap-0 shrink-0 max-h-[180px] md:max-h-none">
                            <h3 className="font-semibold text-gray-800 mb-0 md:mb-4 pb-0 md:pb-2 border-b-0 md:border-b hidden md:block">Détails du fichier</h3>
                            <div className="w-20 h-20 md:w-auto md:h-auto md:aspect-video bg-gray-200 flex items-center justify-center border border-gray-300 rounded overflow-hidden shrink-0">
                                {selectedItem.file_type === 'image' ? (
                                    <img src={selectedItem.file_url} className="w-full h-full object-contain" alt="" />
                                ) : (
                                    getFileIcon(selectedItem.file_type)
                                )}
                            </div>
                            <div className="space-y-1 md:space-y-3 text-sm flex-1 md:mt-4">
                                <div><span className="text-gray-500 block text-[10px] md:text-xs uppercase font-bold">Nom</span> <span className="break-all text-xs md:text-sm">{selectedItem.title}</span></div>
                                <div><span className="text-gray-500 block text-[10px] md:text-xs uppercase font-bold">Type</span> <span className="capitalize text-xs md:text-sm">{selectedItem.file_type}</span></div>
                                <div><span className="text-gray-500 block text-[10px] md:text-xs uppercase font-bold">Taille</span> <span className="text-xs md:text-sm">{selectedItem.formatted_size}</span></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 sm:p-4 border-t border-gray-200 flex justify-end gap-3 bg-white">
                    <Button variant="outline" onClick={onClose} className="px-4 sm:px-6 text-sm">Annuler</Button>
                    <Button 
                        onClick={handleConfirm} 
                        disabled={!selectedItem}
                        className="bg-[#2271b1] hover:bg-[#135e96] text-white px-4 sm:px-6 font-semibold text-sm"
                    >
                        Insérer
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default MediaPickerModal;
