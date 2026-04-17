import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Headphones, User, ArrowLeft, Play, Download, Share2, Facebook, MessageCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiService } from "@/lib/api";
import { stripHtml, getFullImageUrl, formatPublicTitle } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import ReactPlayer from 'react-player';

const EmissionDetail = () => {
    const { slug } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [emission, setEmission] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEmission = async () => {
            if (!slug) return;
            try {
                const data = await apiService.getEmissionBySlug(slug);
                setEmission(data);
            } catch (err: any) {
                console.error("Failed to fetch emission", err);
                setError(t("common.error_loading"));
            } finally {
                setLoading(false);
            }
        };
        fetchEmission();
    }, [slug, t]);

    const handleDownload = () => {
        if (!emission) return;
        const fileUrl = emission.audio_file || emission.audio_url || emission.video_file || emission.video_url; // Use raw url for download, rely on full image url if it was relative but these should be absolute per recent CORS updates or rely on browser to handle relative
        const fullFileUrl = getFullImageUrl(fileUrl);
        if (!fullFileUrl) {
            alert(t("common.no_download_available") || "Aucun fichier à télécharger");
            return;
        }
        
        let extension = '.mp3';
        if (emission.content_type === 'video' || fullFileUrl.toLowerCase().endsWith('.mp4')) {
            extension = '.mp4';
        }

        const link = document.createElement("a");
        link.href = fullFileUrl;
        link.target = "_blank";
        link.download = `${emission.title}${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleShare = async () => {
        if (!emission) return;
        const shareData = {
            title: stripHtml(emission.title),
            text: stripHtml(emission.description || emission.title),
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log("Error sharing:", err);
            }
        } else {
            // Fallback: Copy to clipboard
            try {
                await navigator.clipboard.writeText(window.location.href);
                alert("Lien copié dans le presse-papier !");
            } catch (err) {
                console.error("Failed to copy:", err);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="flex items-center justify-center py-40">
                    <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !emission) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="container mx-auto px-4 py-40 text-center">
                    <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-4">{error || t("common.emission_not_found")}</h1>
                    <Button onClick={() => navigate("/#emissions")}>{t("common.back")}</Button>
                </div>
                <Footer />
            </div>
        );
    }

    const renderPlayer = () => {
        const videoUrl = emission.video_url || "";
        const youtubeRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const youtubeMatch = videoUrl.match(youtubeRegExp);
        const isYoutubeUrl = youtubeMatch && youtubeMatch[2].length === 11;

        const mediaUrl = isYoutubeUrl ? videoUrl : getFullImageUrl(emission.video_file || emission.video_url || emission.audio_file || emission.audio_url);

        if (mediaUrl) {
            return (
                <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl bg-black relative">
                    {/* For audio only, show poster if available since ReactPlayer might not fill it visually like a video player */}
                    {emission.content_type === "audio" && (
                         <img src={getFullImageUrl(emission.image_url) || "/placeholder-emission.jpg"} alt={emission.title} className="absolute inset-0 w-full h-full object-cover opacity-30" />
                    )}
                    <div className="absolute inset-0 flex items-center mb-8 px-4 justify-between h-fit z-10 pointer-events-none mt-4">
                         {emission.content_type === "audio" && (
                            <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full pointer-events-auto flex items-center justify-between w-full mx-4">
                                <h3 className="text-white font-semibold text-sm line-clamp-1">{emission.title}</h3>
                                <div className="flex gap-2">
                                     <Button size="icon" variant="ghost" className="text-white hover:bg-white/20 h-8 w-8" onClick={handleDownload} title={t("common.download") as string}>
                                         <Download className="w-4 h-4" />
                                     </Button>
                                </div>
                            </div>
                         )}
                    </div>
                    <ReactPlayer
                        url={mediaUrl as string}
                        controls
                        width="100%"
                        height="100%"
                        style={{ position: 'absolute', top: 0, left: 0 }}
                        config={{
                            file: {
                                attributes: {
                                    poster: getFullImageUrl(emission.image_url)
                                }
                            }
                        }}
                    />
                </div>
            );
        }

        return (
            <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl bg-black flex items-center justify-center">
                {emission.image_url ? (
                    <img src={getFullImageUrl(emission.image_url)} alt={emission.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="flex flex-col items-center gap-4 text-muted-foreground">
                        <Play className="w-12 h-12 opacity-20" />
                        <p>{t("common.media_not_available")}</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <main className="flex-1">
                <PageHero
                    title={formatPublicTitle(stripHtml(emission.title))}
                    subtitle={stripHtml(emission.category_name || t("common.general"))}
                    image={getFullImageUrl(emission.image_url)}
                />

                <div className="container mx-auto px-4 py-12">
                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Main Player Area */}
                        <div className="flex-1 space-y-8">
                            <Link
                                to="/#emissions"
                                className="inline-flex items-center gap-2 text-muted-foreground hover:text-accent font-medium transition-colors mb-4 group"
                            >
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {t("common.back")}
                            </Link>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="relative z-10"
                            >
                                {renderPlayer()}
                            </motion.div>

                            <div className="space-y-6">
                                <div className="flex flex-wrap items-center gap-6 py-6 border-y border-border">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <User className="w-5 h-5 text-accent" />
                                        <span className="font-semibold">{stripHtml(emission.preacher_name || t("common.default_preacher"))}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Calendar className="w-5 h-5 text-accent" />
                                        <span>{(emission.emission_date || emission.sermon_date) ? new Date(emission.emission_date || emission.sermon_date).toLocaleDateString() : new Date(emission.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Headphones className="w-5 h-5 text-accent" />
                                        <span>{emission.views_count || 0} {t("common.listeners_count")}</span>
                                    </div>
                                </div>

                                <div className="prose prose-lg max-w-none text-foreground/80">
                                    <h2 className="text-2xl font-bold text-foreground mb-4">{t("common.description")}</h2>
                                    <div className="whitespace-pre-wrap leading-relaxed">
                                        {stripHtml(emission.description || t("common.no_description"))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Info */}
                        <aside className="w-full lg:w-96 space-y-8">
                            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm sticky top-24">
                                <h3 className="text-xl font-bold mb-6">{t("common.share_this")}</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <Button
                                        variant="outline"
                                        className="gap-2 justify-center border-blue-100 hover:bg-blue-50 text-blue-600"
                                        onClick={() => {
                                            const shareUrl = window.location.href;
                                            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'width=600,height=400');
                                        }}
                                    >
                                        <Facebook className="w-4 h-4" /> Facebook
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="gap-2 justify-center border-green-100 hover:bg-green-50 text-green-600"
                                        onClick={() => {
                                            const shareUrl = window.location.href;
                                            const shareTitle = stripHtml(emission.title);
                                            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + " " + shareUrl)}`, '_blank');
                                        }}
                                    >
                                        <MessageCircle className="w-4 h-4" /> WhatsApp
                                    </Button>
                                </div>

                                <div className="mt-10">
                                    <h3 className="text-lg font-bold mb-4">{t("common.about_speaker")}</h3>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                                            <User className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold">{emission.preacher_name || t("common.default_preacher")}</p>
                                            <p className="text-sm text-muted-foreground">{t("common.ministry_role")}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {t("common.join_us_teaching")}
                                    </p>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default EmissionDetail;
