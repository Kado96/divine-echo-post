import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Headphones, User, ArrowLeft, Play, Download, Share2, Facebook, MessageCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiService } from "@/lib/api";
import { stripHtml } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";

const SermonDetail = () => {
    const { slug } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [sermon, setSermon] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSermon = async () => {
            if (!slug) return;
            try {
                const data = await apiService.getSermonBySlug(slug);
                setSermon(data);
            } catch (err: any) {
                console.error("Failed to fetch sermon", err);
                setError(t("common.error_loading"));
            } finally {
                setLoading(false);
            }
        };
        fetchSermon();
    }, [slug, t]);

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

    if (error || !sermon) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="container mx-auto px-4 py-40 text-center">
                    <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-4">{error || t("common.sermon_not_found")}</h1>
                    <Button onClick={() => navigate("/#emissions")}>{t("common.back")}</Button>
                </div>
                <Footer />
            </div>
        );
    }

    const renderPlayer = () => {
        const videoUrl = sermon.video_url || "";
        const youtubeRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const youtubeMatch = videoUrl.match(youtubeRegExp);
        const isYoutubeUrl = youtubeMatch && youtubeMatch[2].length === 11;
        const videoId = isYoutubeUrl ? youtubeMatch[2] : "";

        if (isYoutubeUrl || (sermon.content_type === "youtube" && videoId)) {
            return (
                <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl bg-black">
                    <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title={sermon.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            );
        } else if (sermon.content_type === "video" && (sermon.video_file || sermon.video_url)) {
            return (
                <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl bg-black">
                    <video
                        controls
                        className="w-full h-full"
                        poster={sermon.image_url}
                    >
                        <source src={sermon.video_file || sermon.video_url} type="video/mp4" />
                        {t("common.browser_video_error")}
                    </video>
                </div>
            );
        } else if (sermon.content_type === "audio" && (sermon.audio_file || sermon.audio_url)) {
            return (
                <div className="bg-card rounded-2xl p-8 shadow-xl border border-border">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="w-48 h-48 rounded-xl overflow-hidden shadow-lg shrink-0">
                            <img src={sermon.image_url || "/placeholder-sermon.jpg"} alt={sermon.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 w-full">
                            <h3 className="text-xl font-bold mb-4">{t("common.listen_audio")}</h3>
                            <audio
                                controls
                                className="w-full mb-6"
                            >
                                <source src={sermon.audio_file || sermon.audio_url} type="audio/mpeg" />
                                {t("common.browser_audio_error")}
                            </audio>
                            <div className="flex flex-wrap gap-4">
                                <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                                    <Download className="w-4 h-4" /> {t("common.download")}
                                </Button>
                                <Button variant="outline" className="gap-2">
                                    <Share2 className="w-4 h-4" /> {t("common.share")}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        return (
            <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl bg-black flex items-center justify-center">
                {sermon.image_url ? (
                    <img src={sermon.image_url} alt={sermon.title} className="w-full h-full object-cover" />
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
                    title={stripHtml(sermon.title)}
                    subtitle={stripHtml(sermon.category_name || t("common.general"))}
                    image={sermon.image_url}
                />

                <div className="container mx-auto px-4 py-12">
                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Main Player Area */}
                        <div className="flex-1 space-y-8">
                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center gap-2 text-muted-foreground hover:text-accent font-medium transition-colors mb-4"
                            >
                                <ArrowLeft className="w-4 h-4" /> {t("common.back")}
                            </button>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                {renderPlayer()}
                            </motion.div>

                            <div className="space-y-6">
                                <div className="flex flex-wrap items-center gap-6 py-6 border-y border-border">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <User className="w-5 h-5 text-accent" />
                                        <span className="font-semibold">{stripHtml(sermon.preacher_name || t("common.default_preacher"))}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Calendar className="w-5 h-5 text-accent" />
                                        <span>{new Date(sermon.sermon_date || sermon.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Headphones className="w-5 h-5 text-accent" />
                                        <span>{sermon.views_count || 0} {t("common.listeners_count")}</span>
                                    </div>
                                </div>

                                <div className="prose prose-lg max-w-none text-foreground/80">
                                    <h2 className="text-2xl font-bold text-foreground mb-4">{t("common.description")}</h2>
                                    <div className="whitespace-pre-wrap leading-relaxed">
                                        {stripHtml(sermon.description || t("common.no_description"))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Info */}
                        <aside className="w-full lg:w-96 space-y-8">
                            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm sticky top-24">
                                <h3 className="text-xl font-bold mb-6">{t("common.share_this")}</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <Button variant="outline" className="gap-2 justify-center border-blue-100 hover:bg-blue-50 text-blue-600">
                                        <Facebook className="w-4 h-4" /> Facebook
                                    </Button>
                                    <Button variant="outline" className="gap-2 justify-center border-green-100 hover:bg-green-50 text-green-600">
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
                                            <p className="font-bold">{sermon.preacher_name || t("common.default_preacher")}</p>
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

export default SermonDetail;
