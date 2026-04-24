import React, { useState, useRef, useEffect, useMemo } from 'react';
import ReactPlayer from 'react-player';
import { motion, AnimatePresence } from 'framer-motion';
import { Play as PlayIcon, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { getFullImageUrl } from "@/lib/utils";

interface MediaHubProps {
    emission: any;
    forceContentType?: 'audio' | 'video' | 'youtube';
    forceUrl?: string;
}

const MediaHub: React.FC<MediaHubProps> = ({ emission, forceContentType, forceUrl }) => {
    const { t } = useTranslation();
    const playerRef = useRef<ReactPlayer>(null);
    
    // Internal States
    // If it's YouTube, we use light mode which is instant, so we start as ready
    const [isReady, setIsReady] = useState(false);
    const [playerError, setPlayerError] = useState<string | null>(null);
    const [hasRetriedFromProd, setHasRetriedFromProd] = useState(false);

    // Resolve Media URL with intelligent fallback
    const { finalMediaUrl, isYoutube, forceAudioType } = useMemo(() => {
        const isYoutubeRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        
        // 1. Prioritize forceUrl if provided (Admin Preview)
        if (forceUrl) {
            const isYt = forceUrl.includes('youtube.com') || forceUrl.includes('youtu.be');
            const isAudio = forceUrl.toLowerCase().endsWith('.mp3') || 
                            forceUrl.toLowerCase().endsWith('.wav') || 
                            forceUrl.toLowerCase().endsWith('.m4a') ||
                            forceContentType === 'audio';
            
            let resolved = {
                finalMediaUrl: getFullImageUrl(forceUrl),
                isYoutube: isYt,
                forceAudioType: isAudio && !isYt
            };

            // Apply manual production switch if we already failed local
            if (hasRetriedFromProd && resolved.finalMediaUrl.includes("localhost")) {
                resolved.finalMediaUrl = resolved.finalMediaUrl.replace(/http:\/\/localhost:8000|http:\/\/127.0.0.1:8000/g, "https://shalom-ministry-backend-ipu3.onrender.com");
            }

            return resolved;
        }

        // 2. Original emission resolution logic
        let url = "";
        let youtube = false;

        const videoUrl = emission.video_url || "";
        const videoFile = emission.video_file_url || getFullImageUrl(emission.video_file);
        const audioFile = emission.audio_file_url || getFullImageUrl(emission.audio_file);
        const audioUrl = emission.audio_url || "";

        // 1. Try based on explicit content type
        if (emission.content_type === "youtube" || videoUrl.match(isYoutubeRegExp) || videoUrl.includes('youtube.com')) {
            url = videoUrl;
            youtube = true;
        } else if (emission.content_type === "audio" || forceContentType === 'audio') {
            url = audioFile || audioUrl || videoFile || videoUrl || "";
        } else if (emission.content_type === "video" || forceContentType === 'video') {
            url = videoFile || videoUrl || audioFile || audioUrl || "";
        } else {
            // 2. Generic Fallback: find anything that exists
            url = videoUrl || videoFile || audioFile || audioUrl || "";
            youtube = Boolean(url.match(isYoutubeRegExp) || url.includes('youtube.com'));
        }

        // Final detection update
        const isActuallyYoutube = youtube || Boolean(url && (url.match(isYoutubeRegExp) || url.includes('youtube.com')));
        const isActuallyAudio = !isActuallyYoutube && (emission.content_type === "audio" || forceContentType === 'audio' || (!videoFile && !videoUrl && (audioFile || audioUrl)));

        if (url) {
            console.log(`[MediaHub] Resolved URL for ${emission.slug}:`, { url, isActuallyYoutube, isActuallyAudio });
        } else {
            console.warn(`[MediaHub] No media URL found for ${emission.slug}`, emission);
        }

        let resolved = {
            finalMediaUrl: getFullImageUrl(url),
            isYoutube: isActuallyYoutube,
            forceAudioType: isActuallyAudio
        };

        // Apply manual production switch if we already failed local
        if (hasRetriedFromProd && resolved.finalMediaUrl.includes("localhost")) {
            resolved.finalMediaUrl = resolved.finalMediaUrl.replace(/http:\/\/localhost:8000|http:\/\/127.0.0.1:8000/g, "https://shalom-ministry-backend-ipu3.onrender.com");
        }

        return resolved;
    }, [emission, forceContentType, forceUrl, hasRetriedFromProd]);


    
    // Timeout for loading warning (don't unmount player)
    useEffect(() => {
        let timeout: NodeJS.Timeout;
        // Don't timeout for YouTube/Light mode as it's immediate
        if (!isReady && !playerError && finalMediaUrl && !isYoutube) {
            timeout = setTimeout(() => {
                if (!isReady) {
                    console.warn(`[MediaHub] Loading timeout reached for: ${finalMediaUrl}`);
                    toast.warning(t("common.loading_long") || "Le chargement prend du temps. Si vous êtes en local, vérifiez que le backend est lancé.");
                }
            }, 15000); // Increased to 15 seconds for slower connections
        }
        return () => clearTimeout(timeout);
    }, [isReady, playerError, finalMediaUrl, t]);


    if (!finalMediaUrl) {
        return (
            <div className="aspect-video w-full rounded-[2.5rem] overflow-hidden shadow-2xl bg-black flex items-center justify-center border border-white/10">
                {emission.image_url ? (
                    <img src={getFullImageUrl(emission.image_url)} alt="" className="w-full h-full object-cover opacity-30" />
                ) : (
                    <div className="flex flex-col items-center gap-4 text-white/20">
                        <PlayIcon className="w-16 h-16 fill-current" />
                        <p className="font-bold uppercase tracking-widest text-xs">{t("common.media_not_available")}</p>
                    </div>
                )}
            </div>
        );
    }

    if (playerError) {
        return (
            <div className="aspect-video w-full rounded-[2.5rem] overflow-hidden shadow-2xl bg-black flex flex-col items-center justify-center border-2 border-destructive/50 p-8 text-center space-y-4">
                <div className="bg-destructive/10 p-4 rounded-full">
                    <VolumeX className="w-12 h-12 text-destructive" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white mb-2">{t("common.error_loading_media") || "Erreur de chargement"}</h3>
                    <p className="text-white/60 text-sm max-w-md mx-auto">
                        Impossible de charger le média. Vérifiez votre connexion ou que le fichier existe bien sur le serveur.
                    </p>
                    {playerError !== "True" && <p className="text-[10px] text-white/30 mt-4 font-mono break-all line-clamp-1">{playerError}</p>}
                </div>
                <button 
                    onClick={() => { setPlayerError(null); setIsReady(false); }}
                    className="px-6 py-2 bg-white text-black rounded-xl font-bold hover:bg-white/90 transition-all text-sm"
                >
                    Réessayer
                </button>
            </div>
        );
    }

    return (
        <div 
            id="custom-player-container"
            className="relative group/player bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 select-none aspect-video"
        >
            {/* Background for Audio */}
            {forceAudioType && (
                <div className="absolute inset-0 z-0">
                    <img 
                        src={getFullImageUrl(emission.image_url) || "/placeholder-emission.jpg"} 
                        alt="" 
                        className="w-full h-full object-cover opacity-60" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                </div>
            )}

            {/* THE ACTUAL PLAYER */}
            <div className={`relative z-10 w-full h-full flex flex-col justify-center items-center`}>
                <ReactPlayer
                    key={`${emission.slug}-${forceContentType}`}
                    ref={playerRef}
                    url={finalMediaUrl}
                    controls={true} // Restoring native controls for 100% reliability
                    width="100%"
                    height="100%"
                    playsinline
                    onReady={() => {
                        console.log(`[MediaHub] Player ready for ${emission.slug}`);
                        setIsReady(true);
                    }}
                    light={isYoutube ? (getFullImageUrl(emission.image_url || emission.image) || true) : false} 
                    playIcon={<div className="bg-white/20 backdrop-blur-md p-6 rounded-full border border-white/30 hover:scale-110 transition-transform cursor-pointer"><PlayIcon className="w-12 h-12 text-white fill-current" /></div>}
                    onError={(e) => {
                        console.error(`[MediaHub] Error loading ${finalMediaUrl}:`, e);
                        
                        // IF we are in local and the file failed, attempt a fallback to Production
                        if (!hasRetriedFromProd && finalMediaUrl.includes("localhost")) {
                            console.log("[MediaHub] Local file failed, attempting production fallback...");
                            setHasRetriedFromProd(true);
                            setPlayerError(null);
                            setIsReady(false);
                            return;
                        }

                        setPlayerError(String(e) || "True");
                        toast.error(t("common.error_loading_media"));
                    }}
                    config={{
                        file: {
                            forceAudio: forceAudioType,
                            attributes: { 
                                poster: getFullImageUrl(emission.image_url) || undefined,
                                preload: "auto"
                            }
                        },
                        youtube: {
                            playerVars: { showinfo: 0, modestbranding: 1, rel: 0 }
                        }
                    }}
                />
            </div>

            {/* Loading Indicator (When loading but not ready initially) */}
            <AnimatePresence>
                {!isReady && !playerError && !isYoutube && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[45] flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px] p-6 text-center"
                    >
                        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-white font-bold text-xs uppercase tracking-widest animate-pulse mb-4">Chargement...</p>
                        
                        {/* Emergency fallback button if it hangs on localhost */}
                        {!hasRetriedFromProd && finalMediaUrl.includes("localhost") && (
                            <button 
                                onClick={() => {
                                    console.log("[MediaHub] Manual override: Switching to production media");
                                    setHasRetriedFromProd(true);
                                }}
                                className="text-[10px] text-white/50 hover:text-white underline transition-colors"
                            >
                                Trop long ? Essayer la version en ligne
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default MediaHub;
