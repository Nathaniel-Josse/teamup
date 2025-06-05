"use client";

import { useState } from "react";

export default function SignUpComponent() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            if (!res.ok) {
                throw new Error("Erreur lors de l'inscription. Veuillez réessayer.");
            }
            window.location.href = "/";
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="w-full max-w-lg bg-gray-900 rounded-2xl shadow-2xl p-12 border border-gray-800">
                <h2 className="text-4xl font-extrabold text-center mb-10 text-white tracking-tight">Inscription</h2>
                <form onSubmit={handleSubmit} className="space-y-8">
                    {error && (
                        <div className="bg-red-900/70 text-red-300 px-6 py-3 rounded mb-6 text-center font-medium">
                            {error}
                        </div>
                    )}
                    <div className="space-y-2">
                        <label className="block text-lg font-semibold text-gray-200">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            autoComplete="username"
                            className="w-4/5 px-5 py-4 border border-gray-700 rounded-lg bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                            placeholder="Votre email"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-lg font-semibold text-gray-200">Mot de passe</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                            className="w-4/5 px-5 py-4 border border-gray-700 rounded-lg bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                            placeholder="Votre mot de passe"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-2/5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xl font-bold rounded-lg"
                    >
                        {loading ? "Inscription en cours..." : "S'inscrire"}
                    </button>
                </form>
                <div className="mt-10 text-center">
                    <p className="text-base text-gray-300">
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