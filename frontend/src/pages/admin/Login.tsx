import { useState, FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Lock, User, Loader2, ChurchIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

const AdminLogin = () => {
    const { t } = useTranslation();
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Redirect destination after login
    const from = (location.state as any)?.from?.pathname || "/admin";

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            await login(username, password);
            navigate(from, { replace: true });
        } catch (err: any) {
            setError(err.message || "Connexion échouée. Vérifiez vos identifiants.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl" />
                {/* Subtle grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                        backgroundSize: "40px 40px",
                    }}
                />
            </div>

            <div className="relative z-10 w-full max-w-md mx-4">
                {/* Logo / Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25 mb-4">
                        <ChurchIcon className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                        Shalom Ministry
                    </h1>
                    <p className="text-sm text-blue-200/60 mt-1">
                        Panneau d'administration
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white/[0.07] backdrop-blur-xl rounded-2xl border border-white/[0.08] p-8 shadow-2xl shadow-black/20">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-white">
                            Connexion
                        </h2>
                        <p className="text-sm text-blue-200/50 mt-0.5">
                            Entrez vos identifiants pour accéder au tableau de bord
                        </p>
                    </div>

                    {error && (
                        <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                            <p className="text-sm text-red-300 font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Username field */}
                        <div className="space-y-2">
                            <label
                                htmlFor="username"
                                className="block text-xs font-semibold text-blue-200/70 uppercase tracking-wider"
                            >
                                Nom d'utilisateur
                            </label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-blue-300/40" />
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Votre nom d'utilisateur"
                                    required
                                    autoComplete="username"
                                    autoFocus
                                    className="w-full pl-11 pr-4 py-3 bg-white/[0.06] border border-white/[0.08] rounded-xl text-white placeholder-blue-200/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-200"
                                />
                            </div>
                        </div>

                        {/* Password field */}
                        <div className="space-y-2">
                            <label
                                htmlFor="password"
                                className="block text-xs font-semibold text-blue-200/70 uppercase tracking-wider"
                            >
                                Mot de passe
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-blue-300/40" />
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    autoComplete="current-password"
                                    className="w-full pl-11 pr-12 py-3 bg-white/[0.06] border border-white/[0.08] rounded-xl text-white placeholder-blue-200/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-blue-300/40 hover:text-blue-200/70 transition-colors"
                                    tabIndex={-1}
                                    aria-label="Afficher/Masquer le mot de passe"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={isSubmitting || !username || !password}
                            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-blue-600/50 disabled:to-indigo-600/50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Connexion en cours...
                                </>
                            ) : (
                                <>
                                    <Lock className="w-4 h-4" />
                                    Se connecter
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-blue-200/30 mt-6">
                    © {new Date().getFullYear()} Shalom Ministry. Tous droits réservés.
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;
