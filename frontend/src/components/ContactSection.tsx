import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, Clock, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import contactCity from "@/assets/contact-city.jpg";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { apiService } from "@/lib/api";
import { stripHtml } from "@/lib/utils";


const ContactSection = () => {
  const { t, i18n } = useTranslation();
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    apiService.getSettings().then(setSettings).catch(console.error);
  }, []);

  const getSetting = (key: string) => {
    if (!settings) return null;
    const lang = i18n.language || 'fr';
    const fieldName = `${key}_${lang}`;
    return settings[fieldName] || settings[key];
  };

  const contactInfo = [
    { icon: Mail, label: t("contact.info.email"), value: settings?.contact_email || "contact@shalom.org", href: `mailto:${settings?.contact_email || "contact@shalom.org"}` },
    { icon: Phone, label: t("contact.info.phone"), value: settings?.contact_phone || "+257 79 901 864", href: `tel:${(settings?.contact_phone || "+257 79 901 864").replace(/\s/g, '')}` },
    { icon: MapPin, label: t("contact.info.address"), value: settings?.contact_address || "Bujumbura, Burundi", href: "#" },
    { icon: Clock, label: t("contact.info.hours"), value: getSetting("contact_hours") || t("contact.info.hours_value"), href: "#" },
  ];
  return (
    <section className="relative py-16 overflow-hidden" id="contact">
      {/* Background image */}
      <div className="absolute inset-0">
        <img src={contactCity} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-primary/90 backdrop-blur-sm" />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-accent text-sm font-semibold uppercase tracking-widest mb-3 block">
            {stripHtml(getSetting("contact_badge")) || t("contact.badge")}
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-4">
            {stripHtml(getSetting("contact_title") || t("contact.title"))} <span className="text-gradient-gold">{stripHtml(getSetting("contact_title_accent") || t("contact.title_accent"))}</span>
          </h2>
          <p className="text-primary-foreground/60 max-w-lg mx-auto">
            {stripHtml(getSetting("contact_description") || t("contact.description"))}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
          {/* Contact info cards */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 space-y-4"
          >
            {contactInfo.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.a
                  key={item.label}
                  href={item.href}
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4 bg-primary-foreground/5 backdrop-blur-md rounded-2xl p-5 border border-primary-foreground/10 hover:border-accent/40 hover:bg-primary-foreground/10 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center shrink-0 group-hover:bg-accent/30 transition-colors">
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-primary-foreground/50 text-xs font-medium uppercase tracking-wider">{item.label}</p>
                    <p className="text-primary-foreground font-semibold">{item.value}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-primary-foreground/30 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.a>
              );
            })}

            {/* Social links */}
            <div className="pt-4">
              <p className="text-primary-foreground/40 text-xs font-semibold uppercase tracking-wider mb-3">{t("contact.follow")}</p>
              <div className="flex gap-3">
                {["Facebook", "YouTube", "Instagram"].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-11 h-11 rounded-xl bg-primary-foreground/5 border border-primary-foreground/10 flex items-center justify-center text-primary-foreground/50 hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all text-xs font-bold"
                  >
                    {social[0]}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3"
          >
            <div className="bg-card rounded-3xl p-8 shadow-2xl border border-border">
              <h3 className="text-xl font-bold text-foreground mb-6">{t("contact.form_title")}</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="text-sm font-medium text-foreground mb-1.5 block">{t("contact.form.name")}</label>
                    <Input id="contact-name" name="name" autoComplete="name" placeholder={t("contact.form.name_placeholder")} className="bg-muted/50 border-border" required />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="text-sm font-medium text-foreground mb-1.5 block">{t("contact.form.email")}</label>
                    <Input id="contact-email" name="email" type="email" autoComplete="email" placeholder={t("contact.form.email_placeholder")} className="bg-muted/50 border-border" required />
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-subject" className="text-sm font-medium text-foreground mb-1.5 block">{t("contact.form.subject")}</label>
                  <Input id="contact-subject" name="subject" autoComplete="off" placeholder={t("contact.form.subject_placeholder")} className="bg-muted/50 border-border" required />
                </div>
                <div>
                  <label htmlFor="contact-message" className="text-sm font-medium text-foreground mb-1.5 block">{t("contact.form.message")}</label>
                  <Textarea id="contact-message" name="message" autoComplete="off" placeholder={t("contact.form.message_placeholder")} className="bg-muted/50 border-border min-h-[140px] resize-none" required />
                </div>
                <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 gap-2 text-base">
                  <Send className="w-4 h-4" /> {t("contact.form.submit")}
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
