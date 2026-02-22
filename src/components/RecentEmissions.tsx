import { motion } from "framer-motion";
import { Play, Clock, Headphones, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import emissionPreaching from "@/assets/emission-preaching.jpg";
import emissionWorship from "@/assets/emission-worship.jpg";
import emissionFamily from "@/assets/emission-family.jpg";
import emissionMeditation from "@/assets/emission-meditation.jpg";

const recentItems = [
  {
    id: 1,
    title: "La grâce suffisante",
    author: "Pasteur Emmanuel",
    category: "Théologie",
    duration: "45 min",
    listeners: 1850,
    isNew: true,
    image: emissionPreaching,
  },
  {
    id: 2,
    title: "Famille et bénédiction",
    author: "Kandeke Donald",
    category: "Vie de Famille",
    duration: "32 min",
    listeners: 1200,
    isNew: true,
    image: emissionFamily,
  },
  {
    id: 3,
    title: "Chants de louange vol. 3",
    author: "Chorale Shalom",
    category: "Musique",
    duration: "58 min",
    listeners: 3200,
    isNew: true,
    image: emissionWorship,
  },
  {
    id: 4,
    title: "Méditations du matin",
    author: "Sœur Laurette",
    category: "Prière",
    duration: "20 min",
    listeners: 980,
    isNew: false,
    image: emissionMeditation,
  },
];

const RecentEmissions = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-accent text-sm font-semibold uppercase tracking-widest mb-2 block">Nouveautés</span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Émissions <span className="text-gradient-gold">récentes</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Découvrez nos derniers messages pour nourrir votre esprit et approfondir votre foi.
          </p>
        </motion.div>

        {/* Horizontal scrollable on mobile, grid on desktop */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-xl transition-all duration-300 group cursor-pointer"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                {item.isNew && (
                  <span className="absolute top-3 left-3 flex items-center gap-1 bg-accent text-accent-foreground text-xs px-2.5 py-1 rounded-full font-semibold shadow-md">
                    <Sparkles className="w-3 h-3" /> Nouveau
                  </span>
                )}
                {/* Play button */}
                <button className="absolute bottom-3 right-3 w-11 h-11 rounded-full bg-accent/90 text-accent-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
                  <Play className="w-5 h-5 ml-0.5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-5">
                <span className="text-accent text-xs font-semibold uppercase tracking-wider">{item.category}</span>
                <h3 className="font-bold text-foreground mt-1 mb-1 group-hover:text-accent transition-colors">{item.title}</h3>
                <p className="text-muted-foreground text-sm mb-3">{item.author}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {item.duration}</span>
                  <span className="flex items-center gap-1"><Headphones className="w-3.5 h-3.5" /> {item.listeners.toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Button variant="outline" size="lg" className="border-accent text-accent hover:bg-accent/10 gap-2">
            Voir toutes les émissions
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default RecentEmissions;
