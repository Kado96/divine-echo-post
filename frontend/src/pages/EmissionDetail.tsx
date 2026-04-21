import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
    Calendar, Headphones, User, ArrowLeft, Play, 
    Share2, Facebook, MessageCircle, 
    AlertCircle, MessageSquare, Send, CheckCircle2, Download 
} from "lucide-react";
import { apiService } from "@/lib/api";
import { stripHtml, getFullImageUrl, formatPublicTitle, getLocalizedField } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import MediaHub from '@/components/media/MediaHub';
import { toast } from "sonner";
import { AnimatePresence } from "framer-motion";

const EmissionDetail = () => {
    const { slug } = useParams();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [emission, setEmission] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [similarEmissions, setSimilarEmissions] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [commentForm, setCommentForm] = useState({
        author_name: "",
        author_email: "",
        content: ""
    });

    useEffect(() => {
        const fetchEmission = async () => {
            if (!slug) return;
            try {
                const data = await apiService.getEmissionBySlug(slug);
                setEmission(data);
                
                // Fetch comments (Separate try/catch to avoid blocking emission display)
                if (data.id) {
                    try {
                        const commentsData = await apiService.getSermonComments(data.id);
                        setComments(commentsData || []);
                    } catch (commentErr) {
                        console.warn("Failed to fetch comments, but mission data is safe:", commentErr);
                        // Do not throw or set error state here
                    }
                }

                // Fetch similar emissions
                if (data.category) {
                    try {
                        let similar = await apiService.getEmissions(`category=${data.category}`);
                        similar = (similar || []).filter((e: any) => e.id !== data.id);
                        
                        // Fallback to latest if no similar found
                        if (similar.length < 2) {
                            const all = await apiService.getEmissions();
                            similar = (all || []).filter((e: any) => e.id !== data.id);
                        }
                        
                        setSimilarEmissions(similar.slice(0, 4));
                    } catch (similarErr) {
                        console.warn("Failed to fetch similar emissions:", similarErr);
                    }
                }
            } catch (err: any) {
                console.error("Failed to fetch emission or related data", err);
                setError(t("common.error_loading"));
            } finally {
                setLoading(false);
            }
        };
        fetchEmission();
    }, [slug, i18n.language, t]);

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
            try {
                await navigator.clipboard.writeText(window.location.href);
                toast.success("Lien copié !");
            } catch (err) {
                console.error("Failed to copy:", err);
            }
        }
    };

    const handleDownload = async () => {
        if (!emission) return;
        
        // Priority to actual files rather than external URLs
        const mediaFileUrl = emission.audio_file || emission.video_file || emission.video_url || emission.audio_url;
        const urlToDownload = getFullImageUrl(mediaFileUrl);
        
        if (!urlToDownload) {
            toast.error(t("common.error_loading") || "Fichier introuvable");
            return;
        }

        try {
            const link = document.createElement('a');
            link.href = urlToDownload as string;
            // Best effort download hint, browser will rely on response headers or cross-origin policy
            link.download = `${stripHtml(emission.title).replace(/[^a-z0-9]/gi, '_').toLowerCase()}.media`;
            link.target = "_blank"; // In case it cannot trigger a blob download due to CORS
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Download failed:", error);
            toast.error("Erreur lors du téléchargement");
        }
    };
    
    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!emission) return;

        if (!commentForm.author_name || !commentForm.author_email || !commentForm.content) {
            toast.error(t("common.is_required"));
            return;
        }

        try {
            setIsSubmitting(true);
            await apiService.postSermonComment({
                sermon: emission.id,
                ...commentForm
            });
            setSubmitted(true);
            setCommentForm({ author_name: "", author_email: "", content: "" });
            toast.success(t("common.comments_section.waiting_approval"));
        } catch (err: any) {
            console.error("Failed to post comment", err);
            toast.error(t("common.error_saving"));
        } finally {
            setIsSubmitting(false);
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


    return (
        <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
            {/* Immersive Background Layer */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background"></div>
                {emission.image_url && (
                    <motion.img
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 0.15, scale: 1 }}
                        transition={{ duration: 1.5 }}
                        src={getFullImageUrl(emission.image_url)}
                        className="absolute inset-0 w-full h-full object-cover blur-3xl"
                        alt=""
                    />
                )}
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-accent/5 rounded-full blur-[100px]"></div>
            </div>

            <Header />

            <main className="flex-1 relative z-10">
                <PageHero
                    title={formatPublicTitle(stripHtml(getLocalizedField(emission, 'title', i18n.language)))}
                    subtitle={stripHtml(getLocalizedField(emission, 'category_name', i18n.language) || t("common.general"))}
                    image={getFullImageUrl(emission.image_url)}
                />

                <div className="container mx-auto px-4 py-16 -mt-20 space-y-12">
                    {/* Top Focus Section: Back & Player */}
                    <div className="space-y-8">
                        <Link
                            to="/#emissions"
                            className="inline-flex items-center gap-2 text-muted-foreground hover:text-accent font-semibold transition-all group px-4 py-2 bg-background/50 backdrop-blur-sm rounded-full border border-border/50 shadow-sm w-fit"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {t("common.back")}
                        </Link>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="relative group max-w-7xl mx-auto"
                        >
                            <div className="absolute -inset-1 bg-gradient-to-r from-accent/20 to-accent/5 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative">
                                <MediaHub emission={emission} />
                            </div>
                        </motion.div>
                    </div>

                    {/* Content & Sidebar Section (Parallel) */}
                    <div className="flex flex-col lg:flex-row gap-12 items-start">
                        {/* Main Content Area */}
                        <div className="flex-1 space-y-12 w-full lg:w-auto">
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="bg-card/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/20 shadow-2xl space-y-8"
                            >
                                <div className="flex flex-wrap items-center gap-8 py-6 border-b border-border/50">
                                    <div className="flex items-center gap-3 bg-background/50 px-4 py-2 rounded-2xl border border-border/30">
                                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                                            <User className="w-5 h-5 text-accent" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{t("common.speaker")}</p>
                                            <p className="font-bold text-[#1d2327]">{stripHtml(emission.preacher_name || t("common.default_preacher"))}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 bg-background/50 px-4 py-2 rounded-2xl border border-border/30">
                                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                                            <Calendar className="w-5 h-5 text-accent" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{t("common.date") || "Date"}</p>
                                            <p className="font-bold text-[#1d2327]">{(emission.emission_date || emission.sermon_date) ? new Date(emission.emission_date || emission.sermon_date).toLocaleDateString() : new Date(emission.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                </div>

                                <div className="prose prose-lg max-w-none text-foreground/80">
                                    <h2 className="text-3xl font-black text-foreground mb-6 flex items-center gap-4">
                                        <span className="w-2 h-8 bg-accent rounded-full"></span>
                                        {t("common.description")}
                                    </h2>
                                    <div className="whitespace-pre-wrap leading-relaxed text-lg">
                                        {stripHtml(getLocalizedField(emission, 'description', i18n.language) || t("common.no_description"))}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Comments Area (Wide/Glassy) */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="bg-card/40 backdrop-blur-xl rounded-[2.5rem] p-8 lg:p-12 border border-white/20 shadow-2xl space-y-12"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-accent p-3 rounded-2xl shadow-lg shadow-accent/20">
                                            <MessageSquare className="w-7 h-7 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black">{t("common.comments_section.title")}</h2>
                                            <p className="text-muted-foreground font-medium">{comments.length} avis partagés</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-10">
                                    <AnimatePresence>
                                        {comments.length > 0 ? (
                                            comments.map((comment, index) => (
                                                <motion.div 
                                                    key={comment.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="flex gap-6 group"
                                                >
                                                    <div className="flex-shrink-0">
                                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-accent/60 text-white flex items-center justify-center font-black text-xl shadow-xl transform group-hover:rotate-6 transition-transform">
                                                            {comment.author_name.charAt(0).toUpperCase()}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="font-black text-lg text-foreground">{comment.author_name}</h4>
                                                            <span className="text-xs font-bold text-muted-foreground bg-background/80 px-3 py-1 rounded-full border border-border/50">
                                                                {new Date(comment.created_at).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <div className="bg-background/40 backdrop-blur-md p-5 rounded-3xl rounded-tl-none border border-white/10 text-foreground/80 text-base leading-relaxed relative group-hover:bg-background/60 transition-colors">
                                                            {comment.content}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <div className="py-10 text-center text-muted-foreground italic">
                                                {t("common.no_comments") || "Soyez le premier à laisser un commentaire."}
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Comment Form */}
                                <div className="bg-background/60 backdrop-blur-md rounded-[2rem] p-8 border border-accent/20 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                    <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                                        <Send className="w-6 h-6 text-accent" />
                                        {t("common.comments_section.leave_comment")}
                                    </h3>
                                    
                                    {submitted ? (
                                        <motion.div 
                                            initial={{ scale: 0.9, opacity: 0 }} 
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="flex flex-col items-center justify-center py-10 text-center"
                                        >
                                            <div className="w-20 h-20 bg-green-500 text-white rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-green-500/20 animate-bounce">
                                                <CheckCircle2 className="w-10 h-10" />
                                            </div>
                                            <p className="text-2xl font-black text-foreground mb-2">{t("common.saved_success")}</p>
                                            <p className="text-muted-foreground">{t("common.comments_section.waiting_approval")}</p>
                                            <Button 
                                                variant="outline" 
                                                className="mt-8 rounded-2xl px-8 border-accent text-accent font-bold hover:bg-accent hover:text-white transition-all" 
                                                onClick={() => setSubmitted(false)}
                                            >
                                                Nouveau commentaire
                                            </Button>
                                        </motion.div>
                                    ) : (
                                        <form onSubmit={handleCommentSubmit} className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label htmlFor="author_name" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-2">{t("common.name")}</label>
                                                    <input
                                                        id="author_name"
                                                        name="author_name"
                                                        type="text"
                                                        placeholder={t("common.comments_section.name_placeholder")}
                                                        className="w-full px-6 py-4 bg-background/50 border border-border/50 rounded-2xl focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all font-medium"
                                                        value={commentForm.author_name}
                                                        onChange={(e) => setCommentForm({ ...commentForm, author_name: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label htmlFor="author_email" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-2">{t("common.email")}</label>
                                                    <input
                                                        id="author_email"
                                                        name="author_email"
                                                        type="email"
                                                        placeholder={t("common.comments_section.email_placeholder")}
                                                        className="w-full px-6 py-4 bg-background/50 border border-border/50 rounded-2xl focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all font-medium"
                                                        value={commentForm.author_email}
                                                        onChange={(e) => setCommentForm({ ...commentForm, author_email: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label htmlFor="content" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-2">{t("common.message")}</label>
                                                <textarea
                                                    id="content"
                                                    name="content"
                                                    placeholder={t("common.comments_section.comment_placeholder")}
                                                    className="w-full h-40 px-6 py-4 bg-background/50 border border-border/50 rounded-2xl focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all font-medium resize-none"
                                                    value={commentForm.content}
                                                    onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                                                    required
                                                ></textarea>
                                            </div>
                                            <Button 
                                                className="w-full h-16 bg-accent hover:bg-accent/90 text-white rounded-2xl font-black text-lg gap-3 shadow-xl shadow-accent/20 group transform active:scale-95 transition-all"
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? (
                                                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <>
                                                        <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                                        {t("common.comments_section.submit")}
                                                    </>
                                                )}
                                            </Button>
                                        </form>
                                    )}
                                </div>
                            </motion.div>
                        </div>

                        {/* Sidebar Redesign (Glassy & Sticky) */}
                        <aside className="w-full lg:w-[400px] space-y-8 lg:sticky lg:top-32">
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-card/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/20 shadow-2xl space-y-10"
                            >
                                <div>
                                    <h3 className="text-xl font-black mb-6 uppercase tracking-widest text-accent flex items-center gap-2">
                                        <Share2 className="w-5 h-5" />
                                        {t("common.share_this")}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Button
                                            variant="outline"
                                            className="h-14 rounded-2xl gap-3 justify-center border-blue-500/20 bg-blue-500/5 hover:bg-blue-500 text-blue-600 hover:text-white font-bold transition-all"
                                            onClick={() => {
                                                const shareUrl = window.location.href;
                                                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'width=600,height=400');
                                            }}
                                        >
                                            <Facebook className="w-5 h-5" /> Facebook
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="h-14 rounded-2xl gap-3 justify-center border-green-500/20 bg-green-500/5 hover:bg-green-500 text-green-600 hover:text-white font-bold transition-all"
                                            onClick={() => {
                                                const shareUrl = window.location.href;
                                                const shareTitle = stripHtml(emission.title);
                                                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + " " + shareUrl)}`, '_blank');
                                            }}
                                        >
                                            <MessageCircle className="w-5 h-5" /> WhatsApp
                                        </Button>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-border/50">
                                    <h3 className="text-xl font-black mb-8 uppercase tracking-widest text-accent">
                                        {t("common.about_speaker")}
                                    </h3>
                                    <div className="flex flex-col items-center text-center space-y-4">
                                        <div className="relative group">
                                            <div className="absolute -inset-2 bg-gradient-to-tr from-accent to-accent/30 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                                            <div className="relative w-24 h-24 rounded-[2rem] bg-accent/10 border-2 border-accent/20 flex items-center justify-center text-accent overflow-hidden">
                                                <User className="w-12 h-12" />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-2xl font-black text-foreground">{emission.preacher_name || t("common.default_preacher")}</p>
                                            <p className="text-sm font-bold text-accent px-4 py-1 bg-accent/10 rounded-full inline-block">{t("common.ministry_role")}</p>
                                        </div>
                                        <p className="text-base text-muted-foreground leading-relaxed px-2">
                                            {t("common.join_us_teaching")}
                                        </p>
                                    </div>
                                </div>


                            </motion.div>
                        </aside>
                    </div>

                    {/* Photos Invasion: Similar Emissions Visual Gallery (Full Width Below) */}
                    {similarEmissions.length > 0 && (
                        <motion.section 
                            initial={{ opacity: 0, y: 100 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mt-32 space-y-12"
                        >
                            <div className="flex items-end justify-between px-4">
                                <div className="space-y-2">
                                    <p className="text-accent font-black uppercase tracking-[0.3em] text-sm">{t("common.discovery") || "Découvrir plus"}</p>
                                    <h2 className="text-5xl font-black flex items-center gap-4">
                                        {t("common.similar_emissions")}
                                        <div className="hidden md:block h-[2px] w-32 bg-accent/20"></div>
                                    </h2>
                                </div>
                                <Button 
                                    variant="link" 
                                    className="text-accent font-black text-lg gap-2 group p-0"
                                    asChild
                                >
                                    <Link to="/#emissions">
                                        {t("common.view_more")}
                                        <ArrowLeft className="w-5 h-5 group-hover:translate-x-2 transition-transform rotate-180" />
                                    </Link>
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                {similarEmissions.map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="group relative"
                                    >
                                        <Link to={`/emission/${item.slug}`} className="block">
                                            <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl">
                                                <img 
                                                    src={getFullImageUrl(item.image_url) || "/placeholder-emission.jpg"} 
                                                    alt={item.title} 
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex flex-col justify-end p-8">
                                                    <div className="space-y-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                                        <div className="bg-accent text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full w-fit">
                                                            {item.category_name || t("common.general")}
                                                        </div>
                                                        <h4 className="text-xl font-black text-white leading-tight line-clamp-2">
                                                            {formatPublicTitle(stripHtml(item.title))}
                                                        </h4>
                                                        <div className="flex items-center gap-2 text-white/70 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity delay-200">
                                                            <User className="w-4 h-4" />
                                                            {stripHtml(item.preacher_name || t("common.default_preacher"))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="absolute top-6 right-6 w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-500 scale-50 group-hover:scale-100 border border-white/30">
                                                    <Play className="w-5 h-5 fill-current" />
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.section>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default EmissionDetail;
