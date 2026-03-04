import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import {
    Users,
    Play,
    TrendingUp,
    Globe,
    Clock,
    Monitor,
    Smartphone
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

const AdminStats = () => {
    const { t } = useTranslation();

    const mainStats = [
        { label: t("admin.stats_page.labels.views"), value: "125K", sub: t("admin.stats_page.labels.listeners"), icon: Play, color: "text-blue-600", bg: "bg-blue-50" },
        { label: t("admin.stats_page.labels.listeners_count"), value: "3.2K", sub: t("admin.stats_page.labels.live"), icon: Users, color: "text-green-600", bg: "bg-green-50" },
        { label: t("admin.stats_page.labels.impact_label"), value: t("admin.stats_page.labels.impact_high"), sub: t("admin.stats_page.labels.impact_sub"), icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
        { label: t("admin.stats_page.labels.time_label"), value: "24m", sub: t("admin.stats_page.labels.time_sub"), icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
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

                    {/* Simple Popular List */}
                    <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-border bg-gray-50/50">
                            <h3 className="font-bold text-[#1d2327]">{t("admin.stats_page.favorites.title")}</h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-[#2271b1]">Sermon {i}</p>
                                        <p className="text-[10px] text-gray-400">{t("admin.stats_page.favorites.listened_by")} {(10 / i).toFixed(1)}K {t("admin.stats_page.favorites.people")}</p>
                                    </div>
                                    <div className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Top {i}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminStats;
