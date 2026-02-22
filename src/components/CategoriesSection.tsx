import { useState } from "react";
import { motion } from "framer-motion";
import { Search, ChevronRight, Play, Clock, Users, Headphones } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import emissionPreaching from "@/assets/emission-preaching.jpg";
import emissionWorship from "@/assets/emission-worship.jpg";
import emissionFamily from "@/assets/emission-family.jpg";
import emissionMeditation from "@/assets/emission-meditation.jpg";

const emissions = [
  {
    id: 1,
    title: "La puissance de la prière",
    author: "Pasteur David",
    category: "Prière et méditation",
    listeners: 1240,
    duration: "45 min",
    date: "12 Fév 2026",
    image: emissionPreaching,
    featured: true,
  },
  {
    id: 2,
    title: "Louange et adoration",
    author: "Groupe Shalom",
    category: "Musique et adoration",
    listeners: 3400,
    duration: "58 min",
    date: "10 Fév 2026",
    image: emissionWorship,
    featured: false,
  },
  {
    id: 3,
    title: "L'amour inconditionnel",
    author: "Sœur Marie",
    category: "Vie de Famille",
    listeners: 2100,
    duration: "32 min",
    date: "8 Fév 2026",
    image: emissionFamily,
    featured: false,
  },
  {
    id: 4,
    title: "Méditations du matin",
    author: "Kandeke Donald",
    category: "Théologie",
    listeners: 890,
    duration: "20 min",
    date: "5 Fév 2026",
    image: emissionMeditation,
    featured: false,
  },
];

const categories = ["Tout", "Prière", "Musique", "Famille", "Théologie", "Études bibliques"];

const CategoriesSection = () => {
  const [activeCategory, setActiveCategory] = useState("Tout");
  const [search, setSearch] = useState("");

  const featured = emissions[0];
  const rest = emissions.slice(1);

  return (
    <section className="py-24 bg-background" id="emissions">
      <div className="container mx-auto px-4">
        {/* Header with search */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-accent text-sm font-semibold uppercase tracking-widest mb-2 block">Nos émissions</span>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground leading-tight">
              Explorez nos <span className="text-gradient-gold">programmes</span>
            </h2>
          </motion.div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une émission..."
              className="pl-10 bg-card border-border"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Category pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap gap-2 mb-12"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "bg-accent text-accent-foreground shadow-md"
                  : "bg-card border border-border text-foreground/70 hover:border-accent/50 hover:text-accent"
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Featured emission - large card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden mb-8 group cursor-pointer"
        >
          <div className="grid md:grid-cols-2">
            <div className="relative h-64 md:h-[420px] overflow-hidden">
              <img
                src={featured.image}
                alt={featured.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/60 to-transparent md:hidden" />
            </div>
            <div className="bg-primary p-8 md:p-12 flex flex-col justify-center">
              <span className="inline-flex items-center gap-1.5 bg-accent/20 text-accent text-xs font-semibold px-3 py-1.5 rounded-full w-fit mb-4 border border-accent/30">
                ✦ À la une
              </span>
              <h3 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-3">{featured.title}</h3>
              <p className="text-primary-foreground/60 mb-2">{featured.author} · {featured.category}</p>
              <p className="text-primary-foreground/50 text-sm mb-6 leading-relaxed">
                Découvrez ce message puissant qui transformera votre vie de prière et vous rapprochera de Dieu.
              </p>
              <div className="flex items-center gap-6 text-primary-foreground/50 text-sm mb-8">
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {featured.duration}</span>
                <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {featured.listeners.toLocaleString()} auditeurs</span>
              </div>
              <div className="flex gap-3">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
                  <Play className="w-4 h-4" /> Écouter maintenant
                </Button>
                <Button variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  En savoir plus
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Grid of other emissions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((emission, i) => (
            <motion.div
              key={emission.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
            >
              <div className="relative h-52 overflow-hidden">
                <img
                  src={emission.image}
                  alt={emission.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <span className="absolute top-3 left-3 bg-primary/90 text-primary-foreground text-xs px-3 py-1 rounded-full font-medium backdrop-blur-sm">
                  {emission.category}
                </span>
                <button className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:scale-110">
                  <Play className="w-5 h-5 ml-0.5" />
                </button>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-foreground text-lg mb-1 group-hover:text-accent transition-colors">{emission.title}</h3>
                <p className="text-muted-foreground text-sm mb-3">{emission.author}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {emission.duration}</span>
                  <span className="flex items-center gap-1"><Headphones className="w-3.5 h-3.5" /> {emission.listeners.toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button variant="outline" size="lg" className="border-accent text-accent hover:bg-accent/10 gap-2">
            Voir toutes les émissions <ChevronRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default CategoriesSection;
