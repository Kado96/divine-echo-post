import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, User, Globe, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { apiService } from "@/lib/api";
import { getFullImageUrl } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [logoError, setLogoError] = useState(false);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    apiService.getSettings().then(data => {
      if (!data) return; // Sécurité si l'API renvoie null (ex: 401 gracieux)
      setSettings(data);
      const siteName = i18n.language === 'fr' ? data.site_name : (data[`site_name_${i18n.language}`] || data.site_name);
      if (siteName) {
        document.title = siteName;
      }
      if (data.logo) {
        const fullLogoUrl = getFullImageUrl(data.logo);
        const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (link) {
          link.href = fullLogoUrl;
        } else {
          const newLink = document.createElement('link');
          newLink.rel = 'icon';
          newLink.href = fullLogoUrl;
          document.head.appendChild(newLink);
        }
      }
    }).catch(console.error);
  }, [i18n.language]);

  const navLinks = [
    { label: t("nav.home"), href: "/" },
    { label: t("nav.emissions"), href: "/#emissions" },
    { label: t("nav.about"), href: "/#about" },
    { label: t("nav.contact"), href: "/#contact" },
  ];

  const LANGUAGES = [
    { code: 'fr', label: 'Français', flag: '🇫🇷', country: 'FR' },
    { code: 'rn', label: 'Kirundi', flag: '🇧🇮', country: 'BI' },
    { code: 'en', label: 'English', flag: '🇺🇸', country: 'US' },
    { code: 'sw', label: 'Swahili', flag: '🇹🇿', country: 'TZ' },
  ];

  const currentLanguage = LANGUAGES.find(l => l.code === (i18n.language || 'fr').split('-')[0]) || LANGUAGES[0];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };


  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-md border-b border-primary-foreground/10">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <a href="/" className="flex items-center gap-3">
          {(settings?.logo_url_display || settings?.logo) && !logoError ? (
            <img
              src={settings.logo_url_display || getFullImageUrl(settings.logo)}
              alt={settings.site_name || "Logo"}
              className="h-10 w-auto object-contain"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center shadow-sm">
              <span className="text-accent-foreground font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
                {settings?.site_name?.[0] || "S"}
              </span>
            </div>
          )}

          <span className="text-primary-foreground text-xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            {settings?.site_name || "Shalom"}
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-primary-foreground/80 hover:text-accent transition-colors text-sm font-medium"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA & Language */}
        <div className="hidden md:flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10 h-10 flex gap-2 items-center px-3 rounded-full transition-all duration-300 border border-transparent hover:border-primary-foreground/20">
                <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center bg-primary-foreground/10 text-lg shadow-inner">
                  {currentLanguage.flag}
                </div>
                <span className="text-xs font-bold uppercase tracking-wider">{currentLanguage.code}</span>
                <ChevronDown className="w-3 h-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-primary/95 backdrop-blur-xl border-primary-foreground/10 text-primary-foreground p-1.5 min-w-[160px] shadow-2xl rounded-2xl">
              {LANGUAGES.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors cursor-pointer mb-0.5 last:mb-0 ${
                    currentLanguage.code === lang.code 
                      ? "bg-accent text-accent-foreground font-bold" 
                      : "focus:bg-primary-foreground/10 focus:text-primary-foreground"
                  }`}
                >
                  <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center bg-primary-foreground/5 text-xl shadow-sm border border-primary-foreground/5">
                    {lang.flag}
                  </div>
                  <span className="text-sm font-medium">{lang.label}</span>
                  {currentLanguage.code === lang.code && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-foreground" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link to="/admin">
            <Button variant="outline" size="sm" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 h-8">
              <User className="w-4 h-4 mr-1" />
              {t("nav.admin")}
            </Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-primary-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-primary border-t border-primary-foreground/10 overflow-hidden"
          >
            <nav className="flex flex-col p-4 gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-primary-foreground/80 hover:text-accent py-2 text-sm font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-primary-foreground/10">
                {LANGUAGES.map((lang) => (
                  <Button 
                    key={lang.code}
                    variant="ghost" 
                    size="sm" 
                    onClick={() => { changeLanguage(lang.code); setMobileOpen(false); }} 
                    className={`h-12 px-4 flex gap-3 items-center text-primary-foreground rounded-2xl transition-all ${
                      currentLanguage.code === lang.code 
                        ? 'bg-accent text-accent-foreground shadow-lg shadow-accent/20' 
                        : 'bg-primary-foreground/5 hover:bg-primary-foreground/10 border border-transparent'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-black/10 text-xl shadow-inner">
                      {lang.flag}
                    </div>
                    <span className="text-sm font-bold">{lang.label}</span>
                  </Button>
                ))}
              </div>

              <Link to="/admin" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" size="sm" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 w-fit mt-2">
                  <User className="w-4 h-4 mr-1" />
                  {t("nav.admin")}
                </Button>
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
