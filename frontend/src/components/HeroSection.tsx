import { motion, AnimatePresence } from "framer-motion";
import { Play, Headphones, Clock, Sparkles, ChevronLeft, ChevronRight, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";
import emissionPreaching from "@/assets/emission-preaching.jpg";
import emissionWorship from "@/assets/emission-worship.jpg";
import emissionFamily from "@/assets/emission-family.jpg";
import emissionMeditation from "@/assets/emission-meditation.jpg";

import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { apiService } from "@/lib/api";
import { stripHtml, getFullImageUrl } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const AUTOPLAY_INTERVAL = 8000; // 8 seconds for Hero slides

// Fallback images
const FALLBACK_IMAGES = [emissionPreaching, emissionWorship, emissionFamily, emissionMeditation];

const slideVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 300 : -300,
    scale: 1.05,
  }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.6 },
      scale: { duration: 1.5, ease: "easeOut" }
    },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -300 : 300,
    scale: 0.95,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.4 }
    },
  }),
};

const HeroSection = () => {
  const [settings, setSettings] = useState<any>(null);
  const { t, i18n } = useTranslation();
  
  // State for carousel
  const [heroItems, setHeroItems] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsData, emissionsData] = await Promise.all([
          apiService.getSettings(),
          apiService.getEmissions()
        ]);
        setSettings(settingsData);

        // Map short language code (e.g. 'fr-FR' -> 'fr')
        const currentLang = (i18n.language || 'fr').split('-')[0];
        
        const realItems = emissionsData?.filter((e: any) => e.language === currentLang).slice(0, 5).map((e: any, idx: number) => ({
          id: e.id,
          slug: e.slug,
          title: stripHtml(e.title),
          badge: e.category_name || t("common.featured"),
          description: stripHtml(e.description || ""),
          image: getFullImageUrl(e.image) || FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length],
          isNew: true,
          isEmission: true,
        })) || [];

        if (realItems.length > 0) {
          setHeroItems(realItems);
        } else {
          // Fallback only to the official HERO SETTINGS from the admin, no invention.
          const lang = i18n.language || 'fr';
          const badgeField = `hero_badge_${lang}`;
          const titleField = `hero_title_${lang}`;
          const descField = `hero_description_${lang}`;

          setHeroItems([{
            id: 'settings-fallback',
            title: stripHtml(settingsData[titleField] || settingsData.hero_title || t("hero.title")),
            badge: stripHtml(settingsData[badgeField] || settingsData.hero_badge || t("hero.subtitle")),
            description: stripHtml(settingsData[descField] || settingsData.hero_description || settingsData.description || t("hero.description")),
            image: getFullImageUrl(settingsData.hero_image_display) || heroBg,
            isEmission: false,
          }]);
        }
      } catch (err) {
        console.error("Failed to fetch hero data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [i18n.language, t]);


  const goNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % heroItems.length);
  }, [heroItems.length]);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + heroItems.length) % heroItems.length);
  }, [heroItems.length]);

  // Autoplay
  useEffect(() => {
    if (isAutoPlaying && heroItems.length > 1) {
      autoPlayRef.current = setInterval(goNext, AUTOPLAY_INTERVAL);
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isAutoPlaying, goNext, heroItems.length]);

  const getSetting = (key: string) => {
    if (!settings) return null;
    const lang = i18n.language || 'fr';
    const fieldName = `${key}_${lang}`;
    return settings[fieldName] || settings[key];
  };

  const currentItem = heroItems[currentIndex];

  return (
    <section className="relative min-h-[100vh] py-20 flex items-center justify-center overflow-hidden bg-navy-deep" onMouseEnter={() => setIsAutoPlaying(false)} onMouseLeave={() => setIsAutoPlaying(true)}>
      {/* Background with AnimatePresence for smooth fades */}
      <AnimatePresence initial={false}>
        <motion.div
          key={`bg-${currentIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0"
        >
          <img 
            src={currentItem?.image} 
            alt="" 
            className="w-full h-full object-cover" 
          />
          {/* Smarter overlay: dark enough for text but transparent enough to see the image */}
          <div className="absolute inset-0 bg-navy/40 backdrop-blur-[1px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/70 via-transparent to-navy-deep" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/40 via-transparent to-navy-deep/40" />
        </motion.div>
      </AnimatePresence>

      {/* Decorative Orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-accent/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Content Carousel */}
      <div className="relative z-20 container mx-auto px-4 text-center pt-24 pb-12">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="max-w-5xl mx-auto px-4"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] mb-6 shadow-xl shadow-accent/20">
                <Sparkles className="w-3.5 h-3.5" /> {currentItem?.badge}
              </span>
            </motion.div>

            {/* Title - Optimized sizes for better fit */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-[1.1] font-serif tracking-tight drop-shadow-2xl">
              {currentItem?.title.split(' ').map((word: string, i: number) => (
                <span key={i} className={i % 4 === 3 ? "text-accent italic mr-1 md:mr-2" : "mr-1 md:mr-2 inline-block"}>
                  {word}
                </span>
              ))}
            </h1>

            {/* Description */}
            <p className="text-white/90 text-sm md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-semibold drop-shadow-md">
              {currentItem?.description}
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="group relative bg-accent text-accent-foreground hover:bg-gold-light text-base md:text-lg h-14 md:h-16 px-8 rounded-xl md:rounded-2xl gap-2 shadow-[0_10px_20px_rgba(212,175,55,0.2)]"
                onClick={() => window.location.href = `/emission/${currentItem?.slug}`}
              >
                <Play className="w-5 h-5 fill-current" />
                <span className="font-bold tracking-wide">{t("hero.cta_primary")}</span>
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-white/5 backdrop-blur-md border-white/20 text-white hover:bg-white/15 text-base md:text-lg h-14 md:h-16 px-8 rounded-xl md:rounded-2xl gap-2"
              >
                <Headphones className="w-5 h-5 text-accent" />
                <span className="font-bold tracking-wide">{t("hero.cta_secondary")}</span>
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Stats Section with tighter spacing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-12 md:mt-16 grid grid-cols-3 gap-4 md:gap-10 max-w-xl mx-auto pt-8 border-t border-white/10"
        >
          {[
            { value: settings?.stat_emissions_value || "120+", label: getSetting("stat_emissions") || t("hero.stats.emissions") },
            { value: settings?.stat_audience_value || "8K", label: getSetting("stat_audience") || t("hero.stats.listeners") },
            { value: settings?.stat_languages_value || "15", label: getSetting("stat_languages") || t("hero.stats.categories") },
          ].map((stat) => (
            <div key={stat.label} className="text-center group cursor-default">
              <div className="text-xl md:text-3xl font-bold text-accent">{stat.value}</div>
              <div className="text-white/40 text-[10px] md:text-xs mt-1 font-bold uppercase tracking-widest leading-none">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Navigation Arrows - Only if multiple items */}
      {heroItems.length > 1 && (
        <>
          <div className="absolute inset-y-0 left-4 md:left-10 flex items-center z-30 pointer-events-none">
            <button
              onClick={(e) => { e.preventDefault(); goPrev(); }}
              className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all duration-500 pointer-events-auto shadow-2xl hover:scale-110 active:scale-95 group"
            >
              <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 transition-transform group-hover:-translate-x-1" />
            </button>
          </div>
          <div className="absolute inset-y-0 right-4 md:right-10 flex items-center z-30 pointer-events-none">
            <button
              onClick={(e) => { e.preventDefault(); goNext(); }}
              className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all duration-500 pointer-events-auto shadow-2xl hover:scale-110 active:scale-95 group"
            >
              <ChevronRight className="w-6 h-6 md:w-8 md:h-8 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </>
      )}

      {/* Dots Indicator - Only if multiple items */}
      {heroItems.length > 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {heroItems.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > currentIndex ? 1 : -1);
                setCurrentIndex(i);
              }}
              className={`h-1.5 transition-all duration-500 rounded-full ${i === currentIndex ? "w-12 bg-accent shadow-[0_0_10px_rgba(212,175,55,0.8)]" : "w-3 bg-white/20 hover:bg-white/40"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroSection;
