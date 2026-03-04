import { motion } from "framer-motion";
import { Heart, BookOpen, Users, Target, Quote } from "lucide-react";
import aboutTeam from "@/assets/about-team.jpg";
import aboutChurch from "@/assets/about-church.jpg";
import pastorPortrait from "@/assets/pastor-portrait.jpg";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { apiService } from "@/lib/api";
import { stripHtml } from "@/lib/utils";

const AboutSection = () => {
  const { t, i18n } = useTranslation();
  const [settings, setSettings] = useState<any>(null);

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


  const values = [
    { icon: BookOpen, title: getSetting("about_feature1") || t("about.feature1"), desc: "" },
    { icon: Heart, title: getSetting("about_feature2") || t("about.feature2"), desc: "" },
    { icon: Users, title: getSetting("about_feature3") || t("about.feature3"), desc: "" },
    { icon: Target, title: getSetting("about_feature4") || t("about.feature4"), desc: "" },
  ];
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
            className="lg:col-span-2 bg-primary rounded-3xl p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div>
              <Quote className="w-10 h-10 text-accent mb-6" />
              <p className="text-primary-foreground text-lg md:text-xl leading-relaxed italic mb-8">
                "{stripHtml(getSetting("quote_text")) || t("about.quote")}"
              </p>
            </div>
            <div className="flex items-center gap-4">
              <img
                src={settings?.quote_author_image_display || pastorPortrait}
                alt="Pasteur"
                className="w-14 h-14 rounded-full object-cover border-2 border-accent"
              />
              <div>
                <p className="text-primary-foreground font-bold">
                  {stripHtml(getSetting("quote_author_name")) || t("about.pastor_title")}
                </p>
                <p className="text-primary-foreground/50 text-sm">
                  {stripHtml(getSetting("quote_author_subtitle")) || t("hero.subtitle")}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Team image */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-3 relative rounded-3xl overflow-hidden group"
          >
            <img
              src={settings?.team_image_display || aboutTeam}
              alt="Équipe Shalom"
              className="w-full h-full min-h-[350px] object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <h3 className="text-2xl font-bold text-primary-foreground mb-2">
                {stripHtml(getSetting("team_title")) || t("about.team_title")}
              </h3>
              <p className="text-primary-foreground/70 max-w-md">
                {stripHtml(getSetting("team_description")) || t("about.team_desc")}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
