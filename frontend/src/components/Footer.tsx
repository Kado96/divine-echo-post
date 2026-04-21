import { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Facebook, Youtube, Send, ArrowUpRight } from "lucide-react";
import { apiService } from "@/lib/api";
import { stripHtml, getFullImageUrl, getLocalizedField } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

const Footer = () => {
  const [settings, setSettings] = useState<any>(null);
  const [logoError, setLogoError] = useState(false);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    apiService.getSettings().then(setSettings).catch(console.error);
  }, [i18n.language]);

  const getSetting = (key: string) => {
    return getLocalizedField(settings, key, i18n.language);
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#020408] text-white pt-24 pb-12 overflow-hidden border-t border-white/5" id="contact">
      {/* Cinematic Overlays */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.05)_0%,transparent_50%)]" />
        {/* Grain/Noise effect overlay */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3仿真%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-8 mb-20">
          
          {/* Brand & Mission */}
          <div className="lg:col-span-5 space-y-8">
            <div className="flex items-center gap-5">
              {(settings?.logo_url_display || settings?.logo) && !logoError ? (
                <div className="relative group">
                  <div className="absolute -inset-3 bg-accent/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
                  <img
                    src={settings.logo_url_display || getFullImageUrl(settings.logo)}
                    alt=""
                    className="h-16 w-auto object-contain relative transition-transform duration-700 group-hover:scale-110 drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                    onError={() => setLogoError(true)}
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-[22px] bg-gradient-to-br from-accent via-amber-600 to-amber-900 shadow-2xl flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <span className="text-white font-black text-3xl" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {stripHtml(getSetting("site_name")?.[0] || "S")}
                  </span>
                </div>
              )}

              <div className="flex flex-col">
                <span className="text-3xl font-black tracking-tight leading-none text-white drop-shadow-sm" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {stripHtml(getSetting("site_name") || "Shalom")}
                </span>
                <span className="text-accent text-[10px] uppercase font-black tracking-[0.4em] mt-2 opacity-80">
                  {t("hero.subtitle") || "Mission & Transformation"}
                </span>
              </div>
            </div>
            
            <p className="text-gray-400 text-lg leading-relaxed max-w-md font-medium text-balance italic">
               "{stripHtml(getSetting("footer_description") || getSetting("description") || t("hero.description"))}"
            </p>

            <div className="flex items-center gap-5 pt-4">
              {settings?.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-13 h-13 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#1877F2] hover:border-[#1877F2] hover:shadow-[0_0_20px_rgba(24,119,242,0.4)] transition-all duration-500 text-gray-400 hover:text-white group"
                >
                  <Facebook className="w-6 h-6 transition-transform group-hover:scale-110" />
                </a>
              )}
              {settings?.youtube_url && (
                <a
                  href={settings.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-13 h-13 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#FF0000] hover:border-[#FF0000] hover:shadow-[0_0_20px_rgba(255,0,0,0.4)] transition-all duration-500 text-gray-400 hover:text-white group"
                >
                  <Youtube className="w-6 h-6 transition-transform group-hover:scale-110" />
                </a>
              )}
            </div>
          </div>

          {/* Navigation Consolidée */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-black uppercase tracking-[0.4em] mb-10 text-accent/90" style={{ fontFamily: "'Playfair Display', serif" }}>
              {stripHtml(getSetting("footer_quick_links_title")) || t("footer.quick_links")}
            </h4>
            <ul className="grid grid-cols-1 gap-5">
              {[
                { label: t("nav.home"), href: "/" },
                { label: t("nav.emissions"), href: "/#emissions" },
                { label: t("nav.about"), href: "/#about" },
                { label: t("nav.contact"), href: "/#contact" }
              ].map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-gray-400 hover:text-white font-bold transition-all flex items-center gap-3 group text-base">
                    <span className="w-0 group-hover:w-4 h-[2px] bg-accent transition-all duration-500 rounded-full"></span>
                    <span className="group-hover:translate-x-1 transition-transform duration-500">{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Audience */}
          <div className="lg:col-span-4">
            <h4 className="text-xs font-black uppercase tracking-[0.4em] mb-10 text-accent/90" style={{ fontFamily: "'Playfair Display', serif" }}>
              {stripHtml(getSetting("footer_contact_title")) || t("nav.contact")}
            </h4>
            <div className="space-y-8">
              <a href={`mailto:${settings?.contact_email}`} className="flex items-center gap-5 group">
                <div className="w-14 h-14 rounded-2xl bg-accent/5 border border-accent/20 flex items-center justify-center group-hover:bg-accent group-hover:border-accent transition-all duration-700 shrink-0 shadow-lg shadow-accent/5">
                  <Mail className="w-6 h-6 text-accent group-hover:text-black transition-colors" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Email Connection</p>
                  <p className="text-base font-black group-hover:text-accent transition-colors duration-500 tracking-tight">{settings?.contact_email || "contact@shalom.org"}</p>
                </div>
              </a>
              
              <a href={`https://wa.me/${settings?.contact_phone?.replace(/\s/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-5 group">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500 group-hover:border-emerald-500 transition-all duration-700 shrink-0 shadow-lg shadow-emerald-500/5">
                  <Phone className="w-6 h-6 text-emerald-500 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">WhatsApp Live</p>
                  <p className="text-base font-black group-hover:text-emerald-500 transition-colors duration-500 tracking-tight">{settings?.contact_phone || "+257 79 901 864"}</p>
                </div>
              </a>
            </div>
          </div>

        </div>

        {/* Footer Bottom - Minimal & Cinematic */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] text-center md:text-left">
              © {currentYear} {stripHtml(getSetting("site_name") || "Shalom Ministry")}
            </p>
            <p className="text-[9px] font-bold text-gray-700 uppercase tracking-[0.4em]">
              {stripHtml(getSetting("footer_copyright")) || t("footer.rights") || "All Rights Reserved"}
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_10px_rgba(212,175,55,0.8)]" />
              <span className="text-[10px] font-black text-accent uppercase tracking-widest">Divine Echo Live</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
