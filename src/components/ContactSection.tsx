import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, Clock, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import contactCity from "@/assets/contact-city.jpg";

const contactInfo = [
  { icon: Mail, label: "Email", value: "contact@shalom.org", href: "mailto:contact@shalom.org" },
  { icon: Phone, label: "Téléphone", value: "+257 79 901 864", href: "tel:+25779901864" },
  { icon: MapPin, label: "Adresse", value: "Bujumbura, Burundi", href: "#" },
  { icon: Clock, label: "Horaires", value: "Lun - Sam, 8h - 17h", href: "#" },
];

const ContactSection = () => {
  return (
    <section className="relative py-24 overflow-hidden" id="contact">
      {/* Background image */}
      <div className="absolute inset-0">
        <img src={contactCity} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-primary/90 backdrop-blur-sm" />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-accent text-sm font-semibold uppercase tracking-widest mb-3 block">Contactez-nous</span>
          <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-4">
            Restons en <span className="text-gradient-gold">contact</span>
          </h2>
          <p className="text-primary-foreground/60 max-w-lg mx-auto">
            Une question, une prière ou un témoignage ? N'hésitez pas à nous écrire, nous serons ravis de vous répondre.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
          {/* Contact info cards */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 space-y-4"
          >
            {contactInfo.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.a
                  key={item.label}
                  href={item.href}
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4 bg-primary-foreground/5 backdrop-blur-md rounded-2xl p-5 border border-primary-foreground/10 hover:border-accent/40 hover:bg-primary-foreground/10 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center shrink-0 group-hover:bg-accent/30 transition-colors">
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-primary-foreground/50 text-xs font-medium uppercase tracking-wider">{item.label}</p>
                    <p className="text-primary-foreground font-semibold">{item.value}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-primary-foreground/30 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.a>
              );
            })}

            {/* Social links */}
            <div className="pt-4">
              <p className="text-primary-foreground/40 text-xs font-semibold uppercase tracking-wider mb-3">Suivez-nous</p>
              <div className="flex gap-3">
                {["Facebook", "YouTube", "Instagram"].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-11 h-11 rounded-xl bg-primary-foreground/5 border border-primary-foreground/10 flex items-center justify-center text-primary-foreground/50 hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all text-xs font-bold"
                  >
                    {social[0]}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3"
          >
            <div className="bg-card rounded-3xl p-8 shadow-2xl border border-border">
              <h3 className="text-xl font-bold text-foreground mb-6">Envoyez-nous un message</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Nom complet</label>
                    <Input placeholder="Votre nom" className="bg-muted/50 border-border" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                    <Input type="email" placeholder="votre@email.com" className="bg-muted/50 border-border" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Sujet</label>
                  <Input placeholder="Le sujet de votre message" className="bg-muted/50 border-border" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Message</label>
                  <Textarea placeholder="Écrivez votre message ici..." className="bg-muted/50 border-border min-h-[140px] resize-none" />
                </div>
                <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 gap-2 text-base">
                  <Send className="w-4 h-4" /> Envoyer le message
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
