import AdminLayout from "@/components/layouts/AdminLayout";
import {
    Users,
    Play,
    TrendingUp,
    Clock,
    Loader2
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { apiService } from "@/lib/api";
import { toast } from "sonner";

const AdminStats = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await apiService.getGlobalStats();
                setStats(data);
            } catch (error) {
                console.error("Error fetching stats:", error);
                toast.error("Erreur lors du chargement des statistiques");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading || !stats) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin text-[#2271b1]" />
                </div>
            </AdminLayout>
        );
    }

    const formatValue = (val: number) => {
        if (val >= 1000000) return (val / 1000000).toFixed(1) + "M";
        if (val >= 1000) return (val / 1000).toFixed(1) + "K";
        return val.toString();
    };

    const mainStats = [
        { 
            label: t("admin.stats_page.labels.views"), 
            value: formatValue(stats.total_views), 
            sub: t("admin.stats_page.labels.listeners"), 
            icon: Play, 
            color: "text-blue-600", 
            bg: "bg-blue-50" 
        },
        { 
            label: t("admin.stats_page.labels.listeners_count"), 
            value: formatValue(stats.active_listeners), 
            sub: t("admin.stats_page.labels.live"), 
            icon: Users, 
            color: "text-green-600", 
            bg: "bg-green-50" 
        },
        { 
            label: t("admin.stats_page.labels.impact_label"), 
            value: stats.impact_rate || "85%", 
            sub: t("admin.stats_page.labels.impact_sub"), 
            icon: TrendingUp, 
            color: "text-purple-600", 
            bg: "bg-purple-50" 
        },
        { 
            label: t("admin.stats_page.labels.time_label"), 
            value: stats.avg_time || "24m", 
            sub: t("admin.stats_page.labels.time_sub"), 
            icon: Clock, 
            color: "text-orange-600", 
            bg: "bg-orange-50" 
        },
    ];

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto space-y-8">
                <header>
                    <h1 className="text-2xl font-bold text-[#1d2327]">📊 {t("admin.stats_page.title")}</h1>
                    <p className="text-sm text-gray-500">{t("admin.stats_page.subtitle")}</p>
                </header>

                {/* Grid Header Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                    {mainStats.map((stat, idx) => (
                        <div key={idx} className="bg-white p-4 sm:p-6 border border-border rounded-xl shadow-sm">
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.bg} ${stat.color} flex items-center justify-center rounded-lg mb-4`}>
                                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                            <p className="text-xl sm:text-2xl font-black text-[#1d2327]">{stat.value}</p>
                            <p className="text-[10px] text-gray-500 mt-1">{stat.sub}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Audience by Country */}
                    <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden text-sm sm:text-base">
                        <div className="p-4 border-b border-border bg-gray-50/50">
                            <h3 className="font-bold text-[#1d2327]">{t("admin.stats_page.audience.title")}</h3>
                        </div>
                        <div className="p-5 space-y-5">
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs sm:text-sm">
                                    <span className="font-bold">{t("admin.stats_page.audience.burundi")}</span>
                                    <span className="text-gray-500">45%</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[45%]" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs sm:text-sm">
                                    <span className="font-bold">{t("admin.stats_page.audience.rwanda")}</span>
                                    <span className="text-gray-500">22%</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[22%]" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs sm:text-sm">
                                    <span className="font-bold">{t("admin.stats_page.audience.rest_of_world")}</span>
                                    <span className="text-gray-500">33%</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-gray-300 w-[33%]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Popular List from DB */}
                    <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-border bg-gray-50/50">
                            <h3 className="font-bold text-[#1d2327]">{t("admin.stats_page.favorites.title")}</h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {(stats.top_emissions || []).length > 0 ? (
                                (stats.top_emissions || []).map((emission: any, i: number) => (
                                    <div key={emission.id} className="p-4 flex items-center justify-between">
                                        <div className="flex-1 mr-4">
                                            <p className="text-sm font-bold text-[#2271b1] line-clamp-1">{emission.title}</p>
                                            <p className="text-[10px] text-gray-400 capitalize">
                                                {emission.category} • {formatValue(emission.views)} {t("admin.stats_page.favorites.people")}
                                            </p>
                                        </div>
                                        <div className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded whitespace-nowrap">
                                            Top {i + 1}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-gray-400 text-sm">
                                    Aucune donnée disponible
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminStats;
