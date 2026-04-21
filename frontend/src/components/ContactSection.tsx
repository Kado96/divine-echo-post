import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, Clock, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import contactCity from "@/assets/contact-city.jpg";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { apiService } from "@/lib/api";
import { stripHtml, getLocalizedField } from "@/lib/utils";


const ContactSection = () => {
  const { t, i18n } = useTranslation();
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  useEffect(() => {
    apiService.getSettings().then(setSettings).catch(console.error);
  }, [i18n.language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiService.sendContactMessage(formData);
      // @ts-ignore
      import("sonner").then(({ toast }) => {
        toast.success(t("contact.form.success") || "Message envoyé avec succès !");
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error(error);
      // @ts-ignore
      import("sonner").then(({ toast }) => {
        toast.error(t("contact.form.error") || "Erreur lors de l'envoi du message.");
      });
    } finally {
      setLoading(false);
    }
  };

  const getSetting = (key: string) => {
    return getLocalizedField(settings, key, i18n.language);
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
                {settings?.facebook_url && (
                  <a
                    href={settings.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-xl bg-primary-foreground/5 border border-primary-foreground/10 flex items-center justify-center hover:bg-[#1877F2] hover:border-[#1877F2] transition-all group"
                    title="Facebook"
                  >
                    <svg className="w-5 h-5 text-primary-foreground/50 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>
                )}
                {settings?.youtube_url && (
                  <a
                    href={settings.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-xl bg-primary-foreground/5 border border-primary-foreground/10 flex items-center justify-center hover:bg-[#FF0000] hover:border-[#FF0000] transition-all group"
                    title="YouTube"
                  >
                    <svg className="w-5 h-5 text-primary-foreground/50 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  </a>
                )}
                {settings?.instagram_url && (
                  <a
                    href={settings.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-xl bg-primary-foreground/5 border border-primary-foreground/10 flex items-center justify-center hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#e6683c] hover:to-[#bc1888] hover:border-[#e6683c] transition-all group"
                    title="Instagram"
                  >
                    <svg className="w-5 h-5 text-primary-foreground/50 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 1 0 0-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 1 1-2.882 0 1.441 1.441 0 0 1 2.882 0z"/></svg>
                  </a>
                )}
                {settings?.tiktok_url && (
                  <a
                    href={settings.tiktok_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-xl bg-primary-foreground/5 border border-primary-foreground/10 flex items-center justify-center hover:bg-black hover:border-black transition-all group"
                    title="TikTok"
                  >
                    <svg className="w-5 h-5 text-primary-foreground/50 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
                  </a>
                )}
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
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="text-sm font-medium text-foreground mb-1.5 block">{t("contact.form.name")}</label>
                    <Input id="contact-name" name="name" autoComplete="name" placeholder={t("contact.form.name_placeholder")} className="bg-muted/50 border-border" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="text-sm font-medium text-foreground mb-1.5 block">{t("contact.form.email")}</label>
                    <Input id="contact-email" name="email" type="email" autoComplete="email" placeholder={t("contact.form.email_placeholder")} className="bg-muted/50 border-border" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-subject" className="text-sm font-medium text-foreground mb-1.5 block">{t("contact.form.subject")}</label>
                  <Input id="contact-subject" name="subject" autoComplete="off" placeholder={t("contact.form.subject_placeholder")} className="bg-muted/50 border-border" required value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} />
                </div>
                <div>
                  <label htmlFor="contact-message" className="text-sm font-medium text-foreground mb-1.5 block">{t("contact.form.message")}</label>
                  <Textarea id="contact-message" name="message" autoComplete="off" placeholder={t("contact.form.message_placeholder")} className="bg-muted/50 border-border min-h-[140px] resize-none" required value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
                </div>
                <Button type="submit" size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 gap-2 text-base" disabled={loading}>
                  {loading ? <span className="animate-spin">⌛</span> : <Send className="w-4 h-4" />} {loading ? t("contact.form.sending") || "Envoi..." : t("contact.form.submit")}
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
