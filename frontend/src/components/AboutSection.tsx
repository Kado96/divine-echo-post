import { motion } from "framer-motion";
import { Heart, BookOpen, Users, Target, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import aboutTeam from "@/assets/about-team.jpg";
import aboutChurch from "@/assets/about-church.jpg";
import pastorPortrait from "@/assets/pastor-portrait.jpg";
import team1 from "@/assets/team/team-1.png";
import team2 from "@/assets/team/team-2.png";
import team3 from "@/assets/team/team-3.png";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { apiService } from "@/lib/api";
import { stripHtml, getFullImageUrl, getLocalizedField } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import useEmblaCarousel from "embla-carousel-react";

const AboutSection = () => {
  const { t, i18n } = useTranslation();
  const [settings, setSettings] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 40 });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const autoplay = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      }
    }, 5000);
    return () => clearInterval(autoplay);
  }, [emblaApi]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await apiService.getSettings();
        setSettings(data);
      } catch (err) {
        console.error("Failed to fetch settings", err);
      }
    };

    const fetchTeam = async () => {
      try {
        const data = await apiService.getTeamMembers();
        setMembers(Array.isArray(data) ? data : (data?.results || []));
      } catch (err) {
        console.error("Failed to fetch team members", err);
      }
    };

    fetchSettings();
    fetchTeam();
  }, [i18n.language]);

  const getSetting = (key: string) => {
    return getLocalizedField(settings, key, i18n.language);
  };


  const teamCarousel = [
    {
      id: 'p1',
      name: "Jean Emmanuel",
      role_fr: "Dirigeant Pasteur",
      role_en: "Lead Pastor",
      photo: pastorPortrait,
      desc: "Direction et vision spirituelle du ministère."
    },
    {
      id: 'p2',
      name: "Donald Nom",
      role_fr: "Pasteur / Auteur",
      role_en: "Pastor / Author",
      photo: team1,
      desc: "Enseignement et rédaction."
    },
    {
      id: 'p3',
      name: "kandeke Donald",
      role_fr: "Pasteur / Auteur",
      role_en: "Pastor / Author",
      photo: team2,
      desc: "Dévoué à la Parole."
    },
    {
      id: 'p4',
      name: "Patrick Kandeke",
      role_fr: "Pasteur / Auteur",
      role_en: "Pastor / Author",
      photo: team3,
      desc: "Soutien et leadership."
    },
    {
      id: 't1',
      name: "qa_agent",
      role_fr: "Administrateur",
      role_en: "Administrator",
      photo: aboutTeam,
      desc: "Gestion système."
    },
    {
      id: 't2',
      name: "Donale",
      role_fr: "Administrateur",
      role_en: "Administrator",
      photo: aboutChurch,
      desc: "Coordination et support."
    },
  ];

  const displayMembers = members.length > 0 ? members : teamCarousel;

  const values = [
    { icon: BookOpen, title: getSetting("about_feature1"), desc: "" },
    { icon: Heart, title: getSetting("about_feature2"), desc: "" },
    { icon: Users, title: getSetting("about_feature3"), desc: "" },
    { icon: Target, title: getSetting("about_feature4"), desc: "" },
  ].filter(v => v.title && v.title.trim() !== "");
  return (
    <section className="py-16 bg-background" id="about">
      <div className="container mx-auto px-4">
        {/* Section 1: Story with large image */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={settings?.about_image_display || aboutChurch}
                onError={(e) => { e.currentTarget.src = aboutChurch; }}
                alt="Église Shalom"
                className="w-full h-[400px] lg:h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
            </div>
            {/* Floating stats card */}
            <div className="absolute -bottom-6 -right-4 lg:-right-8 bg-card rounded-2xl shadow-xl border border-border p-5 w-48">
              <div className="text-3xl font-bold text-accent mb-1">
                {settings?.stat_years_value || "10+"}
              </div>
              <div className="text-sm text-muted-foreground">
                {stripHtml(getSetting("stat_years_label")) || t("about.stats_label")}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-accent text-sm font-semibold uppercase tracking-widest mb-3 block">
              {stripHtml(getSetting("about_badge")) || t("about.history_badge")}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              {stripHtml(getSetting("about_title")) || t("about.title")}{" "}
              <span className="text-gradient-gold">
                {stripHtml(getSetting("about_title_accent")) || t("about.title_accent")}
              </span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              {stripHtml(getSetting("about_content") || t("about.description"))}
            </p>

            {/* Values grid */}
            <div className="grid grid-cols-2 gap-4">
              {values.map((v, i) => {
                const Icon = v.icon;
                return (
                  <motion.div
                    key={v.title}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-card rounded-xl p-4 border border-border hover:border-accent/30 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                    <h4 className="font-bold text-foreground text-sm mb-1">{v.title}</h4>
                    <p className="text-muted-foreground text-xs leading-relaxed">{v.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Section 2: Pastor quote + Team */}
        <div className="grid lg:grid-cols-5 gap-8 items-stretch">
          {/* Quote card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 bg-primary rounded-3xl p-8 lg:p-10 flex flex-col gap-4 relative overflow-hidden shadow-2xl"
          >
            {/* Background design element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full -translate-y-1/2 translate-x-1/2" />

            {/* 1. Author Info at Top */}
            <div className="flex items-center gap-4 relative z-10">
              <img
                src={settings?.quote_author_image_display || pastorPortrait}
                onError={(e) => { e.currentTarget.src = pastorPortrait; }}
                alt="Pasteur"
                className="w-16 h-16 rounded-full object-cover border-2 border-accent shadow-lg"
              />
              <div className="min-w-0">
                <p className="text-primary-foreground font-black text-lg tracking-tight truncate">
                  {stripHtml(getSetting("quote_author_name")) || t("about.pastor_title")}
                </p>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  <p className="text-accent text-[11px] font-black uppercase tracking-[0.2em] truncate">
                    {stripHtml(getSetting("quote_author_subtitle")) || t("hero.subtitle")}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Verse/Quote at Bottom */}
            <div className="relative z-10 flex flex-col">
              <Quote className="w-8 h-8 text-accent mb-2 opacity-50" />
              <p className="text-primary-foreground text-xl md:text-2xl font-medium leading-relaxed italic">
                <span className="text-accent not-italic font-black block text-[10px] uppercase tracking-[0.3em] mb-2">
                  {t("about.verse_of_day_label") || "Verset du jour :"}
                </span>
                "{stripHtml(getSetting("quote_text")) || t("about.quote")}"
              </p>
            </div>
          </motion.div>

          {/* Team image / Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-3 relative rounded-3xl overflow-hidden group shadow-2xl"
          >
            <div className="overflow-hidden h-full rounded-3xl min-h-[450px]" ref={emblaRef}>
              <div className="flex h-full">
                {displayMembers.map(member => (
                  <div key={member.id} className="flex-[0_0_100%] min-w-0 relative h-full">
                    <img
                      src={member.photo_display || (member.photo?.includes('/src/') || member.photo?.includes('/assets/') ? member.photo : getFullImageUrl(member.photo)) || member.photo}
                      onError={(e) => { e.currentTarget.src = aboutTeam; }}
                      alt={member.name}
                      className="w-full h-full min-h-[450px] object-cover transition-transform duration-1000 scale-100 group-hover:scale-110"
                    />

                    {/* Bottom Right Floating Info Overlay */}
                    <div className="absolute bottom-12 right-6 md:bottom-16 md:right-10 text-right z-30 pointer-events-none">
                      <motion.div
                        initial={{ opacity: 0, x: 50, y: 20 }}
                        whileInView={{ opacity: 1, x: 0, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 lg:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] inline-block text-right"
                      >
                        <h3 className="text-3xl lg:text-5xl font-black text-white mb-2 leading-none tracking-tighter uppercase drop-shadow-2xl">
                          {member.name}
                        </h3>
                        <div className="flex items-center justify-end gap-3 mt-4">
                          <span className="w-3 h-3 rounded-full bg-accent shadow-[0_0_15px_rgba(234,179,8,1)] animate-pulse" />
                          <p className="text-accent text-[12px] lg:text-[14px] font-black uppercase tracking-[0.3em] drop-shadow-md">
                            {member[`role_${i18n.language}`] || member.role_fr || member.role || "Shalom Ministry"}
                          </p>
                        </div>
                      </motion.div>
                    </div>

                    {/* Bottom Gradient for readability */}
                    <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none z-10" />

                  </div>
                ))}
              </div>
            </div>

            {/* Pagination Dots */}
            {displayMembers.length > 1 && (
              <div className="absolute top-10 right-10 flex gap-2 z-20">
                {displayMembers.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => emblaApi?.scrollTo(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-500 border border-white/20 ${index === selectedIndex ? "bg-white w-6 border-white shadow-[0_0_10px_white]" : "bg-white/20 hover:bg-white/40"
                      }`}
                    aria-label={`Aller au membre ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Navigation Arrows */}
            {displayMembers.length > 1 && (
              <>
                <button
                  onClick={() => emblaApi?.scrollPrev()}
                  className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/20 hover:bg-accent backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all duration-300 z-30 group/btn shadow-2xl hover:scale-110 active:scale-95"
                  aria-label="Membre précédent"
                >
                  <ChevronLeft className="w-6 h-6 transition-transform group-hover/btn:-translate-x-0.5" />
                </button>
                <button
                  onClick={() => emblaApi?.scrollNext()}
                  className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/20 hover:bg-accent backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all duration-300 z-30 group/btn shadow-2xl hover:scale-110 active:scale-95"
                  aria-label="Membre suivant"
                >
                  <ChevronRight className="w-6 h-6 transition-transform group-hover/btn:translate-x-0.5" />
                </button>
              </>
            )}


          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
