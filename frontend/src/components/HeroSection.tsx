import { motion } from "framer-motion";
import { Play, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

import { useState, useEffect } from "react";
import { apiService } from "@/lib/api";
import { stripHtml } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const HeroSection = () => {
  const [settings, setSettings] = useState<any>(null);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await apiService.getSettings();
        setSettings(data);
      } catch (err) {
        console.error("Failed to fetch settings", err);
      }
    };
    fetchSettings();
  }, []);

  const getSetting = (key: string) => {
    if (!settings) return null;
    const lang = i18n.language || 'fr';
    const fieldName = `${key}_${lang}`;
    return settings[fieldName] || settings[key];
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={settings?.hero_image_display || heroBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-primary/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-primary/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center pt-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/20 text-accent text-sm font-medium mb-6 border border-accent/30">
            {stripHtml(getSetting("hero_badge") || t("hero.subtitle"))}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="text-4xl sm:text-5xl md:text-7xl font-bold text-primary-foreground mb-6 leading-tight font-serif"
        >
          {stripHtml(getSetting("hero_title") || t("hero.title"))}
        </motion.h1>

        {getSetting("hero_subtitle") && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="text-accent text-lg md:text-xl font-medium mb-4 max-w-3xl mx-auto"
          >
            {stripHtml(getSetting("hero_subtitle"))}
          </motion.p>
        )}

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-primary-foreground/70 text-base md:text-lg max-w-2xl mx-auto mb-10"
        >
          {stripHtml(getSetting("hero_description") || settings?.description || t("hero.description"))}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button size="lg" className="bg-accent text-accent-foreground hover:bg-gold-light text-base px-8 gap-2" onClick={() => document.getElementById('emissions')?.scrollIntoView({ behavior: 'smooth' })}>
            <Play className="w-5 h-5" />
            {getSetting("btn_emissions") || t("hero.cta_primary")}
          </Button>
          <Button size="lg" variant="outline" className="border-primary-foreground/40 text-primary-foreground bg-primary-foreground/5 hover:bg-primary-foreground/15 text-base px-8 gap-2">
            <Headphones className="w-5 h-5" />
            {getSetting("btn_teachings") || t("hero.cta_secondary")}
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
        >
          {[
            { value: settings?.stat_emissions_value || "120+", label: getSetting("stat_emissions") || t("hero.stats.emissions") },
            { value: settings?.stat_audience_value || "8K", label: getSetting("stat_audience") || t("hero.stats.listeners") },
            { value: settings?.stat_languages_value || "15", label: getSetting("stat_languages") || t("hero.stats.categories") },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-accent">{stat.value}</div>
              <div className="text-primary-foreground/50 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};


export default HeroSection;
