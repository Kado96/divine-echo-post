import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, Calendar, Clock, ChevronRight, Bell, AlertTriangle, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { apiService } from "@/lib/api";
import { stripHtml } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const AnnouncementsSection = () => {
    const [settings, setSettings] = useState<any>(null);
    const { t, i18n } = useTranslation();
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [announcementsData, settingsData] = await Promise.all([
                    apiService.getAnnouncements(),
                    apiService.getSettings()
                ]);
                const results = Array.isArray(announcementsData) ? announcementsData : (announcementsData.results || []);
                setAnnouncements(results.filter((a: any) => a.is_active).slice(0, 3));
                setSettings(settingsData);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getSetting = (key: string) => {
        if (!settings) return null;
        const lang = i18n.language || 'fr';
        const fieldName = `${key}_${lang}`;
        return settings[fieldName] || settings[key];
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'haute': return <AlertTriangle className="w-5 h-5 text-destructive" />;
            case 'normale': return <Bell className="w-5 h-5 text-accent" />;
            default: return <Info className="w-5 h-5 text-blue-400" />;
        }
    };

    if (!loading && announcements.length === 0) return null;

    return (
        <section className="py-16 bg-white" id="announcements">
            <div className="container mx-auto px-4">
                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <span className="text-accent text-sm font-semibold uppercase tracking-widest mb-3 block">
                            {stripHtml(getSetting("section_announcements_badge")) || t("admin.announcements_page.title") || "Annonces"}
                        </span>
                        <h2 className="text-3xl md:text-5xl font-bold text-[#1d2327]">
                            {stripHtml(getSetting("section_announcements_title")) || t("common.info_events")}
                            {getSetting("section_announcements_accent") && (
                                <span className="text-accent ml-2">{stripHtml(getSetting("section_announcements_accent"))}</span>
                            )}
                        </h2>
                        {getSetting("section_announcements_desc") && (
                            <p className="text-gray-500 mt-4 max-w-2xl">
                                {stripHtml(getSetting("section_announcements_desc"))}
                            </p>
                        )}
                    </div>
                    <Button variant="ghost" className="text-accent hover:text-accent/80 font-bold group">
                        {t("common.all_announcements")} <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </header>

                <div className={`grid gap-8 ${announcements.length === 1 ? "grid-cols-1 max-w-xl mx-auto" :
                    announcements.length === 2 ? "grid-cols-1 lg:grid-cols-2 max-w-4xl mx-auto" :
                        "grid-cols-1 lg:grid-cols-3"
                    }`}>
                    {loading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="bg-gray-50 rounded-3xl h-64 animate-pulse" />
                        ))
                    ) : (
                        announcements.map((item, i) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-[#fdfbf6] border border-orange-100/50 rounded-3xl p-8 hover:shadow-xl transition-all duration-500 group relative flex flex-col"
                            >
                                <div className="absolute top-6 right-8">
                                    {getPriorityIcon(item.priority)}
                                </div>

                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full w-fit mb-6 ${item.priority === 'haute' ? 'bg-destructive/10 text-destructive' : 'bg-accent/10 text-accent'
                                    }`}>
                                    {item.priority}
                                </span>

                                <h3 className="text-xl font-bold text-[#1d2327] mb-4 group-hover:text-accent transition-colors">
                                    {stripHtml(item.title)}
                                </h3>

                                <p className="text-gray-500 text-sm mb-8 flex-1 line-clamp-3 leading-relaxed italic">
                                    "{stripHtml(item.content)}"
                                </p>

                                <div className="flex items-center justify-between pt-6 border-t border-orange-100/30 text-[11px] font-bold text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {item.event_date ? new Date(item.event_date).toLocaleDateString() : new Date(item.created_at).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5" />
                                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
};

export default AnnouncementsSection;
