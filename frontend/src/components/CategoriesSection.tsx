import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronRight, Headphones, Calendar, Music, BookOpen, Users, HeartPulse, Radio, Globe, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { apiService } from "@/lib/api";
import { stripHtml, getFullImageUrl, formatPublicTitle, getLocalizedField } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const CategoriesSection = () => {
  const [settings, setSettings] = useState<any>(null);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [activeLanguage, setActiveLanguage] = useState("ALL");
  const [search, setSearch] = useState("");
  const [emissions, setEmissions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sync local filter with global language
    const langCode = (i18n.language || 'fr').split('-')[0];
    setActiveLanguage(langCode);
    
    const fetchData = async () => {
      try {
        const [emissionsData, categoriesData, settingsData] = await Promise.all([
          apiService.getEmissions(),
          apiService.getEmissionCategories(),
          apiService.getSettings()
        ]);
        
        const results = Array.isArray(emissionsData) ? emissionsData : (emissionsData?.results || []);
        const catResults = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.results || []);
        
        setEmissions(results);
        setCategories(catResults);
        setSettings(settingsData);
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [i18n.language]);

  const getSetting = (key: string) => {
    return getLocalizedField(settings, key, i18n.language);
  };

  const filteredEmissions = emissions.filter(e =>
    (activeCategory === "ALL" || e.category === activeCategory || e.category_name === activeCategory) &&
    (activeLanguage === "ALL" || e.language === activeLanguage) &&
    (e.title.toLowerCase().includes(search.toLowerCase()) || (e.preacher_name && e.preacher_name.toLowerCase().includes(search.toLowerCase())))
  );

  const getCategoryIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('musique') || n.includes('adoration')) return <Music className="w-4 h-4" />;
    if (n.includes('théologie') || n.includes('enseignement')) return <BookOpen className="w-4 h-4" />;
    if (n.includes('leadership')) return <Users className="w-4 h-4" />;
    if (n.includes('prière') || n.includes('méditation')) return <HeartPulse className="w-4 h-4" />;
    return <Radio className="w-4 h-4" />;
  };

  const getCategoryCount = (name: string) => {
    if (name === "ALL") return emissions.length;
    return emissions.filter(e => e.category_name === name || e.category === name).length;
  };

  const getLanguageCount = (code: string) => {
    if (code === "ALL") return emissions.length;
    return emissions.filter(e => e.language === code).length;
  };

  const availableLanguages = [
    { code: 'fr', label: 'Français', icon: '🇫🇷' },
    { code: 'rn', label: 'Kirundi', icon: '🇧🇮' },
    { code: 'en', label: 'English', icon: '🇬🇧' },
    { code: 'sw', label: 'Kiswahili', icon: '🇹🇿' }
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white via-gray-50/30 to-white">
      <div className="container mx-auto px-4 sm:px-6">

        {/* ══════════ HEADER ══════════ */}
        <header className="mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1d2327] mb-3 font-serif">
            {stripHtml(getSetting("section_categories")) || t("categories.title")}
            {getSetting("section_categories_accent") && (
              <span className="text-accent ml-2 sm:ml-3">{stripHtml(getSetting("section_categories_accent"))}</span>
            )}
          </h1>
          <p className="text-gray-500 max-w-2xl text-base sm:text-lg">
            {stripHtml(getSetting("section_categories_desc")) || t("categories.desc")}
          </p>
        </header>

        {/* ══════════ TOOLBAR : Search + Catégories ══════════ */}
        <div className="mb-8 sm:mb-10 rounded-2xl sm:rounded-3xl bg-[#1d2327] p-4 sm:p-6 lg:p-8 shadow-2xl shadow-black/10">

          {/* Recherche */}
          <div className="mb-5">
            <label htmlFor="categoriessection-input-1" className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40 block mb-2 flex items-center gap-2">
              <Search className="w-3 h-3" />
              {t("categories.search_label") || "RECHERCHER"}
            </label>
            <div className="relative max-w-lg">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <Input id="categoriessection-input-1" name="categoriessection-input-1"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("categories.search_placeholder")}
                autoComplete="off"
                className="pl-10 bg-white/10 border-white/10 h-11 sm:h-12 rounded-xl text-white placeholder:text-white/30 focus-visible:ring-accent focus-visible:border-accent w-full"
              />
            </div>
          </div>

          {/* Séparateur */}
          <div className="w-full h-px bg-white/10 mb-5" />

          {/* Catégories */}
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40 block mb-3 flex items-center gap-2">
              <Filter className="w-3 h-3" />
              {t("categories.nav_label") || "CATÉGORIES"}
            </span>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                onClick={() => setActiveCategory("ALL")}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl transition-all duration-300 text-xs sm:text-sm font-bold ${activeCategory === "ALL" ? "bg-accent text-[#1d2327] shadow-lg shadow-accent/30 scale-[1.02]" : "bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"}`}
              >
                <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{t("categories.all")}</span>
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${activeCategory === "ALL" ? "bg-[#1d2327]/20 text-[#1d2327]" : "bg-white/10 text-white/40"}`}>
                  {getCategoryCount("ALL")}
                </span>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.name)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl transition-all duration-300 text-xs sm:text-sm font-bold ${activeCategory === cat.name ? "bg-accent text-[#1d2327] shadow-lg shadow-accent/30 scale-[1.02]" : "bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"}`}
                >
                  {getCategoryIcon(cat.name)}
                  <span>{cat.name}</span>
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${activeCategory === cat.name ? "bg-[#1d2327]/20 text-[#1d2327]" : "bg-white/10 text-white/40"}`}>
                    {getCategoryCount(cat.name)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════ Filtres actifs (résumé) ══════════ */}
        <div className="flex flex-wrap items-center gap-3 mb-6 text-sm">
          <span className="text-gray-400 font-medium">
            {filteredEmissions.length} {filteredEmissions.length <= 1 ? "émission" : "émissions"}
          </span>
          {activeCategory !== "ALL" && (
            <span className="inline-flex items-center gap-1.5 bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-bold">
              {getCategoryIcon(activeCategory)}
              {activeCategory}
              <button onClick={() => setActiveCategory("ALL")} className="ml-1 hover:text-accent/70">✕</button>
            </span>
          )}
          {activeLanguage !== "ALL" && (
            <span className="inline-flex items-center gap-1.5 bg-[#1d2327]/10 text-[#1d2327] px-3 py-1 rounded-full text-xs font-bold">
              {availableLanguages.find(l => l.code === activeLanguage)?.icon}
              {availableLanguages.find(l => l.code === activeLanguage)?.label}
              <button onClick={() => setActiveLanguage("ALL")} className="ml-1 hover:text-gray-400">✕</button>
            </span>
          )}
          {search && (
            <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
              « {search} »
              <button onClick={() => setSearch("")} className="ml-1 hover:text-gray-400">✕</button>
            </span>
          )}
        </div>

        {/* ══════════ ÉMISSIONS (gauche) + LANGUES SIDEBAR (droite) ══════════ */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 scroll-mt-24" id="emissions">

          {/* Grille d'émissions */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-gray-100 rounded-2xl sm:rounded-3xl h-[320px] sm:h-[400px] animate-pulse" />
                ))}
              </div>
            ) : filteredEmissions.length === 0 ? (
              <div className="py-16 sm:py-20 text-center bg-gray-50 rounded-2xl sm:rounded-3xl border border-dashed border-gray-200">
                <p className="text-gray-400 font-medium text-sm sm:text-base">{t("common.no_results")}</p>
              </div>
            ) : (
              <div className={`grid gap-4 sm:gap-6 ${
                filteredEmissions.length === 1 ? "grid-cols-1 max-w-md" :
                filteredEmissions.length === 2 ? "grid-cols-1 sm:grid-cols-2 max-w-3xl" :
                  "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
              }`}>
                <AnimatePresence mode="popLayout">
                  {filteredEmissions.map((item, idx) => {
                    const dateObj = item.emission_date || item.sermon_date || item.created_at;
                    const isValidDate = dateObj && !isNaN(new Date(dateObj).getTime());

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: idx * 0.04 }}
                        className="group relative h-[320px] sm:h-[400px] rounded-2xl sm:rounded-[2rem] overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500"
                        onClick={() => navigate(`/emission/${item.slug}`)}
                      >
                        {/* Background Image */}
                        <div className="absolute inset-0">
                          <img
                            src={item.image_url ? getFullImageUrl(item.image_url) : (item.image ? getFullImageUrl(item.image) : "https://images.unsplash.com/photo-1507692049790-de58290a4334?q=80&w=2070&auto=format&fit=crop")}
                            onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1507692049790-de58290a4334?q=80&w=2070&auto=format&fit=crop"; }}
                            alt={item.title}
                            crossOrigin="anonymous"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent opacity-40" />
                        </div>

                        {/* Content */}
                        <div className="relative h-full p-5 sm:p-7 flex flex-col">
                          {/* Top Badges */}
                          <div className="flex justify-between items-start gap-2">
                            <span className="bg-accent/90 backdrop-blur-md text-accent-foreground text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-3 sm:px-4 py-1 sm:py-1.5 rounded-full">
                              {item.category_name || "Général"}
                            </span>
                            {item.language && (
                              <div className="bg-white/10 backdrop-blur-md text-white border border-white/10 px-2 py-1 rounded-full flex items-center gap-1.5 shadow-lg group-hover:bg-white/20 transition-colors">
                                <div className="w-4 h-4 rounded-full overflow-hidden flex items-center justify-center bg-black/20 text-[10px] shadow-sm">
                                  {availableLanguages.find(l => l.code === item.language)?.icon}
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-wider">
                                  {item.language}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Title & Preacher */}
                          <div className="mt-auto mb-4 sm:mb-6">
                            <h3 className="text-lg sm:text-2xl font-bold text-white mb-1.5 sm:mb-2 leading-snug group-hover:text-accent transition-colors duration-300 line-clamp-3">
                              {formatPublicTitle(stripHtml(item.title))}
                            </h3>
                            <p className="text-white/70 text-xs sm:text-sm font-medium">
                              {stripHtml(item.preacher_name || t("common.default_preacher"))}
                            </p>
                          </div>

                          {/* Info Bar */}
                          <div className="pt-4 sm:pt-5 border-t border-white/10 flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-white/60">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-accent" />
                              {isValidDate ? new Date(dateObj).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : "--"}
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <Headphones className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-accent" />
                              {item.views_count || 0} {t("common.listeners_count")}
                            </div>
                          </div>

                          {/* Hover Action */}
                          <div className="mt-4 sm:mt-6 flex items-center gap-2 text-white font-black text-[10px] sm:text-xs uppercase tracking-widest translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                            <span className="bg-white text-black w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mr-1">
                              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </span>
                            {t("categories.view_emission")}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* ══════════ LANGUES SIDEBAR (droite, verticale) ══════════ */}
          <aside className="w-full lg:w-56 shrink-0 order-first lg:order-last">
            <div className="lg:sticky lg:top-24 rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-[#1d2327] via-[#2a2f33] to-[#1d2327] shadow-2xl shadow-black/15">
              {/* Header */}
              <div className="relative px-5 pt-5 pb-3">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-amber-400 to-accent" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40 flex items-center gap-2">
                  <Globe className="w-3 h-3" />
                  {t("categories.lang_label") || "LANGUES"}
                </h3>
              </div>

              {/* Language buttons */}
              <div className="px-3 pb-4 flex flex-row flex-wrap lg:flex-col gap-1.5">
                <button
                  onClick={() => setActiveLanguage("ALL")}
                  className={`group flex items-center justify-between w-full px-3.5 py-3 rounded-2xl transition-all duration-300 ${
                    activeLanguage === "ALL" 
                      ? "bg-accent text-[#1d2327] shadow-xl shadow-accent/20 scale-[1.02]" 
                      : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all ${
                      activeLanguage === "ALL" ? "bg-[#1d2327]/10" : "bg-white/10 group-hover:bg-white/15"
                    }`}>
                      🌍
                    </div>
                    <span className="text-sm font-bold tracking-tight">{t("categories.all_lang") || "Toutes"}</span>
                  </div>
                  <span className={`text-[10px] font-black min-w-[24px] text-center py-1 px-1.5 rounded-lg transition-all ${
                    activeLanguage === "ALL" ? "bg-[#1d2327]/20 text-[#1d2327]" : "bg-white/10 text-white/40"
                  }`}>
                    {getLanguageCount("ALL")}
                  </span>
                </button>

                <div className="hidden lg:block w-full h-px bg-white/10 my-1" />

                {availableLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setActiveLanguage(lang.code)}
                    className={`group flex items-center justify-between w-full px-3.5 py-3 rounded-2xl transition-all duration-300 ${
                      activeLanguage === lang.code 
                        ? "bg-accent text-[#1d2327] shadow-xl shadow-accent/20 scale-[1.02]" 
                        : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg shadow-inner transition-all ${
                        activeLanguage === lang.code ? "bg-[#1d2327]/10" : "bg-white/10 group-hover:bg-white/15"
                      }`}>
                        {lang.icon}
                      </div>
                      <span className="text-sm font-bold tracking-tight">{lang.label}</span>
                    </div>
                    <span className={`text-[10px] font-black min-w-[24px] text-center py-1 px-1.5 rounded-lg transition-all ${
                      activeLanguage === lang.code ? "bg-[#1d2327]/20 text-[#1d2327]" : "bg-white/10 text-white/40"
                    }`}>
                      {getLanguageCount(lang.code)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
