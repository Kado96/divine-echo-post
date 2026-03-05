import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Grid, List, Search, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

// Mock media items
const mediaItems = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    url: `https://picsum.photos/seed/${i + 20}/300/300`,
    name: `image-${i + 1}.jpg`,
    type: "image/jpeg"
}));

const AdminMedia = () => {
    const { t } = useTranslation();

    return (
        <AdminLayout>
            <div className="max-w-6xl">
                <header className="flex items-center gap-4 mb-6">
                    <h1 className="text-2xl font-bold text-[#1d2327]">{t("admin.media_page.title")}</h1>
                    <Button size="sm" className="bg-white hover:bg-gray-50 border border-[#2271b1] text-[#2271b1] h-7 px-3 text-xs font-semibold">
                        {t("admin.media_page.add_btn")}
                    </Button>
                </header>

                {/* Media Toolbar - WP Style */}
                <div className="flex items-center justify-between mb-4 bg-white p-2 border border-border">
                    <div className="flex items-center gap-4">
                        <div className="flex border border-gray-300">
                            <button className="p-1.5 bg-gray-100 border-r border-gray-300"><Grid className="w-4 h-4 text-gray-700" /></button>
                            <button className="p-1.5 bg-white"><List className="w-4 h-4 text-gray-400" /></button>
                        </div>
                        <select id="media-select-1" name="media-select-1" className="text-xs border-border bg-white py-1 px-2 border outline-none">
                            <option>{t("admin.media_page.all_media")}</option>
                            <option>{t("admin.media_page.images")}</option>
                            <option>{t("admin.media_page.audio")}</option>
                            <option>{t("admin.media_page.video")}</option>
                        </select>
                        <select id="media-select-2" name="media-select-2" className="text-xs border-border bg-white py-1 px-2 border outline-none">
                            <option>{t("admin.media_page.all_dates")}</option>
                        </select>
                        <Button size="sm" variant="ghost" className="text-xs text-[#2271b1] p-0 h-auto hover:bg-transparent">{t("admin.media_page.bulk_select")}</Button>
                    </div>

                    <div className="relative">
                        <input id="media-input-3" name="media-input-3" type="text" placeholder={t("admin.media_page.search")} className="pl-8 pr-3 py-1 bg-white border border-border text-xs focus:ring-1 focus:ring-[#2271b1] outline-none w-48" />
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>

                {/* Media Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 bg-white border border-border p-2">
                    {mediaItems.map((item) => (
                        <div key={item.id} className="aspect-square relative group cursor-pointer border border-transparent hover:border-[#2271b1] overflow-hidden bg-gray-50">
                            <img src={item.url} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    ))}
                    {/* Add box */}
                    <div className="aspect-square border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-[#2271b1] hover:border-[#2271b1] cursor-pointer transition-colors">
                        <Plus className="w-6 h-6" />
                        <span className="text-[10px] font-bold uppercase">{t("admin.media_page.new")}</span>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminMedia;
