import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play as PlayIcon, VolumeX, Music } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { getFullImageUrl, getMediaUrl } from "@/lib/utils";

interface MediaHubProps {
    emission: any;
    forceContentType?: 'audio' | 'video' | 'youtube';
    forceUrl?: string;
}

const MediaHub: React.FC<MediaHubProps> = ({ emission, forceContentType, forceUrl }) => {
    const { t } = useTranslation();
    
    // Internal States
    const [isReady, setIsReady] = useState(false);
    const [playerError, setPlayerError] = useState<string | null>(null);

    // Resolve Media URL - Direct Supabase streaming (no proxy, no redirect)
    const { finalMediaUrl, isYoutube, forceAudioType, isBlockedDrive } = useMemo(() => {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const baseUrl = apiUrl.replace('/api', '').replace(/\/$/, '');

        const getYoutubeId = (url: string) => {
            if (!url || !url.includes('youtu')) return null;
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/|live\/)([^#&?]*).*/;
            const match = url.match(regExp);
            return (match && match[2].length === 11) ? match[2] : null;
        };

        // 1. Prioritize forceUrl if provided (Admin Preview)
        if (forceUrl) {
            const ytId = getYoutubeId(forceUrl);
            const isYt = !!ytId;
            const isAudio = forceUrl.toLowerCase().endsWith('.mp3') || 
                            forceUrl.toLowerCase().endsWith('.wav') || 
                            forceUrl.toLowerCase().endsWith('.m4a') ||
                            forceContentType === 'audio';
            
            return {
                finalMediaUrl: isYt ? forceUrl : getMediaUrl(forceUrl),
                isYoutube: isYt,
                forceAudioType: isAudio && !isYt
            };
        }

        // 2. Emission resolution logic
        let rawUrl = "";
        let isYt = false;
        let isAud = false;

        const videoUrl = emission.video_url || "";
        const videoFile = emission.video_file_url || emission.video_file || "";
        const audioFile = emission.audio_file_url || emission.audio_file || "";
        const audioUrl = emission.audio_url || "";
        const contentType = emission.content_type;

        // Détecter YouTube UNIQUEMENT si l'URL est vraiment YouTube
        const ytId = getYoutubeId(videoUrl);
        const isRealYoutube = !!ytId;

        // PRIORITÉ : content_type du backend > fichier uploadé > URL externe
        // Si content_type est explicitement défini, le respecter
        if (contentType === 'youtube' && isRealYoutube) {
            // YouTube a la priorité quand content_type === 'youtube'
            rawUrl = videoUrl;
            isYt = true;
        }
        else if (contentType === 'video' && videoFile) {
            rawUrl = videoFile;
            isYt = false;
        }
        else if (contentType === 'audio' && (audioFile || audioUrl)) {
            rawUrl = audioFile || audioUrl;
            isAud = true;
        }
        // Fallback : détection automatique si content_type ne correspond pas
        else if (videoFile) {
            rawUrl = videoFile;
            isYt = false;
        }
        else if (isRealYoutube) {
            rawUrl = videoUrl;
            isYt = true;
        }
        else if (audioFile) {
            rawUrl = audioFile;
            isAud = true;
        }
        else if (videoUrl && !videoUrl.includes('drive.google.com')) {
            rawUrl = videoUrl;
        }
        else if (audioUrl && !audioUrl.includes('drive.google.com')) {
            rawUrl = audioUrl;
            isAud = true;
        }

        // Forcer le type audio si content_type le dit et qu'on n'a pas de vidéo
        if (contentType === 'audio' && !videoFile && !isYt) {
            isAud = true;
        }

        const resolvedUrl = isYt ? rawUrl : getMediaUrl(rawUrl);
        const isDrive = (emission.video_url || "").includes('drive.google.com') || (emission.audio_url || "").includes('drive.google.com') || (forceUrl || "").includes('drive.google.com');

        return {
            finalMediaUrl: resolvedUrl,
            isYoutube: isYt,
            forceAudioType: isAud || forceContentType === 'audio',
            isBlockedDrive: isDrive && !resolvedUrl
        };
    }, [emission, forceContentType, forceUrl]);


    // Reset states when URL changes
    useEffect(() => {
        setIsReady(false);
        setPlayerError(null);
    }, [finalMediaUrl]);

    // Timeout for loading warning
    useEffect(() => {
        let timeout: any;
        if (!isReady && !playerError && finalMediaUrl && !isYoutube) {
            timeout = setTimeout(() => {
                if (!isReady) {
                    console.warn(`[MediaHub] Loading timeout for: ${finalMediaUrl}`);
                    toast.warning(t("common.loading_long") || "Le chargement prend du temps...");
                }
            }, 30000);
        }
        return () => clearTimeout(timeout);
    }, [isReady, playerError, finalMediaUrl, isYoutube, t]);


    // ═══════════════════════════════════════
    // RENDER: No media available
    // ═══════════════════════════════════════
    if (!finalMediaUrl) {
        return (
            <div className="aspect-video w-full rounded-2xl md:rounded-[2rem] overflow-hidden shadow-xl bg-black flex items-center justify-center border border-white/10 relative">
                {emission.image_url && <img src={getFullImageUrl(emission.image_url)} alt="" className="w-full h-full object-cover opacity-20 absolute inset-0" />}
                
                <div className="relative z-10 p-6 text-center">
                    {isBlockedDrive ? (
                        <div className="space-y-4">
                            <div className="bg-orange-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <VolumeX className="w-8 h-8 text-orange-500" />
                            </div>
                            <h3 className="text-white font-bold text-lg">Lien Google Drive non supporté</h3>
                            <p className="text-white/60 text-xs max-w-xs mx-auto">
                                Google Drive bloque souvent la lecture directe. Veuillez uploader le fichier vidéo/audio directement dans l'administration.
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4 text-white/20">
                            <PlayIcon className="w-12 h-12 md:w-16 md:h-16 fill-current" />
                            <p className="font-bold uppercase tracking-widest text-xs">{t("common.media_not_available")}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════
    // RENDER: Error state
    // ═══════════════════════════════════════
    if (playerError) {
        return (
            <div className="aspect-video w-full rounded-2xl md:rounded-[2rem] overflow-hidden shadow-xl bg-black flex flex-col items-center justify-center border-2 border-destructive/50 p-6 md:p-8 text-center space-y-3 md:space-y-4">
                <div className="bg-destructive/10 p-3 md:p-4 rounded-full">
                    <VolumeX className="w-8 h-8 md:w-12 md:h-12 text-destructive" />
                </div>
                <div>
                    <h3 className="text-lg md:text-xl font-bold text-white mb-1 md:mb-2">{t("common.error_loading_media") || "Erreur de chargement"}</h3>
                    <p className="text-white/60 text-xs md:text-sm max-w-md mx-auto mb-6">
                        Désolé, nous n'avons pas pu lire ce média directement.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <button 
                            onClick={() => window.open(finalMediaUrl, '_blank')}
                            className="w-full sm:w-auto px-6 py-2.5 bg-accent text-accent-foreground rounded-xl font-bold hover:bg-accent/90 transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
                        >
                            <PlayIcon className="w-4 h-4 fill-current" />
                            Ouvrir le média
                        </button>
                        
                        <button 
                            onClick={() => { setPlayerError(null); setIsReady(false); }}
                            className="w-full sm:w-auto px-6 py-2.5 bg-white/10 text-white border border-white/10 rounded-xl font-bold hover:bg-white/20 transition-all text-sm"
                        >
                            Réessayer
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════
    // RENDER: YouTube Player
    // ═══════════════════════════════════════
    if (isYoutube) {
        // Extraction robuste de l'ID
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/|live\/)([^#&?]*).*/;
        const match = finalMediaUrl.match(regExp);
        const ytVideoId = (match && match[2].length === 11) ? match[2] : null;

        if (!ytVideoId) {
            return (
                <div className="aspect-video w-full rounded-2xl md:rounded-[2rem] overflow-hidden shadow-xl bg-black flex flex-col items-center justify-center border-2 border-destructive/30 p-6 text-center">
                    <VolumeX className="w-10 h-10 text-destructive mb-3" />
                    <h3 className="text-white font-bold">Lien YouTube invalide</h3>
                    <p className="text-white/40 text-xs mt-2">Nous n'avons pas pu extraire l'identifiant de cette vidéo.</p>
                </div>
            );
        }

        // Ajout du paramètre origin pour la compatibilité mobile (HTTPS obligatoire)
        const origin = window.location.origin;

        return (
            <div className="aspect-video w-full rounded-2xl md:rounded-[2rem] overflow-hidden shadow-xl border border-white/10 bg-black">
                <iframe 
                    id={`youtube-player-${emission.id}`}
                    width="100%" 
                    height="100%" 
                    src={`https://www.youtube-nocookie.com/embed/${ytVideoId}?rel=0&modestbranding=1&enablejsapi=1&origin=${encodeURIComponent(origin)}`}
                    title={emission.title || "YouTube video player"} 
                    data-name="sh-player-youtube"
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen
                    className="w-full h-full"
                    onLoad={() => setIsReady(true)}
                />
            </div>
        );
    }

    // ═══════════════════════════════════════
    // RENDER: Audio Player (Design adapté mobile)
    // ═══════════════════════════════════════
    if (forceAudioType) {
        return (
            <div className="w-full rounded-2xl md:rounded-[2rem] overflow-hidden shadow-xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="relative">
                    {/* Cover image (si disponible) */}
                    {emission.image_url && (
                        <div className="relative w-full aspect-[2/1] md:aspect-[3/1]">
                            <img 
                                src={getFullImageUrl(emission.image_url)} 
                                alt="" 
                                className="w-full h-full object-cover opacity-40"
                                crossOrigin="anonymous"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
                        </div>
                    )}

                    {/* Audio info + controls */}
                    <div className={`${emission.image_url ? '-mt-16 relative z-10' : ''} p-5 md:p-8 space-y-4`}>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-accent/20 backdrop-blur-sm border border-accent/30 flex items-center justify-center flex-shrink-0">
                                <Music className="w-7 h-7 md:w-8 md:h-8 text-accent" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-white font-bold text-sm md:text-base truncate">
                                    {emission.title || "Audio"}
                                </p>
                                <p className="text-white/50 text-xs md:text-sm truncate">
                                    {emission.preacher_name || t("common.default_preacher")}
                                </p>
                            </div>
                        </div>

                        {/* Lecteur audio natif — contrôles du navigateur = fiabilité maximale sur mobile */}
                        <audio 
                            id={`audio-player-${emission.id}`}
                            data-name="sh-player-audio"
                            key={finalMediaUrl}
                            src={finalMediaUrl}
                            controls 
                            preload="metadata"
                            className="w-full h-12 md:h-14 rounded-xl"
                            style={{ colorScheme: 'dark' }}
                            aria-label={emission.title || "Lecteur audio"}
                            controlsList="nodownload"
                            onLoadedMetadata={() => setIsReady(true)}
                            onCanPlayThrough={() => setIsReady(true)}
                            onError={(e) => {
                                console.error("[MediaHub] Audio Error:", finalMediaUrl, e);
                                setPlayerError("Impossible de lire ce fichier audio");
                            }}
                        >
                            Votre navigateur ne supporte pas la lecture audio.
                        </audio>
                    </div>
                </div>

                {/* Loading overlay */}
                <AnimatePresence>
                    {!isReady && !playerError && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-[45] flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-2xl md:rounded-[2rem] pointer-events-none"
                        >
                            <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // ═══════════════════════════════════════
    // RENDER: Video Player (natif HTML5 — le plus fiable sur mobile)
    // ═══════════════════════════════════════
    return (
        <div 
            id="custom-player-container"
            className="relative bg-black rounded-2xl md:rounded-[2rem] overflow-hidden shadow-xl border border-white/10 select-none w-full aspect-video min-h-[210px] sm:min-h-[300px]"
        >
            {/* Lecteur vidéo natif — contrôles du navigateur = fiabilité maximale sur mobile */}
            <video 
                id={`video-player-${emission.id}`}
                data-name="sh-player-video"
                key={finalMediaUrl}
                src={finalMediaUrl}
                controls 
                playsInline
                webkit-playsinline="true"
                preload="metadata"
                className="w-full h-full object-contain bg-black"
                aria-label={emission.title || "Lecteur vidéo"}
                poster={getFullImageUrl(emission.image_url) || undefined}
                controlsList="nodownload"
                onLoadedMetadata={() => setIsReady(true)}
                onCanPlay={() => {
                    console.log("[MediaHub] Video ready:", finalMediaUrl);
                    setIsReady(true);
                }}
                onError={(e) => {
                    console.error("[MediaHub] Video Error:", finalMediaUrl, e);
                    setPlayerError("Impossible de lire cette vidéo");
                }}
            >
                Votre navigateur ne supporte pas la lecture vidéo.
            </video>

            {/* Loading Indicator */}
            <AnimatePresence>
                {!isReady && !playerError && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[45] flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px] p-4 text-center pointer-events-none"
                    >
                        <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mb-3" />
                        <p className="text-white font-bold text-xs uppercase tracking-widest animate-pulse">Chargement...</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MediaHub;
