import { motion } from "framer-motion";
import { Clock, Headphones, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const recentItems = [
  {
    id: 1,
    title: "La grâce suffisante",
    author: "Pasteur Emmanuel",
    category: "Théologie",
    duration: "45 min",
    isNew: true,
  },
  {
    id: 2,
    title: "Famille et bénédiction",
    author: "Kandeke Donald",
    category: "Vie de Famille",
    duration: "32 min",
    isNew: true,
  },
  {
    id: 3,
    title: "Chants de louange vol. 3",
    author: "Chorale Shalom",
    category: "Musique et adoration",
    duration: "58 min",
    isNew: true,
  },
  {
    id: 4,
    title: "Méditations du matin",
    author: "Sœur Laurette",
    category: "Prière et méditation",
    duration: "20 min",
    isNew: false,
  },
];

const RecentEmissions = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Émissions récentes
            </h2>
            <p className="text-muted-foreground max-w-md">
              Découvrez nos messages récents pour nourrir votre esprit et approfondir votre foi.
            </p>
          </motion.div>
          <Button variant="outline" className="hidden md:flex items-center gap-2 border-accent text-accent hover:bg-accent/10">
            Voir tout <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-lg transition-all duration-300 group"
            >
              <div className="h-40 bg-gradient-to-br from-primary/8 to-accent/8 flex items-center justify-center relative">
                <Headphones className="w-12 h-12 text-accent/40" />
                {item.isNew && (
                  <span className="absolute top-3 left-3 flex items-center gap-1 bg-accent text-accent-foreground text-xs px-2.5 py-1 rounded-full font-semibold">
                    <Sparkles className="w-3 h-3" /> Nouveau
                  </span>
                )}
              </div>
              <div className="p-5">
                <p className="text-xs text-accent font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Récemment ajouté
                </p>
                <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
                <p className="text-muted-foreground text-sm mb-1">{item.author}</p>
                <p className="text-muted-foreground text-xs mb-4">{item.category} · {item.duration}</p>
                <button className="flex items-center gap-1 text-accent hover:text-gold-light text-sm font-medium transition-colors group-hover:gap-2">
                  Écouter <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="md:hidden mt-8 text-center">
          <Button variant="outline" className="border-accent text-accent hover:bg-accent/10 gap-2">
            Voir tout <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default RecentEmissions;
