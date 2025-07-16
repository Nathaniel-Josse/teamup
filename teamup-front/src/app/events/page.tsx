"use client";
import EventCardComponent from "@/components/events/eventCardComponent";
import AddOrUpdateEventComponent from "@/components/events/addOrUpdateEventComponent";
import { useEffect, useState } from "react";
import { hadUnsupportedValue } from "next/dist/build/analysis/get-page-static-info";
import { checkEventForm } from "@/helpers/checkForms";

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
        picture: string;
        title: string;
        starting_date: string;
        ending_date: string;
        location: string;
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

    const handleEventAddOrUpdate = async (form: any, pictureFile: File | null) => {
        if (checkEventForm(form) === true) {
            // Prepare FormData if there's a picture file
            let requestBody: BodyInit;
            const headers: HeadersInit = {};
            if (pictureFile) {
                const formData = new FormData();
                Object.entries(form).forEach(([key, value]) => {
                    formData.append(key, value as string | Blob);
                });
                formData.append("picture", pictureFile);
                requestBody = formData;
                // Do not set Content-Type header for FormData, browser will set it
            } else {
                requestBody = JSON.stringify(form);
                headers["Content-Type"] = "application/json";
            }

            if (form.is_new_event) {
                form.organizer_user_id = user?.id;
                delete form.is_new_event;
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/events`, {
                        method: 'POST',
                        headers,
                        body: requestBody,
                    });
                    const data = await res.json();
                    setEvents(prev => [...prev, data]);
                } catch (err) {
                    console.error("Erreur lors de l'ajout de l'événement:", err);
                }
            } else {
                form.organizer_user_id = user?.id;
                delete form.is_new_event;
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/events/${form.id}`, {
                        method: 'PUT',
                        headers,
                        body: requestBody,
                    });
                    const data = await res.json();
                    setEvents(prev => prev.map(event => event?.id === data.id ? data : event));
                } catch (err) {
                    console.error("Erreur lors de la mise à jour de l'événement:", err);
                }
            }
        }
    };

    return (
        <main className="container mx-auto p-4 flex flex-col items-center">
            {events.length === 0 ? (
                <div className="text-center text-gray-500 mt-10">Aucun événement trouvé.</div>
            ) : (
                events.map((event, idx) => (
                    <div key={idx} className="mb-8">
                        <EventCardComponent event={event} />
                    </div>
                ))
            )}
            {user && (
                <button
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={() => setShowForm((prev) => !prev)}
                >
                    {showForm ? "Fermer le formulaire" : "Ajouter un événement"}
                </button>
                )
            }
            {showForm && (
                <div className="mt-6">
                    <AddOrUpdateEventComponent event={null} onUpdate={handleEventAddOrUpdate} />
                    <div className="p-4 border rounded bg-gray-50">
                        Formulaire d&apos;ajout d&apos;événement ici.
                    </div>
                </div>
            )}
        </main>
    );
}