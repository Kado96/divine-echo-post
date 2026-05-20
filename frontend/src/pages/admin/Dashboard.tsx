import { useEffect, useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import {
    Users,
    BookOpen,
    MessageSquare,
    Plus,
    ExternalLink,
    Megaphone,
    Play,
    Loader2,
    TrendingUp
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/lib/api";

const AdminDashboard = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [stats, setStats] = useState({
        views: "0",
        emissions: 0,
        announcements: 0,
        testimonials: 0
    });
    const [loading, setLoading] = useState(true);

    const role = (user as any)?.role || "user";
    const isSuperuser = user?.is_superuser;
    const isAdmin = isSuperuser || role === "admin";

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Parallel fetching with conditional gating to avoid 403 errors
                const [globalData, ems, anns, tests] = await Promise.all([
                    isAdmin ? apiService.getGlobalStats().catch(() => ({ total_views: 0 })) : Promise.resolve({ total_views: 0 }),
                    apiService.getAdminEmissions().catch(() => []),
                    isAdmin ? apiService.getAdminAnnouncements().catch(() => []) : Promise.resolve([]),
                    apiService.getTestimonials().catch(() => [])
                ]);

                setStats({
                    views: globalData?.total_views?.toLocaleString() || "0",
                    emissions: ems?.length || 0,
                    announcements: anns?.length || 0,
                    testimonials: tests?.length || 0
                });
            } catch (error) {
                console.error("Dashboard stats error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [isAdmin]);

    // Quick Actions filtering
    const quickActions = [
        { label: t("admin.dashboard_page.quick_actions.new_emission"), icon: Plus, href: "/admin/emissions/create", color: "bg-blue-600" },
        { label: t("admin.dashboard_page.quick_actions.add_user"), icon: Users, href: "/admin/users/create", color: "bg-emerald-600", adminOnly: true },
        { label: t("admin.dashboard_page.quick_actions.view_site"), icon: ExternalLink, href: "/", color: "bg-orange-500" },
        { label: t("admin.dashboard_page.quick_actions.messages"), icon: MessageSquare, href: "/admin/testimonials", color: "bg-purple-600" },
    ].filter(action => !action.adminOnly || isAdmin);

    // Stats Overview filtering
    const statsOverview = [
        { id: "views", label: t("admin.dashboard_page.stats.total_views"), value: stats.views, icon: Play, color: "text-blue-600", adminOnly: true },
        { id: "emissions", label: t("admin.dashboard_page.stats.active_emissions"), value: stats.emissions.toString(), icon: BookOpen, color: "text-emerald-600" },
        { id: "announcements", label: t("admin.dashboard_page.stats.announcements"), value: stats.announcements.toString(), icon: Megaphone, color: "text-orange-600", adminOnly: true },
        { id: "impact", label: t("admin.dashboard_page.stats.impact"), value: stats.testimonials.toString(), icon: MessageSquare, color: "text-purple-600" },
    ].filter(stat => !stat.adminOnly || isAdmin);

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto space-y-8 pb-12">
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-[#1d2327] tracking-tight">{t("admin.dashboard_page.welcome")}</h1>
                        <p className="text-sm text-gray-500 font-medium">{t("admin.dashboard_page.subtitle")}</p>
                    </div>
                </header>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-[#2271b1]" />
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Quick Actions Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                            {quickActions.map((action, idx) => (
                                <Link
                                    key={idx}
                                    to={action.href}
                                    className={`${action.color} p-4 sm:p-6 rounded-2xl shadow-lg hover:scale-[1.03] transition-all group flex flex-col items-center sm:items-start text-white`}
                                >
                                    <div className="bg-white/20 p-2 sm:p-3 rounded-xl mb-3 sm:mb-4">
                                        <action.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </div>
                                    <span className="text-xs sm:text-sm font-black tracking-tight">{action.label}</span>
                                </Link>
                            ))}
                        </div>

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                {/* Statistics Section */}
                                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-border shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-black text-[#1d2327]">{t("admin.dashboard_page.overview")}</h3>
                                        {isAdmin && (
                                            <Link to="/admin/stats" className="text-[10px] font-black uppercase text-[#2271b1] hover:underline">
                                                {t("admin.dashboard_page.view_all")}
                                            </Link>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-y-8 gap-x-4">
                                        {statsOverview.map((stat, idx) => (
                                            <div key={idx} className="space-y-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                                                    <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</span>
                                                </div>
                                                <p className="text-xl sm:text-3xl font-black text-[#1d2327] tracking-tighter">{stat.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Recent Activity Placeholder Section */}
                                <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-border bg-gray-50/50 flex items-center justify-between">
                                        <h3 className="font-black text-sm text-[#1d2327]">{t("admin.dashboard_page.recent_activity")}</h3>
                                        <Link to="/admin/emissions" className="text-[10px] font-black uppercase text-[#2271b1] hover:underline">{t("admin.dashboard_page.view_all")}</Link>
                                    </div>
                                    <div className="divide-y divide-gray-50">
                                        {[1, 2, 3].map(i => {
                                            // Conditional link based on permissions
                                            const activityType = i === 1 ? 'emission' : i === 2 ? 'announcement' : 'testimonial';
                                            if (activityType === 'announcement' && !isAdmin) return null;

                                            const activityLink = activityType === 'emission' ? "/admin/emissions" : 
                                                               activityType === 'announcement' ? "/admin/announcements" : 
                                                               "/admin/testimonials";
                                            
                                            const activityLabel = activityType === 'emission' ? t("admin.dashboard_page.activity.new_emission") : 
                                                                activityType === 'announcement' ? t("admin.dashboard_page.activity.updated_announcement") : 
                                                                t("admin.dashboard_page.activity.new_testimonial");

                                            return (
                                                <Link key={i} to={activityLink} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                                                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                                                        {i}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs sm:text-sm font-bold text-gray-800">{activityLabel}</p>
                                                        <p className="text-[10px] text-gray-400">{t("common.hours_ago", { count: i * 2 })}</p>
                                                    </div>
                                                </Link>
                                            );
                                        }).filter(Boolean)}
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar Section */}
                            <div className="lg:col-span-1">
                                <div className="bg-[#23282d] text-white p-8 rounded-3xl shadow-xl h-full flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold mb-4">{t("admin.dashboard_page.help.title")}</h3>
                                        <p className="text-sm text-gray-400 leading-relaxed">
                                            {t("admin.dashboard_page.help.desc")}
                                        </p>
                                    </div>
                                    <div className="mt-8">
                                        <Link to="/admin/guide" className="block w-full">
                                            <button className="w-full bg-white text-[#23282d] py-3 rounded-xl font-black text-sm hover:bg-gray-100 transition-colors shadow-lg uppercase tracking-tight">
                                                {t("admin.dashboard_page.help.guide_btn")}
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
