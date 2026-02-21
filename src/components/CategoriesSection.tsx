import { useState } from "react";
import { motion } from "framer-motion";
import { Search, ChevronRight, BookOpen, Music, Heart, Cross, Users, Flame, GraduationCap } from "lucide-react";
import { Input } from "@/components/ui/input";

const categories = [
  { name: "Toutes les émissions", icon: BookOpen, count: 120 },
  { name: "Leadership", icon: Users, count: 18 },
  { name: "Musique et adoration", icon: Music, count: 24 },
  { name: "Prière et méditation", icon: Heart, count: 15 },
  { name: "Théologie", icon: GraduationCap, count: 22 },
  { name: "Vie de Famille", icon: Cross, count: 12 },
  { name: "Études bibliques", icon: Flame, count: 29 },
];

const emissions = [
  {
    id: 1,
    title: "La puissance de la prière",
    author: "Pasteur David",
    category: "Prière et méditation",
    listeners: 1240,
    date: "12 Fév 2026",
  },
  {
    id: 2,
    title: "Vivre selon l'Esprit",
    author: "Kandeke Donald",
    category: "Théologie",
    listeners: 890,
    date: "10 Fév 2026",
  },
  {
    id: 3,
    title: "L'amour inconditionnel",
    author: "Sœur Marie",
    category: "Vie de Famille",
    listeners: 2100,
    date: "8 Fév 2026",
  },
  {
    id: 4,
    title: "Louange et adoration",
    author: "Groupe Shalom",
    category: "Musique et adoration",
    listeners: 3400,
    date: "5 Fév 2026",
  },
];

const CategoriesSection = () => {
  const [active, setActive] = useState("Toutes les émissions");
  const [search, setSearch] = useState("");

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="py-20 bg-background" id="emissions">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Catégories</h2>
          <p className="text-muted-foreground max-w-md">
            Explorez nos différentes catégories d'émissions pour nourrir votre vie spirituelle.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-card rounded-2xl p-5 shadow-sm border border-border h-fit"
          >
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Rechercher</p>
            <div className="relative mb-5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Filtrer une catégorie"
                className="pl-9 bg-muted/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Navigation</p>
            <div className="flex flex-col gap-1">
              {filteredCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.name}
                    onClick={() => setActive(cat.name)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                      active === cat.name
                        ? "bg-accent/15 text-accent"
                        : "text-foreground/70 hover:bg-muted"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="flex-1">{cat.name}</span>
                    <span className="text-xs text-muted-foreground">{cat.count}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Emissions grid */}
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {emissions.map((emission, i) => (
              <motion.div
                key={emission.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="h-44 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center relative">
                  <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
                    <Flame className="w-8 h-8 text-accent" />
                  </div>
                  <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs px-2.5 py-1 rounded-full font-medium">
                    {emission.category}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-foreground mb-1 text-base">{emission.title}</h3>
                  <p className="text-muted-foreground text-sm mb-3">{emission.author}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{emission.date}</span>
                    <span>{emission.listeners.toLocaleString()} auditeurs</span>
                  </div>
                  <button className="mt-4 flex items-center gap-1 text-accent hover:text-gold-light text-sm font-medium transition-colors group-hover:gap-2">
                    Voir l'émission <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
