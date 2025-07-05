'use client'

import { useEffect, useState } from "react";
import styles from "./my-account.module.css";
import UserInfosComponent from "@/components/my-account/userInfosComponent";
import NoProfileYetComponent from "@/components/my-account/noProfileYetComponent";
import ProfileComponent from "@/components/my-account/profileComponent";

type UserInfo = {
    id: string;
    email: string;
    password: string;
    subrole: string;
};

type UserProfile = {
    id: string;
    user_id: string;
    first_name: string;
    last_name: string;
    birth_date?: string | null;
    fav_sport_id: number;
    level: 'beginner' | 'intermediate' | 'expert';
    availability: 'weekday' | 'weekend' | 'both';
};

export default function MyAccountMainPage() {
    const [user, setUser] = useState<UserInfo | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [noProfile, setNoProfile] = useState<boolean>(false);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        const getProfile = async () => {
        
            // CHECK 1 : Est-ce que le profil de l'utilisateur existe ?

            if (!user) return;
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/profiles/user/${user.id}`
                )
                if (!res.ok) {
                    throw new Error("Erreur lors de la récupération du profil.");
                }
                const data = await res.json();
                
                if (!data.exists) {
                    setNoProfile(true);
                    return;
                }
                setNoProfile(false);

                // CHECK 2 : Récupération du profil complet

                const profileRes = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/profiles/${data.profileId}`
                );

                if (!profileRes.ok) {
                    throw new Error("Erreur lors de la récupération du profil.");
                }
                const profileData = await profileRes.json();
                setProfile(profileData);
            } catch (err) {
                if (err instanceof Error) {
                    setMessage(err.message);
                } else {
                    setMessage("Une erreur inconnue est survenue.");
                }
            } 
        }

        if (typeof window !== "undefined") {
            const userStr = localStorage.getItem("user");
            if (!userStr) {
                window.location.href = "/auth/login";
                return;
            }
            setUser(JSON.parse(userStr));
            getProfile();
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

    const handleProfileUpdate = async (updated: Partial<UserProfile>) => {
        if (!user) return;
        try {
            const res = profile?.id ? 
            await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/profiles/${profile.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(updated),
                }
            ) :
            await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/profiles`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ user_id: user.id, ...updated }),
                }
            ); 
            
            const data = await res.json();
            if (res.ok) {
                setProfile((prev: UserProfile | null) => prev ? { ...prev, ...updated } : prev);
                setMessage("Profil mis à jour avec succès !");
            } else {
                setMessage(data.message || "Erreur lors de la mise à jour du profil.");
            }
        } catch (err) {
            if (err instanceof Error) {
                setMessage(err.message);
            } else {
                setMessage("Une erreur inconnue est survenue.");
            }
        }
    }

    if (!user) return null;

    return (
        <div className="text-center">
            <h1>Mon Compte</h1>

            {noProfile && (
                <NoProfileYetComponent />
            )}

            <div className="mb-4">
                {message && <div className={styles.messageBox}>{message}</div>}
                <UserInfosComponent user={user} onUpdate={handleUserUpdate} />
            </div>

            <ProfileComponent profile={profile} onUpdate={handleProfileUpdate} />
        </div>
    );
}

