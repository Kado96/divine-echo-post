import AdminLayout from "@/components/layouts/AdminLayout";
import {
    BookOpen,
    Users,
    Megaphone,
    FileText,
    Image as ImageIcon,
    BarChart3,
    Settings,
    ChevronRight,
    HelpCircle,
    Info,
    Layout
} from "lucide-react";
import { useTranslation } from "react-i18next";

const Guide = () => {
    const { t } = useTranslation();

    const sections = [
        {
            title: "Tableau de Bord",
            icon: Layout,
            content: "Le tableau de bord est votre centre de contrôle. Il affiche un résumé des statistiques vitales et vous donne des accès rapides aux actions les plus courantes comme la création de sermons ou l'ajout de membres."
        },
        {
            title: "Gestion des Sermons",
            icon: BookOpen,
            content: "C'est le cœur de votre site. Vous pouvez ajouter des sermons sous trois formats : Vidéo native, Audio native, ou Lien YouTube. N'oubliez pas de définir une image mise en avant pour un meilleur rendu visuel sur le site public."
        },
        {
            title: "Annonces & Communication",
            icon: Megaphone,
            content: "Utilisez les annonces pour informer votre communauté des événements à venir ou des messages importants. Les annonces à priorité 'Haute' apparaîtront de manière distinctive sur la page d'accueil."
        },
        {
            title: "Équipe & Pasteurs",
            icon: Users,
            content: "Gérez ici les profils des pasteurs et des administrateurs. Seuls les administrateurs ont accès à ce panneau, les pasteurs peuvent être créés pour apparaître comme auteurs de sermons sans pour autant avoir accès à l'administration complète."
        },
        {
            title: "Bibliothèque Média",
            icon: ImageIcon,
            content: "Tous vos fichiers (images, audio, documents) sont centralisés ici. Vous pouvez les réutiliser dans n'importe quel sermon ou page sans avoir à les renvoyer systématiquement."
        },
        {
            title: "Personnalisation des Pages",
            icon: FileText,
            content: "La section 'Pages' vous permet de modifier les textes descriptifs du site (Accueil, À propos, Contact) sans toucher au code. C'est ici que s'effectue la gestion multilingue du contenu fixe."
        }
    ];

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto space-y-8 pb-12">
                <header className="space-y-2">
                    <div className="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-wider text-xs">
                        <HelpCircle className="w-4 h-4" />
                        Guide d'Administration
                    </div>
                    <h1 className="text-3xl font-black text-[#1d2327]">Comment utiliser Shalom Ministry ?</h1>
                    <p className="text-gray-500 max-w-2xl leading-relaxed">
                        Ce guide vous explique comment gérer efficacement le contenu de votre site web pour offrir la meilleure expérience à votre communauté.
                    </p>
                </header>

                <div className="grid grid-cols-1 gap-6">
                    {sections.map((section, idx) => (
                        <div key={idx} className="bg-white p-6 sm:p-8 rounded-3xl border border-border shadow-sm flex gap-6 items-start group hover:border-blue-200 transition-colors">
                            <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <section.icon className="w-6 h-6" />
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-xl font-bold text-[#1d2327] flex items-center gap-2">
                                    {section.title}
                                    <ChevronRight className="w-4 h-4 text-gray-300" />
                                </h3>
                                <p className="text-gray-500 leading-relaxed text-sm sm:text-base">
                                    {section.content}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-amber-50 border border-amber-100 p-8 rounded-3xl flex flex-col sm:flex-row gap-6 items-center">
                    <div className="bg-amber-100 p-4 rounded-2xl text-amber-600">
                        <Info className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-lg font-bold text-amber-900">Conseil d'administration</h4>
                        <p className="text-amber-800/80 text-sm leading-relaxed italic">
                            "Maintenir votre site à jour régulièrement avec de nouveaux sermons et annonces est le meilleur moyen d'augmenter votre impact spirituel auprès de votre communauté en ligne."
                        </p>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-100 flex justify-between items-center">
                    <p className="text-xs text-gray-400 font-medium">Shalom Ministry v1.0 • Documentation Admin</p>
                    <div className="flex gap-4">
                        <button className="text-xs font-bold text-[#2271b1] hover:underline" onClick={() => window.print()}>Imprimer ce guide</button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Guide;
