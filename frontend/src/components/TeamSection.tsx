import { motion } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { apiService } from "@/lib/api";
import { getFullImageUrl } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import pastorPortrait from "@/assets/pastor-portrait.jpg";
import team1 from "@/assets/team/team-1.png";
import team2 from "@/assets/team/team-2.png";
import team3 from "@/assets/team/team-3.png";
import aboutTeam from "@/assets/about-team.jpg";
import aboutChurch from "@/assets/about-church.jpg";
import { stripHtml } from "@/lib/utils";

const TeamSection = () => {
    const [members, setMembers] = useState<any[]>([]);
    const [settings, setSettings] = useState<any>(null);
    const { t, i18n } = useTranslation();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: 'center',
        loop: true,
        skipSnaps: false,
        dragFree: false
    });

    useEffect(() => {
        if (!emblaApi) return;
        const autoplay = setInterval(() => {
            if (emblaApi.canScrollNext()) {
                emblaApi.scrollNext();
            } else {
                emblaApi.scrollTo(0);
            }
        }, 4000);
        return () => clearInterval(autoplay);
    }, [emblaApi]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on('select', onSelect);
        emblaApi.on('reInit', onSelect);
    }, [emblaApi, onSelect]);

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    const scrollTo = useCallback((index: number) => {
        if (emblaApi) emblaApi.scrollTo(index);
    }, [emblaApi]);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await apiService.getSettings();
                setSettings(data);
            } catch (err) {
                console.error("Failed to fetch settings", err);
            }
        };

        const fetchTeam = async () => {
            try {
                const data = await apiService.getTeamMembers();
                setMembers(Array.isArray(data) ? data : (data?.results || []));
            } catch (err) {
                console.error("Failed to fetch team members", err);
                setMembers([]);
            }
        };
        fetchSettings();
        fetchTeam();
    }, []);

    const getSetting = (key: string) => {
        if (!settings) return null;
        const lang = i18n.language || 'fr';
        const fieldName = `${key}_${lang}`;
        return settings[fieldName] || settings[key];
    };

    const teamFallback = [
        {
            id: 'p1',
            name: "Jean Emmanuel",
            role_fr: "Dirigeant Pasteur",
            role_rn: "Umupasitori Mukuru",
            role_en: "Lead Pastor",
            photo: pastorPortrait
        },
        {
            id: 'p2',
            name: "Donald Nom",
            role_fr: "Pasteur / Auteur",
            role_rn: "Umupasitori / Umwanditsi",
            role_en: "Pastor / Author",
            photo: team1
        },
        {
            id: 'p3',
            name: "kandeke Donald",
            role_fr: "Pasteur / Auteur",
            role_rn: "Umupasitori / Umwanditsi",
            role_en: "Pastor / Author",
            photo: team2
        },
        {
            id: 'p4',
            name: "Patrick Kandeke",
            role_fr: "Pasteur / Auteur",
            role_rn: "Umupasitori / Umwanditsi",
            role_en: "Pastor / Author",
            photo: team3
        },
        {
            id: 't1',
            name: "qa_agent",
            role_fr: "Administrateur",
            role_rn: "Umuyobozi",
            role_en: "Administrator",
            photo: aboutTeam
        },
        {
            id: 't2',
            name: "Donale",
            role_fr: "Administrateur",
            role_rn: "Umuyobozi",
            role_en: "Administrator",
            photo: aboutChurch
        }
    ];

    const displayMembers = members.length > 0 ? members : teamFallback;

    if (displayMembers.length === 0) return null;

    return (
        <section className="py-24 bg-[#fafbfc] relative overflow-hidden" id="team">
            {/* Background elements for a professional look */}
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-accent/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-primary/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex items-center justify-center gap-3 mb-4"
                    >
                        <div className="h-[1px] w-8 bg-accent" />
                        <span className="text-accent text-xs font-bold uppercase tracking-[0.3em]">
                            {stripHtml(getSetting("team_title")) || t("team.badge") || "Notre Équipe"}
                        </span>
                        <div className="h-[1px] w-8 bg-accent" />
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-6"
                    >
                        {stripHtml(getSetting("team_description")) || (
                            <>Rencontrez ceux qui <span className="text-accent italic font-serif">servent</span></>
                        )}
                    </motion.h2>
                </div>

                <div className="relative px-12 lg:px-24">
                    <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
                        <div className="flex gap-6 lg:gap-10">
                            {displayMembers.map((member, i) => (
                                <div
                                    key={member.id}
                                    className="flex-[0_0_100%] sm:flex-[0_0_calc(50%-12px)] lg:flex-[0_0_calc(33.333%-20px)] min-w-0"
                                >
                                    <motion.div
                                        animate={{
                                            scale: selectedIndex === i ? 1 : 0.9,
                                            opacity: selectedIndex === i ? 1 : 0.5
                                        }}
                                        transition={{ duration: 0.4 }}
                                        className="group"
                                    >
                                        <div className="relative mb-8 pt-10">
                                            {/* Decorative Quote Icon behind */}
                                            <Quote className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 text-accent/5 -z-10" />

                                            <div className="relative aspect-square rounded-full overflow-hidden shadow-2xl ring-4 ring-white transition-all duration-500 group-hover:ring-accent/20 max-w-[280px] mx-auto">
                                                <img
                                                    src={member.photo_display || (member.photo?.includes('/src/') || member.photo?.includes('/assets/') ? member.photo : getFullImageUrl(member.photo)) || member.photo}
                                                    alt={member.name}
                                                    className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                                                />
                                            </div>
                                        </div>

                                        <div className="text-center px-4">
                                            <h3 className="text-2xl font-bold text-[#1a1a1a] mb-1 group-hover:text-accent transition-colors duration-300">
                                                {member.name}
                                            </h3>
                                            <p className="text-accent text-sm font-bold uppercase tracking-widest mb-4">
                                                {member[`role_${i18n.language}`] || member.role_fr || member.role}
                                            </p>
                                            <div className="flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <div className="h-1 w-6 bg-accent/30 rounded-full" />
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Arrows */}
                    <button
                        onClick={scrollPrev}
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center hover:bg-accent hover:text-white transition-all duration-300 hidden md:flex"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={scrollNext}
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center hover:bg-accent hover:text-white transition-all duration-300 hidden md:flex"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>

                {/* Dots Navigation */}
                <div className="flex justify-center gap-2 mt-12">
                    {displayMembers.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => scrollTo(i)}
                            className={`h-2 transition-all duration-300 rounded-full ${selectedIndex === i ? 'w-8 bg-accent' : 'w-2 bg-gray-200 hover:bg-gray-300'}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TeamSection;
