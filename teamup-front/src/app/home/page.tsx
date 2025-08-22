"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import LogoComponent from "@/components/logoComponent";
import styles from "./home.module.css";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

// Dummy illustrations for sports events
const eventImages = [
    "/assets/images/football.webp",
    "/assets/images/basketball.webp",
    "/assets/images/tennis.webp",
    "/assets/images/running.webp",
    "/assets/images/cycling.webp",
    "/assets/images/volleyball.webp",
];

export default function Home() {
    type UserInfo = {
        id: string;
        email: string;
        password: string;
        subrole: string;
    };

    const [user, setUser] = useState<UserInfo | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const userStr = localStorage.getItem("user");
            if (userStr) {
                setUser(JSON.parse(userStr));
            }
        }
    }, []);

    return (
        <main className="min-h-screen bg-page-background">
            {/* Navbar */}
            <nav className="w-full flex items-center justify-between px-8 py-4 bg-white shadow">
                <div>
                    <Link href="/">
                        <LogoComponent />
                    </Link>
                </div>
                <div>
                    {user ? (
                        <Link href="/my-account">
                            <button className="px-4 py-2 bg-button-primary text-white rounded hover:bg-blue-700 transition">
                                Mon compte
                            </button>
                        </Link>
                    ) : (
                        <Link href="/auth/login">
                            <button className="px-4 py-2 bg-button-primary text-white rounded hover:bg-blue-700 transition">
                                Se connecter
                            </button>
                        </Link>
                    )}
                </div>
            </nav>

            <h1 className="text-5xl font-bold text-center my-12 text-black">
                Bienvenue sur TeamUp!
            </h1>

            {/* Section 1: Events */}
            <section className={`relative py-16 px-8 bg-white overflow-hidden`}>
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-black">
                    Des événements qui n&apos;attendent que vous !
                </h2>
                {/* Static grid of illustrations */}
                <div className="relative z-10 flex justify-center mb-12">
                    <div className="grid grid-cols-3 gap-8">
                        {eventImages.map((img, idx) => (
                            <div key={idx} className="flex flex-col items-center">
                                <Image
                                    src={img}
                                    alt="Sport event"
                                    width={394}
                                    height={394}
                                    className="opacity-80"
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="relative z-10 flex justify-center mt-4">
                    <Link href="/events">
                        <button className="px-8 py-4 bg-blue-600 text-white text-xl font-bold rounded shadow hover:bg-blue-700 transition">
                            Voir les événements
                        </button>
                    </Link>
                </div>
            </section>

            {/* Section 2: Organize */}
            <section className={`py-16 px-8 bg-gray-50 flex flex-col items-center ${styles.eventsSectionBg}`}>
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-white">
                    Organisez-vous entre vous !
                </h2>
                <ChatBubbleLeftRightIcon className="h-40 w-40 text-center text-white mr-2" />
                <div className="flex justify-center">
                    <Link href="/chat">
                        <button className="px-8 py-4 bg-green-600 text-white text-xl font-bold rounded shadow hover:bg-green-700 transition">
                            Accéder au chat
                        </button>
                    </Link>
                </div>
            </section>

            {/* Section 3: TeamUp Bio */}
            <section className="py-16 px-8 bg-white flex flex-col items-center">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-black">
                    TeamUp!, une équipe de Sport Local passionnée !
                </h2>
                <p className="max-w-xl text-center text-gray-700 mb-8">
                    TeamUp! est né de la passion du sport local et du désir de rassembler les sportifs de tous horizons.
                    Notre équipe s&apos;engage à faciliter l&apos;organisation d&apos;événements, la rencontre entre passionnés, et à dynamiser la vie sportive locale.
                    Rejoignez-nous et faites partie d&apos;une communauté active et conviviale !
                </p>
                <LogoComponent />
            </section>
        </main>
    );
}