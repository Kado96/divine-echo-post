import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiService } from "@/lib/api";
import { stripHtml } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { Megaphone, X } from "lucide-react";
import { createPortal } from "react-dom";

const NewsTicker = () => {
    const { t, i18n } = useTranslation();
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [settings, setSettings] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [announcementsData, settingsData] = await Promise.all([
                    apiService.getAnnouncements(),
                    apiService.getSettings()
                ]);
                const results = Array.isArray(announcementsData) ? announcementsData : (announcementsData.results || []);
                setAnnouncements(results.filter((a: any) => a.is_active));
                setSettings(settingsData);

                if (settingsData && settingsData.ticker_enabled === false) {
                    setIsVisible(false);
                }
            } catch (error) {
                console.error("Error fetching ticker data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        // Use refresh interval from settings (default 1h)
        const refreshMs = (settings?.ticker_refresh_interval || 3600) * 1000;
        const interval = setInterval(fetchData, refreshMs);
        return () => clearInterval(interval);
    }, [i18n.language, settings?.ticker_refresh_interval]);

    // If definitely disabled, show nothing
    if (!isVisible || (settings && settings.ticker_enabled === false)) return null;

    // Content to display
    const currentLang = i18n.language || 'fr';
    let tickerText = "";
    
    if (loading) {
        tickerText = "Chargement des actualités...";
    } else if (announcements.length === 0) {
        tickerText = settings?.site_name?.toUpperCase() || "SHALOM MINISTRY";
    } else {
        tickerText = announcements.map(a => {
            const title = a[`title_${currentLang}`] || a.title || "";
            const content = a[`content_${currentLang}`] || a.content || "";
            return `${stripHtml(title).toUpperCase()} : ${stripHtml(content)}`;
        }).join(" • ");
    }

    const duration = settings?.ticker_speed || 30;

    const hexToRgba = (hex: string, opacity: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
    };

    const bgColor = settings?.ticker_bg_color || "#e60000";
    const opacity = settings?.ticker_opacity ?? 100;
    const rgbaBg = hexToRgba(bgColor, opacity);

    return createPortal(
        <div
            id="global-news-ticker"
            style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                width: '100%',
                zIndex: 2147483647, // Max possible z-index
                backgroundColor: rgbaBg,
                borderTop: `1px solid ${bgColor}`,
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
                color: 'white',
                boxShadow: '0 -4px 15px rgba(0,0,0,0.5)',
                paddingBottom: 'env(safe-area-inset-bottom)',
                height: `calc(40px + env(safe-area-inset-bottom))`,
                pointerEvents: 'auto',
                WebkitTransform: 'translateZ(9999px)', // Force GPU acceleration and top layer
                transform: 'translateZ(9999px)'
            }}
        >
            {/* Label */}
            <div className="bg-[#1d2327] h-full px-3 flex items-center gap-2 font-black italic tracking-tighter text-[11px] sm:text-sm shrink-0 z-[100001]">
                <Megaphone className="w-3.5 h-3.5" style={{ color: bgColor }} />
                <span className="uppercase whitespace-nowrap">Info Shalom</span>
            </div>

            {/* Scrolling Content */}
            <div className="flex-1 overflow-hidden relative h-full flex items-center">
                <motion.div
                    className="whitespace-nowrap flex items-center gap-8 pl-4"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{
                        repeat: Infinity,
                        duration: tickerText.length > 50 ? duration : 15,
                        ease: "linear"
                    }}
                >
                    <span className="text-[12px] sm:text-sm font-bold uppercase tracking-wide flex items-center gap-8">
                        {tickerText}
                        <span className="w-2 h-2 rounded-full bg-white/50" />
                    </span>
                    <span className="text-[12px] sm:text-sm font-bold uppercase tracking-wide flex items-center gap-8">
                        {tickerText}
                        <span className="w-2 h-2 rounded-full bg-white/50" />
                    </span>
                </motion.div>
            </div>

            {/* Close */}
            <button
                onClick={() => setIsVisible(false)}
                className="bg-[#1d2327] h-full px-4 flex items-center justify-center hover:bg-gray-800 transition-colors shrink-0 z-[100001]"
            >
                <X className="w-4 h-4" />
            </button>
        </div>,
        document.body
    );
};

export default NewsTicker;
