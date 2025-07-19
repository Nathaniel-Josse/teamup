"use client";
import EventCardComponent from "@/components/events/eventCardComponent";
import { useEffect, useState } from "react";

export default function NearestEventsPage() {
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

    const [events, setEvents] = useState<Event[]>([]);
    const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!userLocation) return;
        setIsLoading(true);
        const fetchNearestEvents = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/events?lat=${userLocation.lat}&lon=${userLocation.lon}`
                );
                if (!res.ok) throw new Error("Erreur lors de la récupération des événements proches.");
                const data = await res.json();
                setEvents(data);
            } catch {
                setEvents([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchNearestEvents();
    }, [userLocation]);

    const askLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setUserLocation({
                        lat: pos.coords.latitude,
                        lon: pos.coords.longitude,
                    });
                },
                () => {
                    // Redirect to events page if location access is denied
                    window.location.href = "/events";
                }
            );
        } else {
            alert("La géolocalisation n'est pas supportée par votre navigateur.");
        }
    };

    return (
        <main className="container mx-auto p-4 flex flex-col items-center min-h-screen w-full">
            <h1 className="text-2xl font-bold mb-6">Événements proches de chez vous</h1>
            {!userLocation ? (
            <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={askLocation}
            >
                Autoriser la localisation
            </button>
            ) : isLoading ? (
            <div className="text-center text-gray-500 mt-10">Chargement des événements...</div>
            ) : events.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">Aucun événement trouvé près de chez vous.</div>
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