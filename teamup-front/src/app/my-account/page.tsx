'use client'

import { useEffect, useState } from "react";
import styles from "./my-account.module.css";
import UserInfosComponent from "@/components/my-account/userInfosComponent";
import NoProfileYetComponent from "@/components/my-account/noProfileYetComponent";
import ProfileComponent from "@/components/my-account/profileComponent";
import Spinner from "@/components/spinner";

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
    level: { id: string; label: string };
    availability: { id: string; label: string };
};

// Helper to fetch CSRF token
async function getCsrfToken() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/csrf-token`, {
        credentials: "include",
    });
    const data = await res.json();
    return data.csrfToken;
}

export default function MyAccountMainPage() {
    const [user, setUser] = useState<UserInfo | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [noProfile, setNoProfile] = useState<boolean>(false);
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const getProfile = async (user: UserInfo) => {
            // CHECK 1 : does the user's profile exist?
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

                // CHECK 2 : Fetch complete profile
                await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/profiles/${data.profile_id}`
                ).then(async res => {
                    if (!res.ok) {
                        throw new Error("Erreur lors de la récupération du profil.");
                    }
                    const profileData = await res.json();
                    setProfile(profileData);
                });

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
            const currentUser = JSON.parse(userStr)
            setUser(currentUser);
            getProfile(currentUser).then(() => {
                setIsLoading(false)
            });
        }
    }, []);

    const handleUserUpdate = async (updated: Partial<UserInfo>) => {
        if (!user) return;
        try {
            const csrfToken = await getCsrfToken();
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${user.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-Token": csrfToken,
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
            const csrfToken = await getCsrfToken();
            const res = profile?.id ?
                await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/profiles/${profile.id}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            "X-CSRF-Token": csrfToken,
                        },
                        body: JSON.stringify(updated),
                        credentials: "include"
                    }
                ) :
                await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/profiles`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-CSRF-Token": csrfToken,
                        },
                        body: JSON.stringify({ user_id: user.id, ...updated }),
                    }
                );

            const data = await res.json();
            if (res.ok) {
                setProfile((prev: UserProfile | null) => prev ? { ...prev, ...updated } : prev);
                setMessage("Profil mis à jour avec succès !");
                window.location.reload();
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
            {isLoading ? (
                <Spinner />
            ) : (
                <div>
                    {noProfile && (
                        <NoProfileYetComponent />
                    )}

                    <div className="mb-4">
                        {message && <div className={styles.messageBox}>{message}</div>}
                        <UserInfosComponent user={user} onUpdate={handleUserUpdate} />
                    </div>

                    <ProfileComponent profile={profile} onUpdate={handleProfileUpdate} />
                </div>
            )}
        </div>
    );
}

