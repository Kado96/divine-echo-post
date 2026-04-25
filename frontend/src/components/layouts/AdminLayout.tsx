import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
    LayoutDashboard,
    BookOpen,
    FolderTree,
    Image as ImageIcon,
    Settings,
    ExternalLink,
    ChevronRight,
    Users,
    FileText,
    Megaphone,
    MessageCircle,
    BarChart3,
    ChevronDown,
    Globe,
    X,
    Menu,
    User,
    LogOut
} from "lucide-react";
import { cn, getFullImageUrl } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const AdminLayout = ({ children }: { children: ReactNode }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/admin/login");
    };

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const allSidebarLinks = [
        { label: t("admin.dashboard"), href: "/admin", icon: LayoutDashboard },
        { label: t("admin.emissions"), href: "/admin/emissions", icon: BookOpen },
        { label: t("admin.announcements") || "Annonces", href: "/admin/announcements", icon: Megaphone },
        { label: t("admin.comments_page.title") || "Commentaires", href: "/admin/comments", icon: MessageCircle },
        { label: t("admin.testimonials") || "Témoignages", href: "/admin/testimonials", icon: MessageCircle },
        { label: t("admin.pages") || "Pages du site", href: "/admin/pages", icon: FileText },
        { label: t("admin.categories"), href: "/admin/categories", icon: FolderTree },
        { label: t("admin.media"), href: "/admin/media", icon: ImageIcon },
        { label: t("admin.stats_detailed") || "Statistiques", href: "/admin/stats", icon: BarChart3 },
        { label: t("admin.team_page.title") || "A propos de nous", href: "/admin/team", icon: Users },
        { label: t("admin.users") || "Utilisateurs", href: "/admin/users", icon: User },
        { label: t("admin.settings"), href: "/admin/settings", icon: Settings },
    ];

    const sidebarLinks = allSidebarLinks.filter(link => {
        const role = (user as any)?.role || "user";
        const isSuperuser = user?.is_superuser;

        if (isSuperuser) return true;

        switch (role) {
            case "admin":
                return true; // Admin voit tout, mais sera bloqué par le backend pour certaines actions
            case "team":
            default:
                // Éditeur : Accès à presque toutes les sections de gestion
                return ["/admin", "/admin/emissions", "/admin/announcements", "/admin/comments", "/admin/testimonials", "/admin/pages", "/admin/categories", "/admin/media", "/admin/stats", "/admin/team", "/admin/settings"].includes(link.href);
        }
    });

    return (
        <div className="flex min-h-screen bg-[#f0f0f1]">
            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[60] lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 w-[240px] bg-[#23282d] text-gray-300 transition-transform duration-300 ease-in-out z-[70] lg:relative lg:translate-x-0",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-4 mb-2 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-white hover:text-accent transition-colors">
                        <span className="font-bold text-xl tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>{t("admin.layout.admin_name")}</span>
                    </Link>
                    <button className="lg:hidden text-gray-400" onClick={() => setIsMobileMenuOpen(false)}>
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="flex-1 px-2 py-4">
                    <ul className="space-y-1">
                        {sidebarLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = location.pathname === link.href;

                            return (
                                <li key={link.href}>
                                    <Link
                                        to={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-2.5 text-sm transition-all relative group rounded-md font-medium",
                                            isActive
                                                ? "bg-[#2271b1] text-white shadow-md"
                                                : "hover:bg-[#191e23] hover:text-[#72aee6]"
                                        )}
                                    >
                                        <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-white" : "text-gray-400 group-hover:text-[#72aee6]")} />
                                        <span>{link.label}</span>
                                        {isActive && (
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                            </div>
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="p-4 m-2 rounded-lg bg-[#191e23]/50 border border-gray-700/50">
                    <a
                        href={`${import.meta.env.VITE_API_URL?.replace('/api', '')}/admin/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between text-[11px] text-gray-500 hover:text-white transition-colors uppercase font-bold tracking-widest"
                    >
                        <span>{t("admin.layout.system_link")}</span>
                        <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Navbar */}
                <header className="h-14 bg-white border-b border-border flex items-center justify-between px-4 sticky top-0 z-50">
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-md"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <div className="hidden sm:flex items-center gap-4">
                            <Link to="/" className="text-sm text-gray-600 hover:text-[#2271b1] flex items-center gap-1.5 font-medium">
                                🏠 {t("nav.view_site")}
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-gray-500 hover:bg-gray-100 h-8 w-8 p-0">
                                    <Globe className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white border border-border">
                                <DropdownMenuItem onClick={() => changeLanguage('fr')} className="text-xs focus:bg-[#2271b1] focus:text-white">Français</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => changeLanguage('en')} className="text-xs focus:bg-[#2271b1] focus:text-white">English</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => changeLanguage('rn')} className="text-xs focus:bg-[#2271b1] focus:text-white">Kirundi</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => changeLanguage('sw')} className="text-xs focus:bg-[#2271b1] focus:text-white">Swahili</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <div className="relative">
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-50 transition-colors"
                            >
                                <div className="hidden sm:block text-right">
                                    <p className="text-xs font-bold text-[#1d2327]">{user?.username || t("admin.layout.admin_name")}</p>
                                    <p className="text-[10px] text-green-500 font-bold uppercase tracking-tighter">{t("admin.layout.online")}</p>
                                </div>
                                <div className="w-8 h-8 bg-[#2271b1] rounded-full flex items-center justify-center text-white shadow-sm overflow-hidden border border-gray-100">
                                    {(user as any)?.photo_display || (user as any)?.photo ? (
                                        <img src={getFullImageUrl((user as any).photo_display || (user as any).photo)} alt="Profil" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-4 h-4" />
                                    )}
                                </div>
                                <ChevronDown className={cn("w-3 h-3 text-gray-400 transition-transform", isUserMenuOpen && "rotate-180")} />
                            </button>

                            {isUserMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-border shadow-xl rounded-lg py-1 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="px-4 py-2 border-b border-gray-50 mb-1 sm:hidden">
                                        <p className="text-xs font-bold text-[#1d2327]">{user?.username || t("admin.layout.admin_name")}</p>
                                    </div>
                                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-400" /> {t("admin.layout.user_profile")}
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                        <LogOut className="w-4 h-4" /> {t("admin.layout.logout")}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 md:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
