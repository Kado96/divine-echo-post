import { motion } from "framer-motion";
import { Play, Clock, Headphones, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import emissionPreaching from "@/assets/emission-preaching.jpg";
import emissionWorship from "@/assets/emission-worship.jpg";
import emissionFamily from "@/assets/emission-family.jpg";
import emissionMeditation from "@/assets/emission-meditation.jpg";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiService } from "@/lib/api";
import { stripHtml, getFullImageUrl, formatPublicTitle, getLocalizedField } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const RecentEmissions = () => {
  const [settings, setSettings] = useState<any>(null);
  const { t, i18n } = useTranslation();
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmissions = async () => {
      try {
        const [emissionsData, settingsData] = await Promise.all([
          apiService.getEmissions(),
          apiService.getSettings()
        ]);
        const allEmissions = Array.isArray(emissionsData) ? emissionsData : (emissionsData?.results || []);
        
        // Smart Language Prioritization
        const currentLang = (i18n.language || 'fr').split('-')[0].toLowerCase();
        
        // 1. Sort by: Matching language first, then by date (if available)
        const sortedEmissions = [...allEmissions].sort((a: any, b: any) => {
          const aMatch = (a.language || 'fr').toLowerCase() === currentLang;
          const bMatch = (b.language || 'fr').toLowerCase() === currentLang;
          if (aMatch && !bMatch) return -1;
          if (!aMatch && bMatch) return 1;
          return 0; // Keep original order for same match status
        });

        const items = sortedEmissions.slice(0, 4).map((emission: any, idx: number) => ({
          id: emission.id,
          slug: emission.slug,
          title: getLocalizedField(emission, "title", i18n.language),
          author: getLocalizedField(emission, "preacher_name", i18n.language) || t("common.default_preacher"),
          category: getLocalizedField(emission, "category_name", i18n.language) || t("common.general"),
          duration: emission.duration_minutes ? `${emission.duration_minutes} min` : "N/A",
          listeners: emission.views_count || 0,
          isNew: true,
          language: (emission.language || 'fr').toUpperCase(),
          isPreferredLang: (emission.language || 'fr').toLowerCase() === currentLang,
          image: getFullImageUrl(emission.image_url) || getFullImageUrl(emission.image) || [emissionPreaching, emissionWorship, emissionFamily, emissionMeditation][idx % 4],
        }));
        setRecentItems(items);
        setSettings(settingsData);
      } catch (err) {
        console.error("Failed to fetch emissions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmissions();
  }, [i18n.language]);

  const getSetting = (key: string) => {
    return getLocalizedField(settings, key, i18n.language);
  };

  if (loading && recentItems.length === 0) {
    return <div className="py-24 text-center">{t("recent.loading") || "Loading..."}</div>;
  }

  return (
    <section className="py-16 bg-muted/30" id="emissions">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="text-accent text-sm font-semibold uppercase tracking-widest mb-2 block">
            {getSetting("section_featured_badge") ? stripHtml(getSetting("section_featured_badge")) : t("recent.subtitle")}
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            {getSetting("section_featured") ? stripHtml(getSetting("section_featured")) : t("recent.title")}{" "}
            <span className="text-gradient-gold">
              {getSetting("section_featured_accent") ? stripHtml(getSetting("section_featured_accent")) : t("recent.title_accent")}
            </span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            {getSetting("section_featured_desc") ? stripHtml(getSetting("section_featured_desc")) : t("recent.description")}
          </p>
        </motion.div>

        {/* Horizontal scrollable on mobile, grid on desktop */}
        <div className={`grid gap-6 ${recentItems.length === 1 ? "grid-cols-1 max-w-md mx-auto" :
          recentItems.length === 2 ? "grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto" :
            recentItems.length === 3 ? "grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto" :
              "md:grid-cols-2 lg:grid-cols-4"
          }`}>
          {recentItems.length > 0 ? (
            recentItems.map((item, i) => (
              <Link key={item.id} to={`/emission/${item.slug}`} aria-label={`${t("categories.view_emission")}: ${item.title}`}>
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-xl transition-all duration-300 group cursor-pointer h-full"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={item.image}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    {item.isNew && (
                      <span className="absolute top-3 left-3 flex items-center gap-1 bg-accent text-accent-foreground text-[10px] px-2 py-0.5 rounded-full font-bold shadow-md z-30 uppercase">
                        <Sparkles className="w-2.5 h-2.5" /> {t("recent.new")}
                      </span>
                    )}
                    {(!item.isPreferredLang || true) && (
                      <span className={`absolute ${item.isNew ? 'top-9' : 'top-3'} left-3 flex items-center gap-1 bg-white/90 backdrop-blur-md text-black text-[9px] px-2 py-0.5 rounded-full font-black shadow-sm z-30 border border-black/5`}>
                         {item.language}
                      </span>
                    )}
                    {/* Play button indicator */}
                    <div className="absolute bottom-3 right-3 w-11 h-11 rounded-full bg-accent/90 text-accent-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg" aria-hidden="true">
                      <Play className="w-5 h-5 ml-0.5" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <span className="text-accent text-xs font-semibold uppercase tracking-wider">{item.category}</span>
                    <h3 className="font-bold text-foreground mt-1 mb-1 group-hover:text-accent transition-colors">{formatPublicTitle(item.title)}</h3>
                    <p className="text-muted-foreground text-sm mb-3">{item.author}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {item.duration}</span>
                      <span className="flex items-center gap-1"><Headphones className="w-3.5 h-3.5" /> {item.listeners.toLocaleString()}</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))
          ) : !loading && (
            <div className="md:col-span-2 lg:col-span-4 py-8 text-center text-muted-foreground border border-dashed border-border rounded-2xl">
              {t("recent.empty")}
            </div>
          )}
        </div>

        {/* Bouton de navigation supprimé à la demande de l'utilisateur */}
      </div>
    </section>
  );
};

export default RecentEmissions;
