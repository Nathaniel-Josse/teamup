"use client";

import { useState } from "react";
import LogoComponent from "../logoComponent";

export default function SignUpComponent() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [subrole, setSubrole] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [authorized, setAuthorized] = useState(false);

    const isFormValid =
        email.trim() !== "" &&
        password.trim() !== "" &&
        subrole.trim() !== "" &&
        authorized;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, subrole }),
            });
            if (!res.ok) {
                throw new Error("Erreur lors de l'inscription. Veuillez réessayer.");
            }
            window.location.href = "/auth/login";
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Une erreur inconnue est survenue.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center bg-page-background">
            <div className="max-w-lg mx-auto shadow-md main-page-background rounded-lg p-6 space-y-6 border border-gray-800 w-full">
                <LogoComponent />
                <form onSubmit={handleSubmit} className="space-y-8">
                    {error && (
                        <div className="bg-red-900/70 text-red-300 px-6 py-3 rounded mb-6 text-center font-medium">
                            {error}
                        </div>
                    )}
                    <div className="flex flex-col items-center">
                        <label className="block text-lg font-semibold text-black w-full text-center mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            autoComplete="username"
                            className="w-4/5 border border-gray-700 rounded px-2 py-1 flex-1 text-black"
                            placeholder="Votre email"
                        />
                    </div>
                    <div className="flex flex-col items-center">
                        <label className="block text-lg font-semibold text-black w-full text-center mb-1">Mot de passe</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                            className="w-4/5 border border-gray-700 rounded px-2 py-1 flex-1 text-black"
                            placeholder="Votre mot de passe"
                        />
                    </div>
                    <div className="flex flex-col items-center">
                        <label className="block text-lg font-semibold text-black w-full text-center mb-1">Quel rôle avez-vous dans le sport ?</label>
                        <input
                            type="text"
                            value={subrole}
                            onChange={e => setSubrole(e.target.value)}
                            required
                            className="w-4/5 border border-gray-700 rounded px-2 py-1 flex-1 text-black"
                            placeholder="Votre rôle dans le sport"
                        />
                        <small className="text-gray-800 mt-2">
                            Ex : Joueur, Entraîneur, Coach, Arbitre, Supporter, etc.
                        </small>
                    </div>
                    <div className="flex items-center mt-2">
                        <input
                            type="checkbox"
                            id="authorize"
                            checked={authorized}
                            onChange={e => setAuthorized(e.target.checked)}
                            className="w-5 h-5 mr-2 accent-blue-700"
                        />
                        <label htmlFor="authorize" className="text-sm text-black select-none">
                            J&apos;ai pris connaissance de la <a href="/privacy" className="text-blue-400 hover:underline font-semibold">politique de confidentialité</a> et des <a href="/terms" className="text-blue-400 hover:underline font-semibold">conditions d&apos;utilisation</a> de TeamUp et les accepte.
                        </label>
                    </div>
                    <div className="flex flex-col items-center mt-4">
                        <button
                            type="submit"
                            disabled={loading || !isFormValid}
                            className="w-3/5 p-2 bg-blue-700 hover:bg-blue-800 text-white text-xl font-bold rounded disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? "Inscription en cours..." : "S'inscrire"}
                        </button>
                    </div>
                </form>
                <div className="mt-10 text-center">
                    <p className="text-base text-black">
                        Déjà un compte ?{" "}
                        <a href="/auth/login" className="text-blue-400 hover:underline font-semibold">
                            Se connecter
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}