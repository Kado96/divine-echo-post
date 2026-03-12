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
              {settings?.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-[#1877F2] transition-all group"
                  title="Facebook"
                >
                  <svg className="w-5 h-5 text-primary-foreground/60 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
              )}
              {settings?.youtube_url && (
                <a
                  href={settings.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-[#FF0000] transition-all group"
                  title="YouTube"
                >
                  <svg className="w-5 h-5 text-primary-foreground/60 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
              )}
              {settings?.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#e6683c] hover:to-[#bc1888] transition-all group"
                  title="Instagram"
                >
                  <svg className="w-5 h-5 text-primary-foreground/60 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 1 0 0-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 1 1-2.882 0 1.441 1.441 0 0 1 2.882 0z"/></svg>
                </a>
              )}
              {settings?.tiktok_url && (
                <a
                  href={settings.tiktok_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-black transition-all group"
                  title="TikTok"
                >
                  <svg className="w-5 h-5 text-primary-foreground/60 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
                </a>
              )}
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
