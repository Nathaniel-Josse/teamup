"use client";
import EventCardComponent from "@/components/events/eventCardComponent";
import { useEffect, useState } from "react";
import { checkEventForm } from "@/helpers/checkForms";
import dynamic from 'next/dynamic';

const AddOrUpdateEventComponent = dynamic(() => import('@/components/events/addOrUpdateEventComponent'), {
  ssr: false, // Disable server-side rendering for this component
});

export default function Events() {
    type UserInfo = {
        id: string;
        email: string;
        password: string;
        subrole: string;
    };

    type Status = 'open' | 'closed' | 'done' | 'cancelled';

    type Event = {
        id: number;
        sport_id: number;
        organizer_user_id: string;
        picture: string;
        title: string;
        description: string;
        starting_date: string;
        ending_date: string;
        location: string;
        lat: number;
        lon: number;
        max_attendees: number;
        status: Status;
    };

    const [user, setUser] = useState<UserInfo | null>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const userStr = localStorage.getItem("user");
            if (!userStr) {
                window.location.href = "/auth/login";
                return;
            }
            setUser(JSON.parse(userStr));
        }
    }, []);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/events`);
                if (!res.ok) throw new Error("Erreur lors de la récupération des événements.");
                const data = await res.json();
                setEvents(data);
            } catch {
                setEvents([]);
            }
        };
        fetchEvents();
    }, []);

    const handleAddEvent = async (form: any, pictureFile: File | null) => {
        if (checkEventForm(form) === true) {
            let requestBody: BodyInit;
            const headers: HeadersInit = {};
            const csrfToken = await getCsrfToken();

            if (pictureFile) {
                const formData = new FormData();
                Object.entries(form).forEach(([key, value]) => {
                    formData.append(key, value as string | Blob);
                });
                formData.append("picture", pictureFile);
                formData.append("organizer_user_id", user?.id || "");
                requestBody = formData;
            } else {
                requestBody = JSON.stringify(form);
                headers["Content-Type"] = "application/json";
            }

            // Always add the CSRF token header
            headers["X-CSRF-Token"] = csrfToken;

            try {
                await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/events`, {
                    method: 'POST',
                    headers,
                    body: requestBody,
                    credentials: "include",
                }).then((response) => {
                    if (!response.ok) {
                        throw new Error("Erreur lors de l'ajout de l'événement.");
                    }
                    alert("Événement ajouté avec succès !");
                    window.location.reload();
                });
            } catch (err) {
                console.error("Erreur lors de l'ajout de l'événement:", err);
            }
        }
    };

    async function getCsrfToken() {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/csrf-token`, {
            credentials: "include",
        });
        const data = await res.json();
        return data.csrfToken;
    }

    return (
        <main className="container mx-auto p-4 flex flex-col items-center">
            <h1 className="text-2xl font-bold mb-6">Événements</h1>
            <div className="mb-6 flex flex-col items-center">
                {user && (
                    <button
                        className="px-4 py-2 text-white rounded"
                        onClick={() => setShowForm((prev) => !prev)}
                    >
                        {showForm ? "Fermer le formulaire" : "Ajouter un événement"}
                    </button>
                    )
                }
                <button
                    className="px-4 py-2 rounded mt-4"
                    onClick={() => window.location.href = "/events/nearby"}
                >
                    Près de chez vous 🔍
                </button>
                {showForm && user && (
                    <div>
                        <AddOrUpdateEventComponent event={null} onUpdate={handleAddEvent} userId={user.id} />
                    </div>
                )}
            </div>
            {events.length === 0 ? (
                <div className="text-center text-gray-500 mt-10">Aucun événement trouvé.</div>
            ) : (
                events.map((event, idx) => (
                    <a href={`/events/${event.id}`} key={idx} className="mb-8 block">
                        <EventCardComponent event={event} />
                    </a>
                ))
            )}
        </main>
    );
}