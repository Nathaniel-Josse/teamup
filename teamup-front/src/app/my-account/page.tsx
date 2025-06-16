'use client'

import { useEffect, useState } from "react";
import UserInfosComponent from "@/components/my-account/userInfosComponent";

type UserInfo = {
    id: string;
    email: string;
    password: string;
    subrole: string;
};

export default function MyAccountMainPage() {
    const [user, setUser] = useState<UserInfo | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const userStr = localStorage.getItem("user");
            if (userStr) {
                setUser(JSON.parse(userStr));
            } else {
                window.location.href = "/login";
            }
        }
    }, []);

    const handleUserUpdate = async (updated: Partial<UserInfo>) => {
        if (!user) return;
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${user.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(updated),
                }
            );
            const data = await res.json();
            if (res.ok) {
                setUser(prev => prev ? { ...prev, ...updated } : prev);
                setMessage("Mise à jour réussie !");
                // Optionally update localStorage
                localStorage.setItem("user", JSON.stringify({ ...user, ...updated }));
            } else {
                setMessage(data.message || "Erreur lors de la mise à jour.");
            }
        } catch (err) {
            if (err instanceof Error) {
                setMessage(err.message);
            } else {
                setMessage("Une erreur inconnue est survenue.");
            }
        }
    };

    if (!user) return null; // Optionally show a loader

    return (
        <div className="text-center">
            <h1>Mon Compte</h1>
            {message && <div className="mb-4 text-green-600">{message}</div>}
            <UserInfosComponent user={user} onUpdate={handleUserUpdate} />
        </div>
    );
}

