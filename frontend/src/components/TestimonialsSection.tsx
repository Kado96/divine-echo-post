import { motion } from "framer-motion";
import { Quote, Star, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { apiService } from "@/lib/api";

const TestimonialsSection = () => {
    const [settings, setSettings] = useState<any>(null);
    const { t, i18n } = useTranslation();
    const [testimonials, setTestimonials] = useState<any[]>([]);
    const [visibleCount, setVisibleCount] = useState(3);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [testimonialsData, settingsData] = await Promise.all([
                    apiService.getTestimonials(),
                    apiService.getSettings()
                ]);
                const results = Array.isArray(testimonialsData) ? testimonialsData : (testimonialsData.results || []);
                // Filters only verified, current language
                const currentLang = i18n.language || 'fr';
                const verifiedSubset = results
                    .filter((item: any) =>
                        (item.status === "Vérifié" || item.status === "Published") &&
                        (item.language === currentLang)
                    );
                setTestimonials(verifiedSubset);
                setSettings(settingsData);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [i18n.language]);

    const getSetting = (key: string) => {
        if (!settings) return null;
        const lang = i18n.language || 'fr';
        const fieldName = `${key}_${lang}`;
        return settings[fieldName] || settings[key];
    };

    if (!loading && testimonials.length === 0) return null;

    const visibleTestimonials = testimonials.slice(0, visibleCount);

    return (
        <section className="py-16 bg-muted/30" id="testimonials">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <span className="text-accent text-sm font-semibold uppercase tracking-widest mb-3 block">
                        {getSetting("section_testimonials_badge") && getSetting("section_testimonials_badge") !== "Témoignages" && getSetting("section_testimonials_badge") !== "Ivyerekeye" ? getSetting("section_testimonials_badge") : t("home_testimonials.badge")}
                    </span>
                    <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                        {getSetting("section_testimonials_title") && getSetting("section_testimonials_title") !== "Ce qu'ils disent" && getSetting("section_testimonials_title") !== "Ico bavuga" ? getSetting("section_testimonials_title") : t("home_testimonials.title")}{" "}
                        <span className="text-gradient-gold">
                            {getSetting("section_testimonials_accent") && getSetting("section_testimonials_accent") !== "de nous" ? getSetting("section_testimonials_accent") : t("home_testimonials.title_accent")}
                        </span>
                    </h2>
                    <p className="text-muted-foreground/60 max-w-lg mx-auto">
                        {getSetting("section_testimonials_desc") && getSetting("section_testimonials_desc") !== "Découvrez comment Shalom Ministry transforme des vies" ? getSetting("section_testimonials_desc") : t("home_testimonials.description")}
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading
                        ? [1, 2, 3].map((i) => (
                            <div key={i} className="bg-card rounded-3xl p-8 border border-border animate-pulse h-64"></div>
                        ))
                        : visibleTestimonials.map((item, i) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-card rounded-3xl p-8 shadow-sm border border-border relative flex flex-col justify-between group hover:shadow-xl transition-all duration-500"
                            >
                                <Quote className="absolute top-6 right-8 w-10 h-10 text-accent/10 group-hover:text-accent/20 transition-colors" />

                                <div className="space-y-4 relative z-10">
                                    <div className="flex items-center gap-1 text-amber-400">
                                        {[...Array(5)].map((_, starIndex) => (
                                            <Star key={starIndex} className={`w-3.5 h-3.5 ${starIndex < item.rating ? "fill-current" : "text-gray-200"}`} />
                                        ))}
                                    </div>
                                    <p className="text-foreground/80 leading-relaxed italic text-sm">
                                        "{item.content}"
                                    </p>
                                </div>

                                <div className="mt-8 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent shadow-inner">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-foreground text-sm">{item.author}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                                            {t("admin.testimonials_page.item.verified")}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                </div>

                {testimonials.length > visibleCount && (
                    <div className="mt-12 text-center">
                        <button
                            onClick={() => setVisibleCount(prev => prev + 6)}
                            className="inline-flex items-center gap-2 px-8 py-3 bg-white border border-border rounded-full font-bold text-accent hover:bg-accent hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg"
                        >
                            {t("common.show_more") || "Voir plus"}
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default TestimonialsSection;
