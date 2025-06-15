"use client";

import { env } from "process";
import { useState } from "react";

export default function LoginComponent() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            if (!res.ok) {
                throw new Error("Identifiants invalides. Veuillez réessayer.");
            }
            const data = await res.json();
            localStorage.setItem("token", data.body.token);
            localStorage.setItem("user", JSON.stringify(data.body.user));
            console.log(data)
            window.location.href = `/my-account`;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="w-full max-w-lg bg-gray-900 rounded-2xl shadow-2xl p-12 border border-gray-800">
                <h2 className="text-4xl font-extrabold text-center mb-10 text-white tracking-tight">Connexion</h2>
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
                            autoComplete="current-password"
                            className="w-4/5 px-5 py-4 border border-gray-700 rounded-lg bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                            placeholder="Votre mot de passe"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-2/5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xl font-bold rounded-lg"
                    >
                        {loading ? "Connexion en cours..." : "Connexion"}
                    </button>
                </form>
                <div className="mt-10 text-center">
                    <p className="text-base text-gray-300">
                        Pas encore de compte ?{" "}
                        <a href="/auth/signup" className="text-blue-400 hover:underline font-semibold">
                            S'inscrire
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}