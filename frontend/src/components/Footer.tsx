import { useState, useEffect } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { apiService } from "@/lib/api";
import { stripHtml } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const [settings, setSettings] = useState<any>(null);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    apiService.getSettings().then(setSettings).catch(console.error);
  }, []);

  const getSetting = (key: string) => {
    if (!settings) return null;
    const lang = i18n.language || 'fr';
    const fieldName = `${key}_${lang}`;
    return settings[fieldName] || settings[key];
  };

  return (
    <footer className="bg-primary text-primary-foreground" id="contact">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              {settings?.logo ? (
                <img
                  src={settings.logo}
                  alt={settings.site_name || "Logo"}
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center shadow-sm">
                  <span className="text-accent-foreground font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {stripHtml(settings?.site_name?.[0] || "S")}
                  </span>
                </div>
              )}
              <span className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                {stripHtml(settings?.site_name || "Shalom")}
              </span>
            </div>
            <p className="text-primary-foreground/60 text-sm leading-relaxed">
              {stripHtml(getSetting("footer_description") || getSetting("description") || t("hero.description"))}
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-5 text-accent">
              {stripHtml(getSetting("footer_quick_links_title")) || t("footer.quick_links")}
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                { label: t("nav.emissions"), href: "#emissions" },
                { label: t("nav.about"), href: "#about" },
                { label: t("nav.contact"), href: "#contact" }
              ].map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-primary-foreground/60 hover:text-accent transition-colors">{link.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-5 text-accent">
              {stripHtml(getSetting("footer_contact_title")) || t("nav.contact")}
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-primary-foreground/60">
                <Mail className="w-4 h-4 text-accent" /> {settings?.contact_email || "contact@shalom.org"}
              </li>
              <li className="flex items-center gap-2 text-primary-foreground/60">
                <Phone className="w-4 h-4 text-accent" /> {settings?.contact_phone || "+257 79 901 864"}
              </li>
              <li className="flex items-center gap-2 text-primary-foreground/60">
                <MapPin className="w-4 h-4 text-accent" /> {settings?.contact_address || "Bujumbura, Burundi"}
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-5 text-accent">
              {stripHtml(getSetting("footer_social_title")) || t("footer.follow")}
            </h4>
            <div className="flex gap-3">
              {["Facebook", "YouTube", "Instagram"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center text-primary-foreground/60 hover:bg-accent hover:text-accent-foreground transition-all text-xs font-bold"
                >
                  {social[0]}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between text-xs text-primary-foreground/40">
          <span>© {new Date().getFullYear()} {settings?.site_name || "Shalom"}. {stripHtml(getSetting("footer_copyright")) || t("footer.rights")}</span>
          <div className="flex gap-4 mt-2 md:mt-0">
            <a href="#" className="hover:text-accent transition-colors">{t("footer.privacy")}</a>
            <a href="#" className="hover:text-accent transition-colors">{t("footer.help")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
