import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    fr: {
        translation: {
            nav: {
                home: "Accueil",
                emissions: "Émissions",
                about: "À propos",
                contact: "Contact",
                admin: "Administration",
                view_site: "Voir le site",
                create: "Nouveau",
                greetings: "Salutations"
            },
            common: {
                error_loading: "Erreur lors du chargement",
                sermon_not_found: "Sermon introuvable",
                back: "Retour",
                listen_audio: "Écouter l'audio",
                browser_audio_error: "Votre navigateur ne supporte pas la lecture audio.",
                browser_video_error: "Votre navigateur ne supporte pas la lecture vidéo.",
                download: "Télécharger",
                share: "Partager",
                media_not_available: "Média non disponible",
                general: "Général",
                default_preacher: "Prédicateur",
                listeners_count: "auditeurs",
                description: "Description",
                no_description: "Aucune description disponible.",
                share_this: "Partager cet enseignement",
                about_speaker: "À propos de l'orateur",
                ministry_role: "Enseignant de la Parole",
                join_us_teaching: "Rejoignez-nous pour cet enseignement profond alors que nous explorons la parole de Dieu ensemble.",
                info_events: "Infos & Événements",
                all_announcements: "Toutes les annonces",
                confirm_delete: "Voulez-vous vraiment supprimer cet élément ?",
                deleted_success: "Suppression réussie !",
                error_deleting: "Erreur lors de la suppression",
                loading: "Chargement...",
                no_results: "Aucun résultat trouvé",
                unknown_author: "Auteur inconnu",
                no_category: "Aucune catégorie",
                hours_ago: "Il y a {{count}} heures",
                days_ago: "Il y a {{count}} jours",
                weeks_ago: "Il y a {{count}} semaines",
                retry: "Réessayer",
                updated_success: "Mise à jour réussie !",
                error_updating: "Erreur lors de la mise à jour",
                no_data: "Aucune donnée disponible",
                edit_of: "Modification de",
                quick_edit_of: "Action rapide pour",
                delete_of: "Supprimer",
                view_of: "Voir",
                saved_success: "Enregistré avec succès !",
                error_saving: "Erreur lors de l'enregistrement",
                current_file: "Fichier actuel",
                reset: "Réinitialiser",
                new_selection: "Nouvelle sélection",
                title_required: "Le titre est obligatoire",
                published_success: "Publiée avec succès !",
                draft_saved: "Brouillon enregistré !",
                created_success: "Créé avec succès !"
            },
            admin: {
                dashboard: "Tableau de Bord",
                sermons: "Sermons",
                categories: "Catégories",
                media: "Médiathèque",
                users: "Équipe & Pasteurs",
                pages: "Pages",
                announcements: "Annonces",
                testimonials: "Témoignages",
                stats_detailed: "Statistiques",
                settings: "Paramètres",
                quick_draft: "Brouillon Rapide",
                layout: {
                    user_profile: "Mon Profil",
                    logout: "Déconnexion",
                    online: "En ligne",
                    system_link: "Système Django",
                    admin_name: "Admin Shalom"
                },
                stats: {
                    views: "Vues Totales",
                    published: "Sermons Publiés",
                    listeners: "Auditeurs Actuels",
                    comments: "Commentaires",
                    weekly_growth: "Croissance Hebdo",
                    avg_duration: "Durée Moyenne",
                    top_countries: "Top Pays"
                },
                dashboard_page: {
                    welcome: "Bienvenue, Admin ! 👋",
                    subtitle: "Voici ce qui se passe sur votre plateforme Shalom aujourd'hui.",
                    quick_actions: {
                        new_sermon: "Nouveau Sermon",
                        add_user: "Ajouter Pasteur",
                        view_site: "Voir le Site",
                        messages: "Messages"
                    },
                    overview: "Vue d'Ensemble 📈",
                    stats: {
                        total_views: "Vues Totales",
                        active_sermons: "Sermons Actifs",
                        announcements: "Annonces",
                        impact: "Impact Médias"
                    },
                    recent_activity: "Activité Récente",
                    view_all: "Voir tout",
                    activity: {
                        new_sermon: "Nouveau sermon publié",
                        updated_announcement: "Annonce mise à jour",
                        new_testimonial: "Nouveau témoignage reçu"
                    },
                    help: {
                        title: "Besoin d'aide ? 🤝",
                        desc: "Si vous rencontrez des difficultés pour gérer vos sermons ou annonces, notre équipe est là pour vous.",
                        guide_btn: "Lire le GUIDE",
                        support_btn: "Contacter le support"
                    }
                },
                announcements_page: {
                    title: "Gestion des Annonces",
                    desc: "Gérez les informations importantes pour vos fidèles",
                    add_btn: "Nouvelle Annonce",
                    filters: {
                        all: "Toutes",
                        online: "En ligne",
                        drafts: "Brouillons",
                        search_placeholder: "Chercher une annonce..."
                    },
                    item: {
                        priority_high: "Haute",
                        priority_normal: "Normale",
                        event_date: "Date d'événement :",
                        status: "Statut :"
                    }
                },
                categories_page: {
                    title: "Gestion des Catégories",
                    add_new: "Ajouter une nouvelle catégorie",
                    name: "Nom",
                    name_help: "Le nom tel qu'il apparaîtra sur votre site.",
                    slug: "Identifiant (Slug)",
                    slug_help: "L'adresse URL de la catégorie.",
                    description: "Description",
                    desc_help: "La description n'est pas souvent affichée.",
                    add_btn: "Ajouter la catégorie",
                    search: "Chercher une catégorie",
                    search_btn: "Rechercher",
                    table: {
                        name: "Nom",
                        slug: "Identifiant",
                        total: "Total Sermons",
                        modify: "Modifier",
                        quick_edit: "Actions",
                        delete: "Supprimer",
                        show: "Afficher"
                    },
                    edit_title: "Modifier la catégorie",
                    manage: "Gérer"
                },
                sermons_page: {
                    title: "Gestion des Sermons",
                    desc: "Gérez vos enseignements audio, vidéo et liens YouTube",
                    create_title: "Nouveau Sermon",
                    search_placeholder: "Rechercher par titre, auteur...",
                    form: {
                        title: "Titre du sermon",
                        content: "Description / Versets clés",
                        type: "Type de média",
                        type_video: "Vidéo (Fichier)",
                        type_audio: "Audio (Fichier)",
                        type_youtube: "Lien YouTube",
                        url: "URL YouTube",
                        url_placeholder: "Collez le lien YouTube ici...",
                        file: "Fichier média",
                        file_help: "MP4, MOV, MP3 (Max 500MB)",
                        publish: "Publier officiellement",
                        visibility: "Visibilité",
                        status: "Statut",
                        category: "Catégories",
                        add_category: "+ Ajouter catégorie",
                        author: "Auteur / Pasteur",
                        author_placeholder: "Nom du pasteur",
                        save_draft: "Enregistrer brouillon",
                        trash: "Mettre à la corbeille",
                        featured_image: "Image de couverture",
                        set_featured_image: "Définir l'image",
                        schedule: "Publier maintenant",
                        update: "Mettre à jour",
                        status_scheduled: "Planifié",
                        image: "Image de couverture",
                        video_link_or_file: "Lien ou Fichier Vidéo",
                        youtube_detected: "YouTube détecté",
                        video_url_help: "URL Vidéo (YouTube ou direct)",
                        local_file: "Fichier local",
                        change_image: "Changer l'image",
                        click_to_add_image: "Cliquez pour ajouter une photo",
                        recommended_format: "Format recommandé : 1920x1080px (16:9)",
                        state_label: "État :"
                    },
                    table: {
                        title: "Titre",
                        author: "Auteur",
                        categories: "Catégories",
                        tags: "Étiquettes",
                        status: "Statut",
                        date: "Date",
                        status_published: "Publié",
                        status_draft: "Brouillon"
                    }
                },
                pages_page: {
                    title: "Gestion des Pages",
                    desc: "Personnalisez l'affichage et le contenu des sections de votre site Shalom Ministry.",
                    search_placeholder: "Rechercher une section...",
                    modify_btn: "Modifier le contenu",
                    update_banner: "Modifications en temps réel !",
                    update_banner_desc: "Toutes les modifications enregistrées ici sont immédiatement visibles sur le site public.",
                    sections: {
                        hero: "Bannière d'accueil",
                        header: "EN-TÊTE / HERO",
                        about: "À propos de nous",
                        content: "CONTENU PRINCIPAL",
                        featured: "Émissions en vedette",
                        categories: "Section Catégories",
                        announcements: "Section Annonces",
                        testimonials: "Section Témoignages",
                        contact: "Contactez-nous",
                        footer_nav: "NAVIGATION BAS DE PAGE",
                        footer: "Bas de page / Footer",
                        structure: "STRUCTURE DU SITE"
                    },
                    edit_subtitle: "Modifiez les textes et médias de cette section pour qu'ils s'adaptent à vos besoins.",
                    form: {
                        subtitle: "Sous-titre / Badge",
                        main_title: "Titre principal",
                        description: "Description / Contenu",
                        save_note: "N'oubliez pas d'enregistrer vos modifications pour qu'elles soient appliquées sur le site."
                    }
                },
                users_page: {
                    title: "Équipe & Pasteurs",
                    desc: "Gérez les administrateurs et contributeurs",
                    add_btn: "Ajouter un membre",
                    search_placeholder: "Chercher par nom ou email...",
                    create_title: "Ajouter un nouvel utilisateur",
                    form: {
                        username: "Identifiant de connexion",
                        email: "Adresse Email",
                        first_name: "Prénom",
                        last_name: "Nom de famille",
                        website: "Site Web",
                        send_notification: "Envoyer email de bienvenue",
                        role: "Rôle",
                        role_pastor: "Pasteur / Auteur",
                        role_admin: "Administrateur",
                        submit: "Ajouter l'utilisateur"
                    }
                },
                media_page: {
                    title: "Médiathèque",
                    add_btn: "Ajouter un fichier",
                    all_media: "Tous les fichiers",
                    images: "Images",
                    audio: "Audios",
                    video: "Vidéos",
                    all_dates: "Toutes les dates",
                    bulk_select: "Sélection groupée",
                    search: "Chercher dans les médias...",
                    new: "Ajouter"
                },
                stats_page: {
                    title: "Analyses de l'Audience",
                    subtitle: "Comprenez l'impact de vos sermons en un coup d'œil",
                    labels: {
                        views: "Vues totales",
                        listeners: "+5% ce mois",
                        impact_label: "Taux d'impact",
                        impact_sub: "Fidélité forte",
                        time_label: "Temps moyen",
                        time_sub: "Par auditeur",
                        listeners_count: "Auditeurs",
                        live: "En ce moment"
                    },
                    audience: {
                        title: "D'où vient votre audience ?",
                        rest_of_world: "Reste du monde"
                    },
                    favorites: {
                        title: "Sermons les plus écoutés",
                        listened_by: "Écouté par",
                        people: "personnes"
                    }
                },
                testimonials_page: {
                    title: "Gestion des Témoignages",
                    desc: "Affichez les messages de foi de votre communauté",
                    add_btn: "Nouveau Témoignage",
                    filters: {
                        all: "Tous",
                        to_verify: "À vérifier",
                        published: "Publiés"
                    },
                    item: {
                        verified: "Vérifié",
                        ago: "il y a",
                        mark_as_pending: "Marquer comme en attente",
                        mark_as_verified: "Approuver ce témoignage"
                    },
                    create_title: "Ajouter un témoignage",
                    back: "Retour aux témoignages",
                    form: {
                        author: "Nom de la personne",
                        placeholder_author: "Ex: Frère David...",
                        rating: "Note (1 à 5 étoiles)",
                        rating_excellent: "Excellent",
                        rating_very_good: "Très bien",
                        rating_good: "Bien",
                        content: "Le Témoignage",
                        placeholder_content: "Ce que Dieu a fait...",
                        verify: "Marquer comme vérifié immédiatement",
                        submit: "Enregistrer le témoignage",
                        info_star: "Les témoignages sont un puissant moyen d'encourager la foi des autres membres."
                    }
                },
                settings_page: {
                    title: "Réglages Généraux",
                    site_lang: "Langue du Site",
                    lang_help: "Sélectionnez la langue par défaut du portail.",
                    site_title: "Titre du Site",
                    site_title_val: "Shalom Ministry",
                    slogan: "Slogan / Devise",
                    slogan_val: "Une Parole qui transforme",
                    slogan_help: "Affiché après le titre dans le navigateur.",
                    save: "Enregistrer les modifications",
                    form: {
                        emissions: "Nom de l'onglet Sermons",
                        teachings: "Nom de l'onglet Cours",
                        meditation: "Nom de l'onglet Méditation"
                    }
                }
            },
            hero: {
                subtitle: "Shalom Ministry",
                title: "Vivez une Transformation Divine par la Parole",
                description: "Un ministère chrétien dédié à la guérison intérieure, à la méditation profonde, aux enseignements bibliques et à la croissance spirituelle.",
                cta_primary: "Écouter maintenant",
                cta_secondary: "Découvrir le ministère",
                stats: {
                    emissions: "Émissions",
                    listeners: "Auditeurs",
                    categories: "Thématiques"
                }
            },
            categories: {
                all: "Toutes les catégories",
                title: "Explorer",
                title_accent: "Nos thématiques",
                desc: "Plongez dans nos différents thèmes pour nourrir votre marche spirituelle quotidienne.",
                search_label: "RECHERCHE",
                search_placeholder: "Choisir un thème",
                nav_label: "NAVIGATION",
                search: "Chercher un sermon...",
                view_emission: "Voir l'émission",
                items: {
                    "Famille": "Famille",
                    "Musique": "Musique",
                    "Prière": "Prière",
                    "Théologie": "Théologie",
                    "Études bibliques": "Études bibliques",
                    "Adoration": "Adoration",
                    "Leadership": "Leadership",
                    "Général": "Général"
                }
            },
            recent: {
                subtitle: "Dernières publications",
                title: "Enseignements",
                title_accent: "récents",
                description: "Découvrez nos derniers messages et enseignements pour grandir chaque jour.",
                new: "Nouveau",
                loading: "Chargement des sermons...",
                empty: "Aucun sermon n'a été trouvé pour le moment."
            },
            about: {
                history_badge: "Notre Histoire",
                title: "À propos de",
                title_accent: "Shalom Ministry",
                description: "Shalom Ministry est né d'une vision profonde : apporter la guérison et le renouveau par la Parole de Dieu.",
                feature1: "Enseignement Biblique",
                feature2: "Guérison du Cœur",
                feature3: "Éveil Spirituel",
                btn: "Nos Engagements",
                stats_label: "Années de service",
                quote: "La Parole de Dieu n'est pas seulement un récit, c'est une puissance qui recrée l'âme et aligne l'esprit.",
                pastor_title: "Pasteur Principal",
                team_title: "Notre Équipe",
                team_desc: "Une équipe dévouée au service du Royaume pour vous accompagner dans votre parcours chrétien."
            },
            contact: {
                badge: "Nous contacter",
                title: "Restons en",
                title_accent: "Contact",
                description: "Une question, un besoin de prière ou simplement envie de saluer ? Notre équipe est à votre écoute.",
                info: {
                    email: "E-mail",
                    phone: "Téléphone",
                    address: "Adresse",
                    hours: "Horaires",
                    hours_value: "Lun - Ven : 08:00 - 18:00"
                },
                follow: "Suivez-nous",
                form_title: "Envoyez-nous un message",
                form: {
                    name: "Nom complet",
                    name_placeholder: "Votre nom...",
                    email: "E-mail",
                    email_placeholder: "vous@exemple.com",
                    subject: "Sujet de votre message",
                    subject_placeholder: "De quoi souhaitez-vous parler ?",
                    message: "Votre message",
                    message_placeholder: "Comment pouvons-nous vous aider ?",
                    submit: "Envoyer le message"
                }
            },
            footer: {
                quick_links: "Liens Rapides",
                follow: "Réseaux Sociaux",
                media_not_available: "Média non disponible",
                description: "Description",
                no_description: "Aucune description disponible.",
                share_this: "Partager cet enseignement",
                about_speaker: "À propos de l'orateur",
                general: "Général",
                back: "Retour",
                sermon_not_found: "Sermon introuvable",
                browser_video_error: "Votre navigateur ne supporte pas la lecture de vidéos.",
                browser_audio_error: "Votre navigateur ne supporte pas la lecture audio.",
                default_preacher: "Prédicateur",
                listeners_count: "auditeurs",
                ministry_role: "Enseignant de la Parole",
                join_us_teaching: "Rejoignez-nous pour cet enseignement profond alors que nous explorons la parole de Dieu ensemble.",
                info_events: "Infos & Événements",
                all_announcements: "Toutes les annonces"
            },
            home_testimonials: {
                badge: "TÉMOIGNAGES",
                title: "Ce qu'ils disent de",
                title_accent: "notre ministère",
                description: "Découvrez comment Shalom Ministry transforme des vies à travers la Parole."
            }
        }
    },
    en: {
        translation: {
            nav: {
                home: "Home",
                emissions: "Broadcasting",
                about: "About Us",
                contact: "Contact",
                admin: "Admin",
                view_site: "View site",
                create: "New",
                greetings: "Greetings"
            },
            common: {
                error_loading: "Error loading content",
                sermon_not_found: "Sermon not found",
                back: "Back",
                listen_audio: "Listen to audio",
                browser_audio_error: "Your browser does not support audio playback.",
                browser_video_error: "Your browser does not support video playback.",
                download: "Download",
                share: "Share",
                media_not_available: "Media not available",
                general: "General",
                default_preacher: "Preacher",
                listeners_count: "listeners",
                description: "Description",
                no_description: "No description available.",
                share_this: "Share this teaching",
                about_speaker: "About speaker",
                ministry_role: "Word Teacher",
                join_us_teaching: "Join us for this deep teaching as we explore God's word together.",
                info_events: "News & Events",
                all_announcements: "All announcements",
                confirm_delete: "Are you sure you want to delete this item?",
                deleted_success: "Successfully deleted!",
                error_deleting: "Error while deleting",
                loading: "Loading...",
                no_results: "No results found",
                unknown_author: "Unknown author",
                no_category: "No category",
                hours_ago: "{{count}} hours ago",
                days_ago: "{{count}} days ago",
                weeks_ago: "{{count}} weeks ago",
                retry: "Retry",
                updated_success: "Successfully updated!",
                error_updating: "Error while updating",
                no_data: "No data available",
                edit_of: "Editing",
                quick_edit_of: "Quick action for",
                delete_of: "Delete",
                view_of: "View",
                saved_success: "Saved successfully!",
                error_saving: "Error while saving",
                current_file: "Current file",
                reset: "Reset",
                new_selection: "New selection",
                title_required: "Title is required",
                published_success: "Successfully published!",
                draft_saved: "Draft saved!",
                created_success: "Successfully created!"
            },
            admin: {
                dashboard: "Dashboard",
                sermons: "Sermons",
                categories: "Categories",
                media: "Media",
                users: "Team & Pastors",
                pages: "Pages",
                announcements: "Announcements",
                testimonials: "Testimonials",
                stats_detailed: "Analytics",
                settings: "Settings",
                quick_draft: "Quick Draft",
                layout: {
                    user_profile: "My Profile",
                    logout: "Logout",
                    online: "Online",
                    system_link: "Django System",
                    admin_name: "Admin Shalom"
                },
                stats: {
                    views: "Total Views",
                    published: "Published",
                    listeners: "Active Listeners",
                    comments: "Comments",
                    weekly_growth: "Weekly growth",
                    avg_duration: "Average time",
                    top_countries: "Top Countries"
                },
                dashboard_page: {
                    welcome: "Welcome, Admin! 👋",
                    subtitle: "Here's what's happening on your Shalom portal today.",
                    quick_actions: {
                        new_sermon: "New Sermon",
                        add_user: "Add Pastor",
                        view_site: "View Site",
                        messages: "Messages"
                    },
                    overview: "Overview 📈",
                    stats: {
                        total_views: "Total Views",
                        active_sermons: "Active Sermons",
                        announcements: "Announcements",
                        impact: "Impact Level"
                    },
                    recent_activity: "Recent Activity",
                    view_all: "View all",
                    activity: {
                        new_sermon: "New sermon published",
                        updated_announcement: "Announcement updated",
                        new_testimonial: "New testimonial received"
                    },
                    help: {
                        title: "Need help? 🤝",
                        desc: "If you have trouble managing your sermons or announcements, our team is here to help.",
                        guide_btn: "Read the GUIDE",
                        support_btn: "Contact support"
                    }
                },
                announcements_page: {
                    title: "Announcements",
                    desc: "Manage important news for your followers",
                    add_btn: "New Announcement",
                    filters: {
                        all: "All",
                        online: "Online",
                        drafts: "Drafts",
                        search_placeholder: "Search announcement..."
                    },
                    item: {
                        priority_high: "High",
                        priority_normal: "Normal",
                        event_date: "Event date:",
                        status: "Status:"
                    }
                },
                categories_page: {
                    title: "Categories Management",
                    add_new: "Add new category",
                    name: "Name",
                    name_help: "The name as it will appear on your site.",
                    slug: "Slug",
                    slug_help: "The category's URL address.",
                    description: "Description",
                    desc_help: "Descriptions are not often displayed.",
                    add_btn: "Add category",
                    search: "Search category",
                    search_btn: "Search",
                    table: {
                        name: "Name",
                        slug: "Slug",
                        total: "Total Sermons",
                        modify: "Edit",
                        quick_edit: "Actions",
                        delete: "Delete",
                        show: "Show"
                    },
                    edit_title: "Edit Category",
                    manage: "Manage"
                },
                sermons_page: {
                    title: "Sermons Management",
                    desc: "Manage your audio, video and YouTube teachings",
                    create_title: "New Sermon",
                    search_placeholder: "Search by title, author...",
                    form: {
                        title: "Sermon title",
                        content: "Description / Key Verses",
                        type: "Media Type",
                        type_video: "Video (File)",
                        type_audio: "Audio (File)",
                        type_youtube: "YouTube Link",
                        url: "YouTube URL",
                        url_placeholder: "Paste YouTube link here...",
                        file: "Media file",
                        file_help: "MP4, MOV, MP3 (Max 500MB)",
                        publish: "Publish officially",
                        visibility: "Visibility",
                        status: "Status",
                        category: "Categories",
                        add_category: "+ Add category",
                        author: "Author / Pastor",
                        author_placeholder: "Pastor name",
                        save_draft: "Save draft",
                        trash: "Move to trash",
                        featured_image: "Cover image",
                        set_featured_image: "Set image",
                        schedule: "Publish now",
                        update: "Update",
                        status_scheduled: "Scheduled",
                        image: "Cover image",
                        video_link_or_file: "Link or Video File",
                        youtube_detected: "YouTube detected",
                        video_url_help: "Video URL (YouTube or direct)",
                        local_file: "Local file",
                        change_image: "Change image",
                        click_to_add_image: "Click to add a photo",
                        recommended_format: "Recommended format: 1920x1080px (16:9)",
                        state_label: "State:"
                    },
                    table: {
                        title: "Title",
                        author: "Author",
                        categories: "Categories",
                        tags: "Tags",
                        status: "Status",
                        date: "Date",
                        status_published: "Published",
                        status_draft: "Draft"
                    }
                },
                pages_page: {
                    title: "Pages Management",
                    desc: "Customize the display and content of your Shalom Ministry site sections.",
                    search_placeholder: "Search for a section...",
                    modify_btn: "Modify content",
                    update_banner: "Real-time updates!",
                    update_banner_desc: "All changes saved here are immediately visible on the public site.",
                    sections: {
                        hero: "Welcome Banner",
                        header: "HEADER / HERO",
                        about: "About Us",
                        content: "MAIN CONTENT",
                        featured: "Featured Broadcasts",
                        categories: "Categories Section",
                        announcements: "Announcements Section",
                        testimonials: "Testimonials Section",
                        contact: "Contact Us",
                        footer_nav: "FOOTER NAVIGATION",
                        footer: "Footer Bottom",
                        structure: "SITE STRUCTURE"
                    },
                    edit_subtitle: "Modify texts and media of this section to fit your needs.",
                    form: {
                        subtitle: "Subtitle / Badge",
                        main_title: "Main Title",
                        description: "Description / Content",
                        save_note: "Don't forget to save your changes to apply them to the site."
                    }
                },
                users_page: {
                    title: "Team & Pastors",
                    desc: "Manage administrators and contributors",
                    add_btn: "Add Team Member",
                    search_placeholder: "Search by name or email...",
                    create_title: "Add New User",
                    form: {
                        username: "Username",
                        email: "Email Address",
                        first_name: "First Name",
                        last_name: "Last Name",
                        website: "Website",
                        send_notification: "Send welcome email",
                        role: "Role",
                        role_pastor: "Pastor / Author",
                        role_admin: "Administrator",
                        submit: "Add New User"
                    }
                },
                media_page: {
                    title: "Media Library",
                    add_btn: "Add file",
                    all_media: "All media",
                    images: "Images",
                    audio: "Audio",
                    video: "Video",
                    all_dates: "All dates",
                    bulk_select: "Bulk Select",
                    search: "Search media...",
                    new: "Add"
                },
                stats_page: {
                    title: "Audience Analytics",
                    subtitle: "Understand the impact of your sermons at a glance",
                    labels: {
                        views: "Total views",
                        listeners: "+5% this month",
                        impact_label: "Impact Rate",
                        impact_sub: "Strong Engagement",
                        time_label: "Average time",
                        time_sub: "Per listener",
                        listeners_count: "Listeners",
                        live: "Live Now"
                    },
                    audience: {
                        title: "Where is your audience from?",
                        rest_of_world: "Rest of the world"
                    },
                    favorites: {
                        title: "Most Listened Sermons",
                        listened_by: "Listened by",
                        people: "people"
                    }
                },
                testimonials_page: {
                    title: "Testimonials Management",
                    desc: "Display faith messages from your community",
                    add_btn: "New Testimonial",
                    filters: {
                        all: "All",
                        to_verify: "To verify",
                        published: "Published"
                    },
                    item: {
                        verified: "Verified",
                        ago: "ago",
                        mark_as_pending: "Mark as pending",
                        mark_as_verified: "Approve this testimonial"
                    },
                    create_title: "Add Testimonial",
                    back: "Back to testimonials",
                    form: {
                        author: "Person's Name",
                        placeholder_author: "Ex: Brother David...",
                        rating: "Rating (1 to 5 stars)",
                        rating_excellent: "Excellent",
                        rating_very_good: "Very good",
                        rating_good: "Good",
                        content: "The Testimonial",
                        placeholder_content: "What God has done...",
                        verify: "Mark as verified immediately",
                        submit: "Save testimonial",
                        info_star: "Testimonials are a powerful way to encourage the faith of other members."
                    }
                },
                settings_page: {
                    title: "General Settings",
                    site_lang: "Site Language",
                    lang_help: "Select the site's default language.",
                    site_title: "Site Title",
                    site_title_val: "Shalom Ministry",
                    slogan: "Slogan / Motto",
                    slogan_val: "A Word that transforms",
                    slogan_help: "Displayed after the title in the browser.",
                    save: "Save changes",
                    form: {
                        emissions: "Broadcasting Tab Name",
                        teachings: "Teachings Tab Name",
                        meditation: "Meditation Tab Name"
                    }
                }
            },
            hero: {
                subtitle: "Shalom Ministry",
                title: "Experience Divine Transformation Through the Word",
                description: "A Christian ministry dedicated to inner healing, deep meditation, biblical teachings, and spiritual growth.",
                cta_primary: "Listen now",
                cta_secondary: "Discover more",
                stats: {
                    emissions: "Broadcasting",
                    listeners: "Listeners",
                    categories: "Thématiques"
                }
            },
            categories: {
                all: "All categories",
                title: "Explore",
                title_accent: "Our themes",
                desc: "Deep dive into our various themes to nourish your daily spiritual journey.",
                search_label: "SEARCH",
                search_placeholder: "Choose a theme",
                nav_label: "NAVIGATION",
                search: "Search a sermon...",
                view_emission: "View broadcast",
                items: {
                    "Famille": "Family",
                    "Musique": "Music",
                    "Prière": "Prayer",
                    "Théologie": "Theology",
                    "Études bibliques": "Bible Studies",
                    "Adoration": "Worship",
                    "Leadership": "Leadership",
                    "Général": "General"
                }
            },
            recent: {
                subtitle: "Latest publications",
                title: "Recent",
                title_accent: "Teachings",
                description: "Discover our latest messages and teachings to grow every day.",
                new: "New",
                loading: "Loading sermons...",
                empty: "No sermon was found at the moment."
            },
            about: {
                history_badge: "Our History",
                title: "About",
                title_accent: "Shalom Ministry",
                description: "Shalom Ministry was born from a deep vision: to bring healing and renewal through the Word of God.",
                feature1: "Biblical Teaching",
                feature2: "Heart Healing",
                feature3: "Spiritual Awakening",
                btn: "Our Commitments",
                stats_label: "Years of Service",
                quote: "The Word of God is not just a story, it is a power that recreates the soul and aligns the spirit.",
                pastor_title: "Senior Pastor",
                team_title: "Our Team",
                team_desc: "A team dedicated to serving the Kingdom to accompany you in your Christian journey."
            },
            contact: {
                badge: "Contact us",
                title: "Keep in",
                title_accent: "Touch",
                description: "A question, a prayer need, or just want to say hello? Our team is listening to you.",
                info: {
                    email: "Email",
                    phone: "Phone",
                    address: "Address",
                    hours: "Hours",
                    hours_value: "Mon - Fri: 08:00 - 18:00"
                },
                follow: "Follow us",
                form_title: "Send us a message",
                form: {
                    name: "Full name",
                    name_placeholder: "Your name...",
                    email: "Email",
                    email_placeholder: "you@example.com",
                    subject: "Message subject",
                    subject_placeholder: "What would you like to talk about?",
                    message: "Your message",
                    message_placeholder: "How can we help you?",
                    submit: "Send Message"
                }
            },
            footer: {
                quick_links: "Quick Links",
                follow: "Social Media",
                media_not_available: "Media not available",
                description: "Description",
                no_description: "No description available.",
                share_this: "Share this teaching",
                about_speaker: "About speaker",
                general: "General",
                back: "Back",
                sermon_not_found: "Sermon not found",
                browser_video_error: "Your browser does not support video playback.",
                browser_audio_error: "Your browser does not support audio playback.",
                default_preacher: "Preacher",
                listeners_count: "listeners",
                ministry_role: "Word Teacher",
                join_us_teaching: "Join us for this deep teaching as we explore God's word together.",
                info_events: "News & Events",
                all_announcements: "All announcements"
            },
            home_testimonials: {
                badge: "TESTIMONIALS",
                title: "What they say about",
                title_accent: "our ministry",
                description: "Discover how Shalom Ministry transforms lives through the Word."
            }
        }
    },
    rn: {
        translation: {
            nav: {
                home: "Ahabanza",
                emissions: "Inyigisho",
                about: "Ibitwerekeye",
                contact: "Twandikire",
                admin: "Ubuyobozi",
                view_site: "Raba urubuga",
                create: "Ongerako",
                greetings: "Mwaramutse"
            },
            common: {
                error_loading: "Kuvura ibirimo vyunze",
                sermon_not_found: "Inyigisho ntibonetse",
                back: "Subira inyuma",
                listen_audio: "Umviriza ijwi",
                browser_audio_error: "Urubuga rwanyu ntirushobora kwerekana ijwi.",
                browser_video_error: "Urubuga rwanyu ntirushobora kwerekana videwo.",
                download: "Fata",
                share: "Sangiza",
                media_not_available: "Ibikoresho ntibihari",
                general: "Rusange",
                default_preacher: "Umupasitori",
                listeners_count: "abayumviriza",
                description: "Insiguro",
                no_description: "Nta nsiguro ihari.",
                share_this: "Sangiza abandi iyi nyigisho",
                about_speaker: "Ibitwerekeye umupasitori",
                ministry_role: "Umwigisha w'Ubutumwa",
                join_us_teaching: "Twifatanye muri iyi nyigisho yimbitse mu gihe dusuzuma ijambo ry'Imana hamwe.",
                info_events: "Amakuru & Ibirori",
                all_announcements: "Amakuru yose",
                confirm_delete: "Woba wizeye ko wipfuza gusiba iki kintu?",
                deleted_success: "Bisibishijwe neza !",
                error_deleting: "Habaye ikibazo mu gusiba",
                loading: "Biriko biraza...",
                no_results: "Nta nsiguro yaboneka",
                unknown_author: "Uwavyanditse ntimuzwi",
                no_category: "Nta muce urimwo",
                hours_ago: "Haraciye amasaha {{count}}",
                days_ago: "Haraciye imisi {{count}}",
                weeks_ago: "Haraciye ibiyumweru {{count}}",
                retry: "Subiramwo",
                updated_success: "Hinyanyuwe neza !",
                error_updating: "Habaye ikibazo mu guhinyanyura",
                no_data: "Nta makuru ahari",
                edit_of: "Guhinyanyura",
                quick_edit_of: "Action yihuta kuri",
                delete_of: "Gusiba",
                view_of: "Raba",
                saved_success: "Vyafashwe neza !",
                error_saving: "Habaye ikibazo mu gufata",
                current_file: "Igikoresho gihari",
                reset: "Kuvugura",
                new_selection: "Ico wahisemwo gishasha",
                title_required: "Umutwe urakenewe",
                published_success: "Vyashizweko neza !",
                draft_saved: "Ikandiko ryafashwe !",
                created_success: "Vyaremwe neza !"
            },
            admin: {
                dashboard: "Ikibanza",
                sermons: "Inyigisho",
                categories: "Imice",
                media: "Ibikoresho",
                users: "Abakozi n'Abapasitori",
                pages: "Amadohote",
                announcements: "Amakuru",
                testimonials: "Ivyashinguwe",
                stats_detailed: "Ibiharuro",
                settings: "Ibihindurwa",
                quick_draft: "Ikandiko ryihuta",
                layout: {
                    user_profile: "Umwirondoro wanje",
                    logout: "Gusohoka",
                    online: "Ku murongo",
                    system_link: "Sisitemu ya Django",
                    admin_name: "Admin Shalom"
                },
                stats: {
                    views: "Ibiharuro vyose",
                    published: "Inyigisho zashizweko",
                    listeners: "Abayumviriza ubu",
                    comments: "Ibitekerezo",
                    weekly_growth: "Ukwiyongera kw'indwi",
                    avg_duration: "Igihe mpuzandengo",
                    top_countries: "Ibihugu vy'imbere"
                },
                dashboard_page: {
                    welcome: "Mwaramutse, Admin! 👋",
                    subtitle: "Ng'ibi ibiriko biba ku rubuga rwanyu rwa Shalom uyu musi.",
                    quick_actions: {
                        new_sermon: "Inyigisho nshasha",
                        add_user: "Ongerako umukozi",
                        view_site: "Raba urubuga",
                        messages: "Ubutumwa"
                    },
                    overview: "Muri rusange 📈",
                    stats: {
                        total_views: "Ibiharuro vyose",
                        active_sermons: "Inyigisho zihari",
                        announcements: "Amakuru",
                        impact: "Ingaruka mu muryango"
                    },
                    recent_activity: "Ibikorwa vya vuba",
                    view_all: "Raba vyose",
                    activity: {
                        new_sermon: "Inyigisho nshasha yashizweko",
                        updated_announcement: "Amakuru yavuguruwe",
                        new_testimonial: "Ivyashinguwe bishasha"
                    },
                    help: {
                        title: "Ukeneye imfashanyo? 🤝",
                        desc: "Nimba uhuye n'ingorane mu kongerako inyigisho canke amakuru, umurwi wacu uhari kugira ugufashe.",
                        guide_btn: "Soma IYEREKEREZO",
                        support_btn: "Andikira abatubariza"
                    }
                },
                announcements_page: {
                    title: "Amakuru",
                    desc: "Tunganya ubutumwa buhabwa abantu bose",
                    add_btn: "Amakuru bishasha",
                    filters: {
                        all: "Vyose",
                        online: "Ku murongo",
                        drafts: "Ibikandiko",
                        search_placeholder: "Andura amakuru..."
                    },
                    item: {
                        priority_high: "Hejuru",
                        priority_normal: "Bisanzwe",
                        event_date: "Igihe:",
                        status: "Uko bihagaze:"
                    }
                },
                pages_page: {
                    title: "Genura Izindi Mbuga",
                    desc: "Hinyanyura uko urubuga rwashizweho n'ivyamamaza ku rubuga rwa Shalom Ministry.",
                    search_placeholder: "Andura umuce...",
                    modify_btn: "Hinyanyura ibirimo",
                    update_banner: "Ibihinduka ubu nyene !",
                    update_banner_desc: "Ibihindutse vyose ubu bica biboneka kuri site y'abantu bose.",
                    sections: {
                        hero: "Isanamu y'ikaze",
                        header: "UMUTWE / HERO",
                        about: "Ibitwerekeye",
                        content: "IBIRIMO NYAMUKURU",
                        featured: "Émissions zibanze",
                        categories: "Umuce w'Imice",
                        announcements: "Umuce w'Amatangazo",
                        testimonials: "Umuce w'Intahe",
                        contact: "Twandikire",
                        footer_nav: "INSI YA PAGES",
                        footer: "Munsi y'urubuga",
                        structure: "UKO RUTEGUYE"
                    },
                    edit_subtitle: "Hinyanyura amajambo n'amasanamu vy'iki gice kugira bijane n'ivyo ukeneye.",
                    form: {
                        subtitle: "Umutwe muto / Badge",
                        main_title: "Umutwe mukuru",
                        description: "Insiguro / Ibirimo",
                        save_note: "Wibuke gufata ivyo wahinduye kugira biboneke kw'urubuga."
                    }
                },
                categories_page: {
                    title: "Imice",
                    add_new: "Ongerako umuce mushasha",
                    name: "Izina",
                    name_help: "Izina nk'uko riboneka ku rubuga rwawe.",
                    slug: "Lien",
                    slug_help: "Anwani y'amadohote.",
                    description: "Insiguro",
                    desc_help: "Insiguro ntizikunze kwerekanwa.",
                    add_btn: "Ongerako umuce mushasha",
                    search: "Andura imice",
                    search_btn: "Andura",
                    table: {
                        name: "Izina",
                        slug: "Lien",
                        total: "Inyigisho",
                        modify: "Hindura",
                        quick_edit: "Hindura vuba",
                        delete: "Siba",
                        show: "Erekana"
                    },
                    edit_title: "Hindura umuce",
                    manage: "Genura"
                },
                sermons_page: {
                    title: "Urutonde rw'Inyigisho",
                    desc: "Tunganya ubutumwa bw'amajwi, amavidewo n'imiyoboro ya YouTube",
                    create_title: "Inyigisho nshasha",
                    search_placeholder: "Andura ku mutwe, ku mwanditsi...",
                    form: {
                        title: "Umutwe w'inyigisho",
                        content: "Insiguro / Ivyanditswe",
                        type: "Ubwoko bw'ibirimo",
                        type_video: "Videwo (Fiziye)",
                        type_audio: "Ijwi (Fiziye)",
                        type_youtube: "Lien YouTube",
                        url: "Lien YouTube",
                        url_placeholder: "Shira lien ya videwo ya YouTube hano...",
                        file: "Fiziye y'ibikoresho",
                        file_help: "MP4, MOV, MP3 (Max 500MB)",
                        publish: "Ishira ku rubuga",
                        visibility: "Uko riboneka",
                        status: "Uko bihagaze",
                        category: "Imice",
                        add_category: "+ Ongerako umuce",
                        author: "Umwanditsi / Umupasitori",
                        author_placeholder: "Izina ry'umupasitori",
                        save_draft: "Bika nk'ikandiko",
                        trash: "Ibizibira",
                        featured_image: "Isanamu nkuru",
                        set_featured_image: "Shira isanamu nkuru",
                        schedule: "Ubu nyene",
                        update: "Hinyanyura",
                        status_scheduled: "Yashizweho ku gihe",
                        image: "Isanamu nkuru",
                        video_link_or_file: "Lien canke Fiziye ya Videwo",
                        youtube_detected: "YouTube yabonetse",
                        video_url_help: "Lien ya Videwo (YouTube canke direct)",
                        local_file: "Fiziye yo ng'aha",
                        change_image: "Hindura isanamu",
                        click_to_add_image: "Fyonda hano kugira ushireko isanamu",
                        recommended_format: "Uburyo bwiza: 1920x1080px (16:9)",
                        state_label: "Uko bihagaze :"
                    },
                    table: {
                        title: "Inyigisho",
                        author: "Umwanditsi",
                        categories: "Imice",
                        tags: "Étiquettes",
                        status: "Uko bihagaze",
                        date: "Igihe",
                        status_published: "Byashizweko",
                        status_draft: "Ibikandiko"
                    }
                },
                users_page: {
                    title: "Abakozi n'Abapasitori",
                    desc: "Tunganya abantu bishinzwe ibirimo",
                    add_btn: "Ongerako umukozi",
                    search_placeholder: "Andura ku zina canke ku butumwa...",
                    create_title: "Ongerako umukozi mushasha",
                    form: {
                        username: "Izina ry'umukozi",
                        email: "Ubutumwa",
                        first_name: "Izina rya mbere",
                        last_name: "Izina rya kabiri",
                        website: "Urubuga",
                        send_notification: "Rungikira umukozi ubutumwa",
                        role: "Ibanga",
                        role_pastor: "Umupasitori",
                        role_admin: "Ubuyobozi",
                        submit: "Ongerako umukozi"
                    }
                },
                media_page: {
                    title: "Ububiko bw'Ibikoresho",
                    add_btn: "Ongerako fiziye",
                    all_media: "Vyose",
                    images: "Amasanamu",
                    audio: "Amajwi",
                    video: "Amavidewo",
                    all_dates: "Ibihe vyose",
                    bulk_select: "Hitamo vyinshi",
                    search: "Andura ibikoresho...",
                    new: "Ongerako"
                },
                stats_page: {
                    title: "Ibiharuro vyoroshe",
                    subtitle: "Tahura mu buryo bworoshe ingaruka z'inyigisho zawe",
                    labels: {
                        views: "Ibisubirwamwo",
                        listeners: "+5% uyu kwezi",
                        impact_label: "Ingaruka",
                        impact_sub: "Ukwifatanya gukomeye",
                        time_label: "Igihe",
                        time_sub: "Mpuzandengo",
                        listeners_count: "Abayumviriza",
                        live: "Ubu nyene"
                    },
                    audience: {
                        title: "Abayumviriza bawe bava he?",
                        rest_of_world: "Ibindi bihugu"
                    },
                    favorites: {
                        title: "Inyigisho zikundwa",
                        listened_by: "Yumvirijwe na",
                        people: "abantu"
                    }
                },
                testimonials_page: {
                    title: "Ivyashinguwe",
                    desc: "Yerekana ubutumwa bw'ukwemera buva kubabayumviriza",
                    add_btn: "Gushingira intahe gushasha",
                    filters: {
                        all: "Vyose",
                        to_verify: "Ivyo gusuzumwa",
                        published: "Byashizweko"
                    },
                    item: {
                        verified: "Yemejwe",
                        ago: "haraciye",
                        mark_as_pending: "Witegereze gato",
                        mark_as_verified: "Emeza iyi ntagihe"
                    },
                    create_title: "Ongerako ivyashinguwe",
                    back: "Subira ku vyashinguwe",
                    form: {
                        author: "Izina ry'umuntu",
                        placeholder_author: "Akarorero: Mwene data David...",
                        rating: "Uko bishimwa (inyenyeri 1 kugeza 5)",
                        rating_excellent: "Meza cane",
                        rating_very_good: "Meza cane",
                        rating_good: "Meza",
                        content: "Ivyashinguwe",
                        placeholder_content: "Ico Imana yakoze mu buzima bwiwe...",
                        verify: "Shira ikimenyetso ko ivyashinguwe vyemejwe",
                        submit: "Bika ivyashinguwe",
                        info_star: "Ivyashinguwe ni uburyo bukomeye bwo kuremesha ukwemera kw'abandi mu muryango."
                    }
                },
                settings_page: {
                    title: "Ibihindurwa rusange",
                    site_lang: "Ururimi rw'urubuga",
                    lang_help: "Hitamo ururimi rusanzwe rw'urubuga.",
                    site_title: "Umutwe w'urubuga",
                    site_title_val: "Shalom Ministry",
                    slogan: "Icivugo",
                    slogan_val: "Ijambo rihindura ubuzima",
                    slogan_help: "Byerekanwa inyuma y'umutwe w'urubuga.",
                    save: "Bika amahinduka",
                    form: {
                        emissions: "Kwitirira Inyigisho",
                        teachings: "Kwitirira Amashuri",
                        meditation: "Kwitirira Ukuzirikana"
                    }
                }
            },
            hero: {
                subtitle: "Shalom Ministry",
                title: "Gira Impinduka y'Imana mu Bufatanye n'Ijambo",
                description: "Ubuyobozi bwa Gikiristu bwishingikirije ku gukira imbere, kuzirikana Ijambo ry'Imana, inyigisho za Bibiliya no gukura mu buryo bw'impwemu.",
                cta_primary: "Umviriza ubu",
                cta_secondary: "Menya ibijanye na ministeri",
                stats: {
                    emissions: "Inyigisho",
                    listeners: "Abayumviriza",
                    categories: "Ibirimwo"
                }
            },
            categories: {
                all: "Imice yose",
                title: "Raba",
                title_accent: "Imice yacu",
                desc: "Andura ubwoko butandukanye bw'ibikirimo kugira uheze ufushe ubuzima bwawe bw'impwemu.",
                search_label: "ANDURA",
                search_placeholder: "Hitamo umuce",
                nav_label: "UBUYOBOZI",
                search: "Andura inyigisho...",
                view_emission: "Raba inyigisho",
                items: {
                    "Famille": "Umuryango",
                    "Musique": "Indirimbo",
                    "Prière": "Gusenga",
                    "Théologie": "Inyigisho",
                    "Études bibliques": "Kwiga Bibiliya",
                    "Adoration": "Gushira hejuru",
                    "Leadership": "Ubuyobozi",
                    "Général": "Rusange"
                }
            },
            recent: {
                subtitle: "Ibishizweko vuba",
                title: "Inyigisho",
                title_accent: "zishasha",
                description: "Andura ubutumwa n'inyigisho zacu nshasha kugira uheze ukure buri musi.",
                new: "Nshasha",
                loading: "Inyigisho ziriko ziraza...",
                empty: "Nta nyigisho n'imwe yashoboye kuboneka ubu."
            },
            about: {
                history_badge: "Kahise kacu",
                title: "Ibijanye na",
                title_accent: "Shalom Ministry",
                description: "Shalom Ministry yavutse mu kwerekwa kwimbitse: kuzana ukugira neza no kuvugururwa mu bufatanye n'Ijambo ry'Imana.",
                feature1: "Inyigisho za Bibiliya",
                feature2: "Gukira mu mutima",
                feature3: "Gukura mu mpwemu",
                btn: "Ivyo wipfuza",
                stats_label: "Imyaka ya ministeri",
                quote: "Ijambo ry'Imana si inkuru gusa, n'ububasha buvugurura impwemu kandi bukanywanisha ubwenge.",
                pastor_title: "Umupasitori mukuru",
                team_title: "Umurwi wacu",
                team_desc: "Umurwi witangiye gukorera Ubwami kugira uheze ube kumwe nawe mu rugendo rwawe rwa Gikiristu."
            },
            contact: {
                badge: "Twandikire",
                title: "Twandikire kuri",
                title_accent: "Ubuyobozi",
                description: "Urafise ikibazo, ukeneye gusengerwa, canke wipfuza kuramutsa gusa? Umurwi wacu uhari ku bwawe.",
                info: {
                    email: "Ubutumwa",
                    phone: "Terefone",
                    address: "Aho dushobora kubasanga",
                    hours: "Amasaha",
                    hours_value: "Ku wa mbere - Ku wa gatanu: 08:00 - 18:00"
                },
                follow: "Tukurikire",
                form_title: "Turungikire ubutumwa",
                form: {
                    name: "Izina ryose",
                    name_placeholder: "Izina ryawe...",
                    email: "Ubutumwa",
                    email_placeholder: "yako@email.com",
                    subject: "Ico wifuza kuvugako",
                    subject_placeholder: "Wipfuza kuvugako iki?",
                    message: "Ubutumwa bwawe",
                    message_placeholder: "Twogufasha gute?",
                    submit: "Rungika ubutumwa"
                }
            },
            footer: {
                quick_links: "Imiyo boro yihuta",
                follow: "Imbuga nkoranyambaga",
                media_not_available: "Ibikoresho ntibihari",
                description: "Insiguro",
                no_description: "Nta nsiguro ihari.",
                share_this: "Sangiza abandi iyi nyigisho",
                about_speaker: "Ibitwerekeye umupasitori",
                general: "Rusange",
                back: "Subira inyuma",
                sermon_not_found: "Inyigisho ntibonetse",
                browser_video_error: "Urubuga rwanyu ntirushobora kwerekana videwo.",
                browser_audio_error: "Urubuga rwanyu ntirushobora kwerekana ijwi.",
                default_preacher: "Umupasitori",
                listeners_count: "abayumviriza",
                ministry_role: "Umwigisha w'Ubutumwa",
                join_us_teaching: "Twifatanye muri iyi nyigisho yimbitse mu gihe dusuzuma ijambo ry'Imana hamwe.",
                info_events: "Amakuru & Ibirori",
                all_announcements: "Amakuru vyose"
            },
            home_testimonials: {
                badge: "INTAHE",
                title: "Ico bavuga kuri",
                title_accent: "ministeri yacu",
                description: "Andura intahe z'abafashijwe n'ijambo ry'Imana kuri Shalom Ministry."
            }
        }
    },
    sw: {
        translation: {
            nav: {
                home: "Mwanzo",
                emissions: "Mahubiri",
                about: "Kuhusu sisi",
                contact: "Wasiliana nasi",
                admin: "Utawala",
                view_site: "Tembelea Tovuti",
                create: "Mpya",
                greetings: "Salamu"
            },
            common: {
                error_loading: "Hitilafu wakati wa kupakia",
                sermon_not_found: "Mahubiri hayajapatikana",
                back: "Rudi",
                listen_audio: "Sikiliza sauti",
                browser_audio_error: "Kivinjari chako hakiauni kucheza sauti.",
                browser_video_error: "Kivinjari chako hakiauni kucheza video.",
                download: "Pakua",
                share: "Shiriki",
                media_not_available: "Media haipatikani",
                general: "Jumla",
                default_preacher: "Mhubiri",
                listeners_count: "wasikilizaji",
                description: "Maelezo",
                no_description: "Hakuna maelezo yanayopatikana.",
                share_this: "Shiriki fundisho hili",
                about_speaker: "Kuhusu mzungumzaji",
                ministry_role: "Mwalimu wa Neno",
                join_us_teaching: "Jiunge nasi kwa fundisho hili la kina tunapochunguza neno la Mungu pamoja.",
                info_events: "Habari & Matukio",
                all_announcements: "Matangazo yote",
                confirm_delete: "Je, una uhakika unataka kufuta kipengee hiki?",
                deleted_success: "Imefutwa kwa mafanikio!",
                error_deleting: "Hitilafu wakati wa kufuta",
                loading: "Inapakia...",
                no_results: "Hakuna matokeo yaliyopatikana",
                unknown_author: "Mwandishi asiyejulikana",
                no_category: "Hakuna kikundi",
                hours_ago: "Masaa {{count}} yaliyopita",
                days_ago: "Siku {{count}} zilizopita",
                weeks_ago: "Wiki {{count}} zilizopita",
                retry: "Jaribu tena",
                updated_success: "Imesasishwa kwa mafanikio!",
                error_updating: "Hitilafu wakati wa kusasisha",
                no_data: "Hakuna data inayopatikana",
                edit_of: "Mabadiliko ya",
                quick_edit_of: "Hatua za haraka kwa",
                delete_of: "Futa",
                view_of: "Ona",
                saved_success: "Imehifadhiwa kwa mafanikio!",
                error_saving: "Hitilafu wakati wa kuhifadhi",
                current_file: "Faili ya sasa",
                reset: "Anza upya",
                new_selection: "Uteuzi mpya",
                title_required: "Kichwa kinahitajika",
                published_success: "Imechapishwa kwa mafanikio!",
                draft_saved: "Rasimu imehifadhiwa!",
                created_success: "Imeundwa kwa mafanikio!"
            },
            admin: {
                dashboard: "Dashibodi",
                sermons: "Mahubiri",
                categories: "Makundi",
                media: "Midia",
                users: "Timu na Wachungaji",
                pages: "Kurasa",
                announcements: "Matangazo",
                testimonials: "Ushuhuda",
                stats_detailed: "Takwimu",
                settings: "Mipangilio",
                quick_draft: "Rasimu ya haraka",
                layout: {
                    user_profile: "Wasifu Wangu",
                    logout: "Ondoka",
                    online: "Mkondoni",
                    system_link: "Mfumo wa Django",
                    admin_name: "Admin Shalom"
                },
                stats: {
                    views: "Jumla ya Maoni",
                    published: "Iliyochapishwa",
                    listeners: "Wasikilizaji Amilifu",
                    comments: "Maoni",
                    weekly_growth: "Ukuaji wa wiki",
                    avg_duration: "Wakati wa wastani",
                    top_countries: "Nchi za Juu"
                },
                dashboard_page: {
                    welcome: "Karibu, Admin! 👋",
                    subtitle: "Hivi ndivyo vinavyofanyika kwenye lango lako la Shalom leo.",
                    quick_actions: {
                        new_sermon: "Mahubiri Mapya",
                        add_user: "Ongeza Mchungaji",
                        view_site: "Tazama Tovuti",
                        messages: "Ujumbe"
                    },
                    overview: "Muhtasari 📈",
                    stats: {
                        total_views: "Jumla ya Maoni",
                        active_sermons: "Mahubiri Amilifu",
                        announcements: "Matangazo",
                        impact: "Kiwango cha Impact"
                    },
                    recent_activity: "Shughuli ya Hivi Karibuni",
                    view_all: "Tazama yote",
                    activity: {
                        new_sermon: "Mahubiri mapya yamechapishwa",
                        updated_announcement: "Tangazo limesasishwa",
                        new_testimonial: "Ushuhuda mpya umepokelewa"
                    },
                    help: {
                        title: "Unahitaji msaada? 🤝",
                        desc: "Ikiwa una shida kusimamia mahubiri yako au matangazo, timu yetu iko hapa kukusaidia.",
                        guide_btn: "Soma MWONGOZO",
                        support_btn: "Wasiliana na msaada"
                    }
                },
                announcements_page: {
                    title: "Matangazo",
                    desc: "Dhibiti habari muhimu kwa wafuasi wako",
                    add_btn: "Tangazo Jipya",
                    filters: {
                        all: "Zote",
                        online: "Mkondoni",
                        drafts: "Rasimu",
                        search_placeholder: "Tafuta tangazo..."
                    },
                    item: {
                        priority_high: "Juu",
                        priority_normal: "Kawaida",
                        event_date: "Tarehe ya hafla:",
                        status: "Hali:"
                    }
                },
                categories_page: {
                    title: "Usimamizi wa Makundi",
                    add_new: "Ongeza kikundi kipya",
                    name: "Jina",
                    name_help: "Jina kama litakavyoonekana kwenye tovuti yako.",
                    slug: "Slug",
                    slug_help: "Anwani ya URL ya kikundi.",
                    description: "Maelezo",
                    desc_help: "Maelezo hayaonyeshwi mara nyingi.",
                    add_btn: "Ongeza kikundi",
                    search: "Tafuta kikundi",
                    search_btn: "Tafuta",
                    table: {
                        name: "Jina",
                        slug: "Slug",
                        total: "Jumla ya Mahubiri",
                        modify: "Hariri",
                        quick_edit: "Vitendo",
                        delete: "Futa",
                        show: "Onyesha"
                    },
                    edit_title: "Hariri Kikundi",
                    manage: "Dhibiti"
                },
                sermons_page: {
                    title: "Usimamizi wa Mahubiri",
                    desc: "Dhibiti mafundisho yako ya sauti, video na viungo vya YouTube",
                    create_title: "Mahubiri Mapya",
                    search_placeholder: "Tafuta kwa kichwa, mwandishi...",
                    form: {
                        title: "Kichwa cha mahubiri",
                        content: "Maelezo / Mstari muhimu",
                        type: "Aina ya Media",
                        type_video: "Video (Faili)",
                        type_audio: "Sauti (Faili)",
                        type_youtube: "Kiungo cha YouTube",
                        url: "URL ya YouTube",
                        url_placeholder: "Bandika kiungo cha YouTube hapa...",
                        file: "Faili ya media",
                        file_help: "MP4, MOV, MP3 (Max 500MB)",
                        publish: "Chapisha rasmi",
                        visibility: "Uonekano",
                        status: "Hali",
                        category: "Makundi",
                        add_category: "+ Ongeza kikundi",
                        author: "Mwandishi / Mchungaji",
                        author_placeholder: "Jina la mchungaji",
                        save_draft: "Hifadhi rasimu",
                        trash: "Hamisha kwenye takataka",
                        featured_image: "Picha ya bima",
                        set_featured_image: "Weka picha",
                        schedule: "Chapisha sasa",
                        update: "Sasisha",
                        status_scheduled: "Imepangwa",
                        image: "Picha ya bima",
                        video_link_or_file: "Kiungo au Faili la Video",
                        youtube_detected: "YouTube imegunduliwa",
                        video_url_help: "URL ya Video (YouTube au moja kwa moja)",
                        local_file: "Faili la kawaida",
                        change_image: "Badilisha picha",
                        click_to_add_image: "Bonyeza ili kuongeza picha",
                        recommended_format: "Muundo unaopendekezwa: 1920x1080px (16:9)",
                        state_label: "Hali :"
                    },
                    table: {
                        title: "Kichwa",
                        author: "Mwandishi",
                        categories: "Makundi",
                        tags: "Lebo",
                        status: "Hali",
                        date: "Tarehe",
                        status_published: "Iliyochapishwa",
                        status_draft: "Rasimu"
                    }
                },
                pages_page: {
                    title: "Usimamizi wa Kurasa",
                    desc: "Binafsisha onyesho na yaliyomo kwenye sehemu za tovuti yako ya Shalom Ministry.",
                    search_placeholder: "Tafuta sehemu...",
                    modify_btn: "Badilisha maudhui",
                    update_banner: "Marekebisho ya wakati halisi!",
                    update_banner_desc: "Mabadiliko yote yaliyohifadhiwa hapa yanaonekana mara moja kwenye tovuti ya umma.",
                    sections: {
                        hero: "Bango la Karibu",
                        header: "KICHWA / HERO",
                        about: "Kuhusu Sisi",
                        content: "MAUDHUI KUU",
                        featured: "Vipindi Maalum",
                        categories: "Sehemu ya Makundi",
                        announcements: "Sehemu ya Matangazo",
                        testimonials: "Sehemu ya Ushuhuda",
                        contact: "Wasiliana Nasi",
                        footer_nav: "UGAWAJI WA CHINI",
                        footer: "Chini ya tovuti",
                        structure: "MUUNDO WA TOVUTI"
                    },
                    edit_subtitle: "Badilisha maandishi na midia ya sehemu hii ili kulingana na mahitaji yako.",
                    form: {
                        subtitle: "Kichwa kidogo / Badge",
                        main_title: "Kichwa kikuu",
                        description: "Maelezo / Maudhui",
                        save_note: "Usisahau kuhifadhi mabadiliko yako ili yaanze kutumika kwenye tovuti."
                    }
                },
                users_page: {
                    title: "Timu na Wachungaji",
                    desc: "Dhibiti wasimamizi na wachangiaji",
                    add_btn: "Ongeza Mwanachama wa Timu",
                    search_placeholder: "Tafuta kwa jina au barua pepe...",
                    create_title: "Ongeza Mtumiaji Mpya",
                    form: {
                        username: "Jina la mtumiaji",
                        email: "Anwani ya Barua pepe",
                        first_name: "Jina la kwanza",
                        last_name: "Jina la mwisho",
                        website: "Tovuti",
                        send_notification: "Tuma barua pepe ya kukaribisha",
                        role: "Jukumu",
                        role_pastor: "Mchungaji / Mwandishi",
                        role_admin: "Msimamizi",
                        submit: "Ongeza Mtumiaji Mpya"
                    }
                },
                media_page: {
                    title: "Maktaba ya Media",
                    add_btn: "Ongeza faili",
                    all_media: "Media zote",
                    images: "Picha",
                    audio: "Sauti",
                    video: "Video",
                    all_dates: "Tarehe zote",
                    bulk_select: "Chagua kwa wingi",
                    search: "Tafuta media...",
                    new: "Ongeza"
                },
                stats_page: {
                    title: "Uchanganuzi wa Watazamaji",
                    subtitle: "Elewa athari za mahubiri yako kwa muhtasari",
                    labels: {
                        views: "Jumla ya maoni",
                        listeners: "+5% mwezi huu",
                        impact_label: "Kiwango cha Impact",
                        impact_sub: "Ushiriki Madhubuti",
                        time_label: "Wakati wa wastani",
                        time_sub: "Kwa msikilizaji",
                        listeners_count: "Wasikilizaji",
                        live: "Inaendelea Sasa"
                    },
                    audience: {
                        title: "Watazamaji wako wanatoka wapi?",
                        rest_of_world: "Ulimwengu mwingine"
                    },
                    favorites: {
                        title: "Mahubiri Yanayosikilizwa Zaidi",
                        listened_by: "Inasikilizwa na",
                        people: "watu"
                    }
                },
                testimonials_page: {
                    title: "Usimamizi wa Ushuhuda",
                    desc: "Onyesha jumbe za imani kutoka kwa jamii yako",
                    add_btn: "Ushuhuda Mpya",
                    filters: {
                        all: "Zote",
                        to_verify: "Kuhakiki",
                        published: "Iliyochapishwa"
                    },
                    item: {
                        verified: "Imeidhinishwa",
                        ago: "iliyopita",
                        mark_as_pending: "Weka kama inasubiri",
                        mark_as_verified: "Idhinisha ushuhuda huu"
                    },
                    create_title: "Ongeza Ushuhuda",
                    back: "Rudi kwenye ushuhuda",
                    form: {
                        author: "Jina la Mtu",
                        placeholder_author: "Mfano: Ndugu David...",
                        rating: "Ukadiriaji (nyota 1 hadi 5)",
                        rating_excellent: "Bora kabisa",
                        rating_very_good: "Nzuri sana",
                        rating_good: "Nzuri",
                        content: "Ushuhuda",
                        placeholder_content: "Kile Mungu amefanya...",
                        verify: "Weka alama kama iliyoidhinishwa mara moja",
                        submit: "Hifadhi ushuhuda",
                        info_star: "Ushuhuda ni njia dhabiti ya kutia moyo imani ya washiriki wengine."
                    }
                },
                settings_page: {
                    title: "Mipangilio ya Jumla",
                    site_lang: "Lugha ya Tovuti",
                    lang_help: "Chagua lugha chaguo-msingi ya tovuti.",
                    site_title: "Kichwa cha Tovuti",
                    site_title_val: "Shalom Ministry",
                    slogan: "Slogan / Motto",
                    slogan_val: "Neno linalobadilisha",
                    slogan_help: "Inaonyeshwa baada ya kichwa kwenye kivinjari.",
                    save: "Hifadhi mabadiliko",
                    form: {
                        emissions: "Jina la Tabo ya Mahubiri",
                        teachings: "Jina la Tabo ya Mafundisho",
                        meditation: "Jina la Tabo ya Tahajudi"
                    }
                }
            },
            hero: {
                subtitle: "Shalom Ministry",
                title: "Pata Mabadiliko ya Kimungu Kupitia Neno",
                description: "Wizara ya Kikristo iliyojitolea kwa uponyaji wa ndani, tahajudi ya kina, mafundisho ya bibilia, na ukuaji wa kiroho.",
                cta_primary: "Sikiliza sasa",
                cta_secondary: "Gundua zaidi",
                stats: {
                    emissions: "Mahubiri",
                    listeners: "Wasikilizaji",
                    categories: "Thématiques"
                }
            },
            categories: {
                all: "Makundi yote",
                title: "Vumbua",
                title_accent: "Mandhari yetu",
                desc: "Ingia ndani ya mandhari yetu mbalimbali ili kulisha safari yako ya kiroho ya kila siku.",
                search_label: "TAFUTA",
                search_placeholder: "Chagua mandhari",
                nav_label: "URAMBAZAJI",
                search: "Tafuta mahubiri...",
                view_emission: "Tazama utangazaji",
                items: {
                    "Famille": "Familia",
                    "Musique": "Muziki",
                    "Prière": "Maombi",
                    "Théologie": "Theolojia",
                    "Études bibliques": "Mafunzo ya Biblia",
                    "Adoration": "Kuabudu",
                    "Leadership": "Uongozi",
                    "Général": "Kawaida"
                }
            },
            recent: {
                subtitle: "Machapisho ya hivi karibuni",
                title: "Mafundisho",
                title_accent: "ya hivi karibuni",
                description: "Gundua jumbe zetu za hivi karibuni na mafundisho ili kukuwa kila siku.",
                new: "Mpya",
                loading: "Inapakia mahubiri...",
                empty: "Hakuna mahubiri yaliyopatikana kwa sasa."
            },
            about: {
                history_badge: "Historia Yetu",
                title: "Kuhusu",
                title_accent: "Shalom Ministry",
                description: "Shalom Ministry ilizaliwa kutokana na maono ya kina: kuleta uponyaji na upya kupitia Neno la Mungu.",
                feature1: "Mafundisho ya Bibilia",
                feature2: "Uponyaji wa Moyo",
                feature3: "Uamsho wa Kiroho",
                btn: "Ahadi Zetu",
                stats_label: "Miaka ya Huduma",
                quote: "Neno la Mungu si hadithi tu, ni nguvu inayoumba upya nafsi na kuoanisha roho.",
                pastor_title: "Mchungaji Mwandamizi",
                team_title: "Timu Yetu",
                team_desc: "Timu iliyojitolea kutumikia Ufalme ili kuongozana nawe katika safari yako ya Kikristo."
            },
            contact: {
                badge: "Wasiliana nasi",
                title: "Endelea",
                title_accent: "Wasiliana",
                description: "Swali, hitaji la maombi, au unataka tu kusema jambo? Timu yetu inakusikiliza.",
                info: {
                    email: "Barua pepe",
                    phone: "Simu",
                    address: "Anwani",
                    hours: "Masaa",
                    hours_value: "Jumatatu - Ijumaa: 08:00 - 18:00"
                },
                follow: "Tufuate",
                form_title: "Tutumie ujumbe",
                form: {
                    name: "Jina kamili",
                    name_placeholder: "Jina lako...",
                    email: "Barua pepe",
                    email_placeholder: "wewe@mfano.com",
                    subject: "Mandhari ya ujumbe",
                    subject_placeholder: "Je! Ungetaka kuzungumza juu ya nini?",
                    message: "Ujumbe wako",
                    message_placeholder: "Tunawezaje kukusaidia?",
                    submit: "Tuma Ujumbe"
                }
            },
            footer: {
                quick_links: "Viungo vya Haraka",
                follow: "Mitandao ya Kijamii",
                media_not_available: "Media haipatikani",
                description: "Maelezo",
                no_description: "Hakuna maelezo yanayopatikana.",
                share_this: "Shiriki fundisho hili",
                about_speaker: "Kuhusu mzungumzaji",
                general: "Jumla",
                back: "Rudi",
                sermon_not_found: "Mahubiri hayajapatikana",
                browser_video_error: "Kivinjari chako hakiauni kucheza video.",
                browser_audio_error: "Kivinjari chako hakiauni kucheza sauti.",
                default_preacher: "Mhubiri",
                listeners_count: "wasikilizaji",
                ministry_role: "Mwalimu wa Neno",
                join_us_teaching: "Jiunge nasi kwa fundisho hili la kina tunapochunguza neno la Mungu pamoja.",
                info_events: "Habari & Hafla",
                all_announcements: "Matangazo yote"
            },
            home_testimonials: {
                badge: "USHUHUDA",
                title: "Wanachosema kuhusu",
                title_accent: "huduma yetu",
                description: "Gundua jinsi Shalom Ministry inavyobadilisha maisha kupitia Neno."
            }
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: "fr",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
