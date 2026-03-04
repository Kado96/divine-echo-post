import { motion } from "framer-motion";

interface PageHeroProps {
    title: string;
    subtitle?: string;
    image?: string;
}

const PageHero = ({ title, subtitle, image }: PageHeroProps) => {
    return (
        <section className="relative py-16 md:py-24 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 z-0">
                {image ? (
                    <img src={image} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-[#1A1A1A]" />
                )}
                <div className="absolute inset-0 bg-primary/80" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent" />
            </div>

            <div className="container mx-auto px-4 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    {subtitle && (
                        <span className="inline-block px-4 py-1.5 rounded-full bg-accent/20 text-accent text-xs font-bold uppercase tracking-widest mb-6 border border-accent/20">
                            ✦ {subtitle}
                        </span>
                    )}
                    <h1 className="text-4xl md:text-6xl font-bold text-white font-serif leading-tight max-w-4xl mx-auto">
                        {title}
                    </h1>

                    <div className="w-24 h-1 bg-gradient-to-r from-transparent via-accent to-transparent mx-auto mt-8" />
                </motion.div>
            </div>
        </section>
    );
};

export default PageHero;
