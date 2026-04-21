import React, { useState, useRef, useEffect, useMemo } from 'react';
import ReactPlayer from 'react-player';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Play as PlayIcon, Pause, Volume2, VolumeX, 
    Maximize, Settings, Headphones 
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { 
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    const [playing, setPlaying] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [volume, setVolume] = useState(0.8);
    const [muted, setMuted] = useState(false);
    const [played, setPlayed] = useState(0);
    const [loaded, setLoaded] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1.0);
    const [seeking, setSeeking] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [playerError, setPlayerError] = useState<string | null>(null);
    const [hasRetriedFromProd, setHasRetriedFromProd] = useState(false);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        };
    }, []);

    // Handlers
    const handlePlayPause = () => {
        // If it's a play action, we might want to wait for ready, but better to just set state
        setPlaying(!playing);
    };

    const handleProgress = (state: any) => {
        if (!seeking) {
            setPlayed(state.played);
            setLoaded(state.loaded);
        }
    };

    const handleSeek = (val: number[]) => {
        setPlayed(val[0]);
        if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
            playerRef.current.seekTo(val[0]);
        }
    };

    const formatTime = (seconds: number) => {
        const date = new Date(seconds * 1000);
        const hh = date.getUTCHours();
        const mm = date.getUTCMinutes();
        const ss = date.getUTCSeconds().toString().padStart(2, '0');
        if (hh) return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
        return `${mm}:${ss}`;
    };

    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
            if (playing) setShowControls(false);
        }, 3000);
    };

    const toggleFullscreen = () => {
        const playerElement = document.getElementById('custom-player-container');
        if (!playerElement) return;
        if (!document.fullscreenElement) {
            playerElement.requestFullscreen().catch(e => console.error(e));
        } else {
            document.exitFullscreen();
        }
    };
    
    // Timeout for loading
    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (playing && !isReady && !playerError) {
            timeout = setTimeout(() => {
                if (!isReady) {
                    console.error("[MediaHub] Loading timeout reached");
                    setPlayerError("Le chargement prend plus de temps que prévu. Le serveur de production est peut-être en train de se réveiller (cela peut prendre 1 min). Veuillez réessayer dans quelques instants.");
                }
            }, 60000); // 60 seconds timeout (to handle Render cold boots)
        }
        return () => clearTimeout(timeout);
    }, [playing, isReady, playerError]);


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
                    onClick={() => { setPlayerError(null); setIsReady(false); setPlaying(true); }}
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
            onMouseMove={handleMouseMove}
            onMouseLeave={() => playing && setShowControls(false)}
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
            <div className={`relative z-10 w-full h-full ${forceAudioType ? "absolute opacity-0 pointer-events-none w-[400px] h-[400px] top-0 left-0" : ""}`}>
                <ReactPlayer
                    key={`${emission.slug}-${forceContentType}`}
                    ref={playerRef}
                    url={finalMediaUrl}
                    playing={playing && isReady} // Only play when actually ready to avoid AbortError
                    volume={volume}
                    muted={muted}
                    playbackRate={playbackRate}
                    width="100%"
                    height="100%"
                    playsinline
                    onReady={() => {
                        console.log(`[MediaHub] Player ready for ${emission.slug}`);
                        setIsReady(true);
                        if (playerRef.current) setDuration(playerRef.current.getDuration());
                    }}
                    onProgress={handleProgress}
                    onEnded={() => setPlaying(false)}
                    onPlay={() => setPlaying(true)}
                    onPause={() => setPlaying(false)}
                    onError={(e) => {
                        console.error(`[MediaHub] Error loading ${finalMediaUrl}:`, e);
                        
                        // IF we are in local and the file failed, attempt a fallback to Production
                        const PRODUCTION_BASE = "https://shalom-ministry-backend-ipu3.onrender.com";
                        if (!hasRetriedFromProd && finalMediaUrl.includes("localhost")) {
                            console.log("[MediaHub] Local file failed, attempting production fallback...");
                            setHasRetriedFromProd(true);
                            setPlayerError(null); // Reset error temporarily
                            setIsReady(false);
                            return; // The re-render with hasRetriedFromProd=true will update finalMediaUrl
                        }

                        setPlayerError(String(e) || "True");
                        toast.error(t("common.error_loading_media"));
                        setPlaying(false);
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

                    {/* Audio Info Overlay */}
            {forceAudioType && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-8 bg-black/20">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12"
                    >
                        <h3 className="text-4xl md:text-5xl font-black text-white mb-4 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] leading-tight">{emission.title}</h3>
                        <div className="inline-flex items-center gap-3 px-6 py-2 bg-accent/20 backdrop-blur-md rounded-full border border-white/20">
                            <Headphones className="w-5 h-5 text-accent" />
                            <p className="text-white font-bold uppercase tracking-[0.2em] text-sm">
                                {emission.preacher_name || t("common.default_preacher")}
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Loading Indicator (When playing but not ready) */}
            <AnimatePresence>
                {playing && !isReady && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[45] flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]"
                    >
                        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-white font-bold text-xs uppercase tracking-widest animate-pulse">Chargement...</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Surface Click to Play/Pause (Video only) */}
            {!isYoutube && !forceAudioType && !showControls && (
                <div className="absolute inset-0 z-30 cursor-pointer" onClick={handlePlayPause} />
            )}

            {/* BIG CENTER PLAY BUTTON */}
            <AnimatePresence>
                {(!playing || showControls) && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.2 }}
                        className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"
                    >
                        <button 
                            className="w-24 h-24 rounded-full bg-accent/90 text-white shadow-[0_0_50px_rgba(var(--accent-rgb),0.5)] flex items-center justify-center backdrop-blur-sm transform transition-transform border-4 border-white/20 active:scale-90 pointer-events-auto"
                            onClick={(e) => { e.stopPropagation(); handlePlayPause(); }}
                        >
                            {!isReady && playing ? (
                                <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                playing ? <Pause className="w-10 h-10 fill-current" /> : <PlayIcon className="w-10 h-10 fill-current ml-2" />
                            )}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CONTROL BAR */}
            <motion.div 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: showControls ? 0 : 100, opacity: showControls ? 1 : 0 }}
                className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/95 via-black/80 to-transparent pt-20 pb-6 px-6"
            >
                <div className="mb-4 relative group/slider">
                    <Slider 
                        value={[played]} 
                        max={1} 
                        step={0.0001} 
                        onValueChange={handleSeek}
                        onPointerDown={() => setSeeking(true)}
                        onPointerUp={() => setSeeking(false)}
                        className="cursor-pointer"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button className="text-white hover:text-accent transition-colors" onClick={handlePlayPause}>
                            {playing ? <Pause className="w-7 h-7" /> : <PlayIcon className="w-7 h-7 fill-current" />}
                        </button>
                        
                        <div className="flex items-center gap-3 group/volume">
                            <button className="text-white hover:text-accent transition-colors" onClick={() => setMuted(!muted)}>
                                {muted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                            </button>
                            <div className="w-0 overflow-hidden group-hover/volume:w-24 transition-all duration-300">
                                <Slider 
                                    value={[muted ? 0 : volume]} 
                                    max={1} 
                                    step={0.01} 
                                    onValueChange={(val) => { setVolume(val[0]); setMuted(false); }}
                                    className="w-24 cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="text-white/90 font-mono text-sm tracking-tighter">
                            {formatTime(played * duration)} <span className="text-white/40">/</span> {formatTime(duration)}
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center gap-2 text-white/70 hover:text-white font-bold text-sm bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 outline-none transition-all">
                                <Settings className="w-4 h-4" />
                                {playbackRate}x
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-black/90 backdrop-blur-xl border-white/10 text-white min-w-[120px]">
                                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                                    <DropdownMenuItem 
                                        key={rate} 
                                        onClick={() => setPlaybackRate(rate)}
                                        className={`focus:bg-accent focus:text-white cursor-pointer ${playbackRate === rate ? "bg-accent/20 text-accent" : ""}`}
                                    >
                                        {rate}x {rate === 1.0 && "(Normal)"}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <button className="text-white/70 hover:text-white transition-colors" onClick={toggleFullscreen}>
                            <Maximize className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default MediaHub;
