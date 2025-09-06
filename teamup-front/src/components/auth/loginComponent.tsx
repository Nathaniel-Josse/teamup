"use client";

import { useState } from "react";
import LogoComponent from "../logoComponent";
import Link from "next/link";

export default function LoginComponent() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    type LoginResponse = {
        body: {
            token: string;
            user: { id: string; email: string; role: string; subrole: string }
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            if (!res.ok) {
                throw new Error("Identifiants invalides. Veuillez réessayer.");
            }
            const data: LoginResponse = await res.json();
            localStorage.setItem("token", data.body.token);
            localStorage.setItem("user", JSON.stringify(data.body.user));
            window.location.href = `/my-account`;
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
                <Link href="/home">
                    <LogoComponent />
                </Link>
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
                            autoComplete="current-password"
                            className="w-4/5 border border-gray-700 rounded px-2 py-1 flex-1 text-black"
                            placeholder="Votre mot de passe"
                        />
                    </div>
                    <div className="flex flex-col items-center mt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-3/5 p-2 bg-blue-700 hover:bg-blue-800 text-white text-xl font-bold rounded"
                        >
                            {loading ? "Connexion en cours..." : "Connexion"}
                        </button>
                    </div>
                </form>
                <div className="mt-10 text-center">
                    <p className="text-base text-black">
                        Pas encore de compte ?{" "}
                        <a href="/auth/signup" className="text-blue-400 hover:underline font-semibold">
                            S&apos;inscrire
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}