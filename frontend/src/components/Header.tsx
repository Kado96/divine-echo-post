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
              crossOrigin="anonymous"
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
          {/* Social Links */}
          <div className="flex items-center gap-2 mr-2 pr-2 border-r border-primary-foreground/10">
            {settings?.facebook_url && (
              <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="text-primary-foreground/60 hover:text-accent transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
            )}
            {settings?.youtube_url && (
              <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" className="text-primary-foreground/60 hover:text-[#FF0000] transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            )}
            {settings?.tiktok_url && (
              <a href={settings.tiktok_url} target="_blank" rel="noopener noreferrer" className="text-primary-foreground/60 hover:text-white transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
              </a>
            )}
          </div>

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

              {/* Mobile Social Links */}
              {(settings?.facebook_url || settings?.youtube_url || settings?.tiktok_url) && (
                <div className="flex items-center gap-4 pt-4 mt-2 border-t border-primary-foreground/10">
                  {settings?.facebook_url && (
                    <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-primary-foreground/5 flex items-center justify-center text-primary-foreground/60 hover:text-accent transition-colors">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </a>
                  )}
                  {settings?.youtube_url && (
                    <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-primary-foreground/5 flex items-center justify-center text-primary-foreground/60 hover:text-[#FF0000] transition-colors">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                    </a>
                  )}
                  {settings?.tiktok_url && (
                    <a href={settings.tiktok_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-primary-foreground/5 flex items-center justify-center text-primary-foreground/60 hover:text-white transition-colors">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
                    </a>
                  )}
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
