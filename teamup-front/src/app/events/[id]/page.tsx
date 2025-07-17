"use client";
import { useEffect, useState } from "react";
import EventCardComponent from "@/components/events/eventCardComponent";

type Status = 'open' | 'closed' | 'done' | 'cancelled';

type Event = {
    organizer_user_id: string;
    sport_id: number;
    title: string;
    starting_date: string;
    ending_date: string;
    location: string;
    lat: number;
    lon: number;
    max_attendees: number;
    status: Status;
    description: string;
    picture: string;
};

type Organizer = {
    id: string;
    email: string;
    subrole: string;
};

type Sport = {
    id: number;
    label: string;
};

export default function EventPage({ params }: { params: { id: string } }) {
    const [event, setEvent] = useState<Event | null>(null);
    const [organizer, setOrganizer] = useState<Organizer | null>(null);
    const [sport, setSport] = useState<Sport | null>(null);

    const handleRegister = async () => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/event/${event.organizer_user_id}/register`,
            { method: "POST" }
        );
        if (res.ok) {
            alert("Inscription réussie !");
        } else {
            alert("Échec de l'inscription.");
        }
    }

    useEffect(() => {
        const fetchEvent = async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/events/${params.id}`);
            if (!res.ok) return;
            const data = await res.json();
            setEvent(data);

            // Fetch organizer info
            const orgRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/profiles/user/${data.organizer_user_id}`);
            if (orgRes.ok) {
                const orgData = await orgRes.json();
                setOrganizer(orgData);
            }

            // Fetch sport info
            const sportRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sports/${data.sport_id}`);
            if (sportRes.ok) {
                const sportData = await sportRes.json();
                setSport(sportData);
            }
        };
        fetchEvent();
    }, [params.id]);

    if (!event) {
        return <div className="text-center mt-10 text-gray-500">Chargement de l&apos;événement...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto mt-10">
            <EventCardComponent event={{
                picture: event.picture,
                title: event.title,
                starting_date: event.starting_date,
                ending_date: event.ending_date,
                location: event.location,
                status: event.status,
            }} />
            <div className="bg-white rounded-lg shadow p-6 mt-6">
                <h2 className="text-xl font-bold mb-2">Détails de l&apos;événement</h2>
                <p><span className="font-semibold">Organisateur :</span> {organizer ? organizer.email : "Inconnu"}</p>
                <p><span className="font-semibold">Rôle :</span> {organizer ? organizer.subrole : "Inconnu"}</p>
                <p><span className="font-semibold">Sport :</span> {sport ? sport.label : event.sport_id}</p>
                <p><span className="font-semibold">Latitude :</span> {event.lat}</p>
                <p><span className="font-semibold">Longitude :</span> {event.lon}</p>
                <p><span className="font-semibold">Nombre max de participants :</span> {event.max_attendees}</p>
                <p><span className="font-semibold">Description :</span> {event.description}</p>

                <button
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    onClick={handleRegister}
                >
                    Inscription
                </button>
            </div>
        </div>
        );
    }