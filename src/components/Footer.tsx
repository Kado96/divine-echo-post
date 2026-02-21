import { Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground" id="contact">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center">
                <span className="text-accent-foreground font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>S</span>
              </div>
              <span className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                Shalom
              </span>
            </div>
            <p className="text-primary-foreground/60 text-sm leading-relaxed">
              Un ministère chrétien centré sur la guérison intérieure, la méditation de la Parole de Dieu, l'enseignement biblique et la croissance personnelle.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-5 text-accent">Liens rapides</h4>
            <ul className="space-y-3 text-sm">
              {["Émissions", "À propos", "Contact"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-primary-foreground/60 hover:text-accent transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-5 text-accent">Contactez-nous</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-primary-foreground/60">
                <Mail className="w-4 h-4 text-accent" /> contact@shalom.org
              </li>
              <li className="flex items-center gap-2 text-primary-foreground/60">
                <Phone className="w-4 h-4 text-accent" /> +257 79 901 864
              </li>
              <li className="flex items-center gap-2 text-primary-foreground/60">
                <MapPin className="w-4 h-4 text-accent" /> Bujumbura, Burundi
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-5 text-accent">Suivez-nous</h4>
            <div className="flex gap-3">
              {["Facebook", "YouTube", "Instagram"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center text-primary-foreground/60 hover:bg-accent hover:text-accent-foreground transition-all text-xs font-bold"
                >
                  {social[0]}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between text-xs text-primary-foreground/40">
          <span>© 2026 Shalom. Tous droits réservés.</span>
          <div className="flex gap-4 mt-2 md:mt-0">
            <a href="#" className="hover:text-accent transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-accent transition-colors">Aide</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
