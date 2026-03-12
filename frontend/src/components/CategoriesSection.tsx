import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronRight, Flame, Headphones, Calendar, Music, BookOpen, Users, HeartPulse, Radio } from "lucide-react";
import { Input } from "@/components/ui/input";
import { apiService } from "@/lib/api";
import { stripHtml, getFullImageUrl } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const CategoriesSection = () => {
  const [settings, setSettings] = useState<any>(null);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [search, setSearch] = useState("");
  const [emissions, setEmissions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sermonsData, categoriesData, settingsData] = await Promise.all([
          apiService.getSermons(),
          apiService.getSermonCategories(),
          apiService.getSettings()
        ]);

        const results = sermonsData.results || sermonsData;
        const catResults = categoriesData.results || categoriesData;

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
    if (!settings) return null;
    const lang = i18n.language || 'fr';
    const fieldName = `${key}_${lang}`;
    return settings[fieldName] || settings[key];
  };

  const filteredEmissions = emissions.filter(e =>
    (activeCategory === "ALL" || e.category === activeCategory || e.category_name === activeCategory) &&
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

  return (
    <section className="py-16 bg-white" id="categories">
      <div className="container mx-auto px-4">
        <header className="mb-12">
          <h1 className="text-5xl font-bold text-[#1d2327] mb-4 font-serif">
            {stripHtml(getSetting("section_categories")) || t("categories.title")}
            {getSetting("section_categories_accent") && (
              <span className="text-accent ml-3">{stripHtml(getSetting("section_categories_accent"))}</span>
            )}
          </h1>
          <p className="text-gray-500 max-w-2xl text-lg">
            {stripHtml(getSetting("section_categories_desc")) || t("categories.desc")}
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-80 shrink-0 space-y-8">
            <div className="space-y-4">
              <label htmlFor="categoriessection-input-1" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block cursor-pointer">{t("categories.search_label") || "RECHERCHER"}</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <Input id="categoriessection-input-1" name="categoriessection-input-1"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("categories.search_placeholder")}
                  autoComplete="off"
                  className="pl-10 bg-gray-50 border-gray-100 h-12 rounded-xl focus-visible:ring-accent"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{t("categories.nav_label") || "NAVIGATION"}</h3>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setActiveCategory("ALL")}
                  className={`flex items-center justify-between p-2.5 rounded-xl transition-all group ${activeCategory === "ALL" ? "bg-accent/10 border border-accent/20" : "hover:bg-gray-50"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${activeCategory === "ALL" ? "bg-accent text-accent-foreground" : "bg-gray-100 text-gray-400 group-hover:bg-accent/20 group-hover:text-accent"}`}>
                      <Radio className="w-4 h-4" />
                    </div>
                    <span className={`text-sm font-bold ${activeCategory === "ALL" ? "text-accent" : "text-gray-600 group-hover:text-gray-900"}`}>{t("categories.all")}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-400">{getCategoryCount("ALL")}</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.name)}
                    className={`flex items-center justify-between p-2.5 rounded-xl transition-all group ${activeCategory === cat.name ? "bg-accent/10 border border-accent/20" : "hover:bg-gray-50"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${activeCategory === cat.name ? "bg-accent text-accent-foreground" : "bg-gray-100 text-gray-400 group-hover:bg-accent/20 group-hover:text-accent"}`}>
                        {getCategoryIcon(cat.name)}
                      </div>
                      <span className={`text-sm font-bold ${activeCategory === cat.name ? "text-accent" : "text-gray-600 group-hover:text-gray-900"}`}>{cat.name}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-400">{getCategoryCount(cat.name)}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Content Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid sm:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-gray-50 rounded-3xl h-[400px] animate-pulse border border-gray-100" />
                ))}
              </div>
            ) : filteredEmissions.length === 0 ? (
              <div className="py-20 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <p className="text-gray-400 font-medium">{t("common.no_results")}</p>
              </div>
            ) : (
              <div className={`grid gap-6 ${filteredEmissions.length === 1 ? "grid-cols-1 max-w-md mx-auto" :
                filteredEmissions.length === 2 ? "grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto" :
                  "sm:grid-cols-2 xl:grid-cols-3"
                }`}>
                <AnimatePresence mode="popLayout">
                  {filteredEmissions.map((item, idx) => {
                    const dateObj = item.sermon_date || item.created_at;
                    const isValidDate = dateObj && !isNaN(new Date(dateObj).getTime());

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group relative h-[420px] rounded-[2rem] overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/10"
                        onClick={() => navigate(`/sermon/${item.slug}`)}
                      >
                        {/* Background Image */}
                        <div className="absolute inset-0">
                          <img
                            src={item.image_url ? getFullImageUrl(item.image_url) : (item.image ? getFullImageUrl(item.image) : "https://images.unsplash.com/photo-1507692049790-de58290a4334?q=80&w=2070&auto=format&fit=crop")}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          {/* Gradient Overlays */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent opacity-40" />
                        </div>

                        {/* Content */}
                        <div className="relative h-full p-8 flex flex-col">
                          {/* Top: Category Badge */}
                          <div className="flex justify-between items-start">
                            <span className="bg-accent/90 backdrop-blur-md text-accent-foreground text-[10px] font-black uppercase tracking-wider px-4 py-1.5 rounded-full">
                              {item.category_name || "Général"}
                            </span>
                          </div>

                          {/* Middle: Title & Preacher */}
                          <div className="mt-auto mb-6">
                            <h3 className="text-2xl font-bold text-white mb-2 leading-tight group-hover:text-accent transition-colors duration-300">
                              {stripHtml(item.title)}
                            </h3>
                            <p className="text-white/70 text-sm font-medium">
                              {stripHtml(item.preacher_name || t("common.default_preacher"))}
                            </p>
                          </div>

                          {/* Bottom: Info Bar */}
                          <div className="pt-6 border-t border-white/10 flex items-center justify-between text-[11px] font-bold text-white/60">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-accent" />
                              {isValidDate ? new Date(dateObj).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : "--"}
                            </div>
                            <div className="flex items-center gap-2">
                              <Headphones className="w-3.5 h-3.5 text-accent" />
                              {item.views_count || 0} {t("common.listeners_count")}
                            </div>
                          </div>

                          {/* Hover Action */}
                          <div className="mt-6 flex items-center gap-2 text-white font-black text-xs uppercase tracking-widest translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                            <span className="bg-white text-black w-8 h-8 rounded-full flex items-center justify-center mr-1">
                              <ChevronRight className="w-4 h-4" />
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
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
