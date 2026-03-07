import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, User, Globe } from "lucide-react";
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
  const { t, i18n } = useTranslation();

  useEffect(() => {
    apiService.getSettings().then(data => {
      setSettings(data);
      if (data.site_name) {
        document.title = data.site_name;
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
  }, []);

  const navLinks = [
    { label: t("nav.home"), href: "/" },
    { label: t("nav.emissions"), href: "/#emissions" },
    { label: t("nav.about"), href: "/#about" },
    { label: t("nav.contact"), href: "/#contact" },
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };


  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-md border-b border-primary-foreground/10">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <a href="/" className="flex items-center gap-3">
          {settings?.logo ? (
            <img
              src={getFullImageUrl(settings.logo)}
              alt={settings.site_name || "Logo"}
              className="h-10 w-auto object-contain"
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
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10 h-8 flex gap-2 items-center px-2">
                <Globe className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase">{i18n.language}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-primary border-primary-foreground/10 text-primary-foreground">
              <DropdownMenuItem onClick={() => changeLanguage('fr')} className="focus:bg-accent focus:text-accent-foreground text-xs gap-2">
                <span>🇫🇷</span> Français
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage('en')} className="focus:bg-accent focus:text-accent-foreground text-xs gap-2">
                <span>🇺🇸</span> English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage('rn')} className="focus:bg-accent focus:text-accent-foreground text-xs gap-2">
                <span>🇧🇮</span> Kirundi
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage('sw')} className="focus:bg-accent focus:text-accent-foreground text-xs gap-2">
                <span>🇹🇿</span> Swahili
              </DropdownMenuItem>
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
              <div className="flex flex-wrap gap-2 pt-2 border-t border-primary-foreground/10">
                <Button variant="ghost" size="sm" onClick={() => { changeLanguage('fr'); setMobileOpen(false); }} className={`h-10 px-3 flex gap-2 items-center text-primary-foreground rounded-lg ${i18n.language === 'fr' ? 'bg-accent text-accent-foreground' : 'hover:bg-primary-foreground/10'}`}>
                  <span className="text-xl">🇫🇷</span>
                  <span className="text-xs font-bold">FR</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { changeLanguage('rn'); setMobileOpen(false); }} className={`h-10 px-3 flex gap-2 items-center text-primary-foreground rounded-lg ${i18n.language === 'rn' ? 'bg-accent text-accent-foreground' : 'hover:bg-primary-foreground/10'}`}>
                  <span className="text-xl">🇧🇮</span>
                  <span className="text-xs font-bold">RN</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { changeLanguage('en'); setMobileOpen(false); }} className={`h-10 px-3 flex gap-2 items-center text-primary-foreground rounded-lg ${i18n.language === 'en' ? 'bg-accent text-accent-foreground' : 'hover:bg-primary-foreground/10'}`}>
                  <span className="text-xl">🇺🇸</span>
                  <span className="text-xs font-bold">EN</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { changeLanguage('sw'); setMobileOpen(false); }} className={`h-10 px-3 flex gap-2 items-center text-primary-foreground rounded-lg ${i18n.language === 'sw' ? 'bg-accent text-accent-foreground' : 'hover:bg-primary-foreground/10'}`}>
                  <span className="text-xl">🇹🇿</span>
                  <span className="text-xs font-bold">SW</span>
                </Button>
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
