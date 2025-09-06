"use client";

import React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import EventCardComponent from "@/components/events/eventCardComponent";
import Spinner from "@/components/spinner";
import { checkEventForm } from "@/helpers/checkForms";
import dynamic from 'next/dynamic';

const AddOrUpdateEventComponent = dynamic(() => import('@/components/events/addOrUpdateEventComponent'), {
  ssr: false,
});

const ShowEventMapComponent = dynamic(() => import('@/components/events/showEventMapComponent'), {
  ssr: false,
});

type Status = 'open' | 'closed' | 'done' | 'cancelled';

type Event = {
    id: number;
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
    id: string,
    user_id: string,
    fav_sport_id: number,
    first_name: string,
    last_name: string,
    birth_date: string,
    level: string,
    availability: string,
    created_at: string,
    updated_at: string
};

type Sport = {
    id: number;
    label: string;
};

// Helper to fetch the CSRF token
async function getCsrfToken() {
    const res = await fetch(`/api/csrf-token`, {
        credentials: "include",
    });
    const data = await res.json();
    return data.csrfToken;
}

export default function EventDetailsClientComponent({ currentEvent, currentOrganizer, currentSport }: any) {
    const [event] = useState<Event>(currentEvent);
    const [userId, setUserId] = useState<string | null>(null);
    const [organizer] = useState<Organizer>(currentOrganizer);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isOrganizer, setIsOrganizer] = useState<boolean>(false);
    const [isRegistered, setIsRegistered] = useState<boolean>(false);
    const [showForm, setShowForm] = useState<boolean>(false);
    const [sport] = useState<Sport>(currentSport);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [currentAttendees, setCurrentAttendees] = useState<any[]>([]);
    const [hasProfile, setHasProfile] = useState<boolean>(true); // default true for loading
    const [showProfilePopup, setShowProfilePopup] = useState<boolean>(false);

    useEffect(() => {
        const checkUserProfile = async () => {
            console.log("Checking user profile...");
            const userStr = localStorage.getItem("user");
            if (!userStr) {
                setHasProfile(false);
                return;
            }
            const currentUser = JSON.parse(userStr);
            setUserId(currentUser.id);
            try {
                const res = await fetch(`/api/profiles/user/${currentUser.id}`);
                if (!res.ok) throw new Error("Erreur lors de la vérification du profil utilisateur.");
                const data = await res.json();
                setHasProfile(!!data.exists);
            } catch {
                setHasProfile(false);
            }
        };
        checkUserProfile();

        // Check if the current user is the organizer
        const organizerChecks = async () => {
            const currentUserId = JSON.parse(localStorage.getItem("user") || "{}").id;
            setUserId(currentUserId);
            const isUserOrganizer = organizer?.user_id === currentUserId;
            setIsOrganizer(isUserOrganizer);
            if(!isUserOrganizer) {
                // If the user is not the organizer, we check if the user is registered to the event
                const regRes = await fetch(`/api/events/${event?.id}/users/${currentUserId}/registered`);
                if (regRes.ok) {
                    const regData = await regRes.json();
                    setIsRegistered(regData.registered);
                }
            } else {
                // Fetch all attendees if the user is the organizer
                const attendeesRes = await fetch(`/api/events/${event?.id}/users/${currentUserId}/all`);
                if (attendeesRes.ok) {
                    const attendeesData = await attendeesRes.json();
                    setCurrentAttendees(attendeesData.registrations);
                }
            }
        }
        organizerChecks().then(() => {
            setIsLoading(false);
        });
    }, [event?.id, organizer?.id]);

    const handleRegister = async () => {
        if (!hasProfile) {
            setShowProfilePopup(true);
            return;
        }
        const csrfToken = await getCsrfToken();
        const res = await fetch(
            `/api/events/${event?.organizer_user_id}/register`,
            {
                method: "POST",
                body: JSON.stringify({
                    eventId: event?.id,
                    userId: userId,
                }),
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": csrfToken,
                },
                credentials: "include",
            }
        );
        if (res.ok) {
            alert("Inscription réussie !");
            setIsRegistered(true);
        } else {
            alert("Échec de l'inscription.");
        }
    };

    const handleUnregister = async () => {
        const csrfToken = await getCsrfToken();
        const res = await fetch(
            `/api/events/${event?.id}/users/${userId}/unregister`,
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": csrfToken,
                },
                credentials: "include",
            }
        );
        if (res.ok) {
            alert("Vous êtes désormais désinscrit de l'événement.");
            setIsRegistered(false);
        } else {
            alert("Échec de la désinscription.");
        }
    };

    const handleUpdateEvent = async (form: any, pictureFile: File | null) => {
        if (checkEventForm(form) === true) {
            let requestBody: BodyInit;
            const headers: HeadersInit = {};
            const csrfToken = await getCsrfToken();
            const formData = new FormData();
            Object.entries(form).forEach(([key, value]) => {
                formData.append(key, value as string | Blob);
            });
            formData.append("userId", userId || "");
            if (pictureFile) {
                formData.append("picture", pictureFile);
                requestBody = formData;
            } else {
                requestBody = JSON.stringify(Object.fromEntries(formData));
                headers["Content-Type"] = "application/json";
            }
            headers["X-CSRF-Token"] = csrfToken;

            console.log("Form data to be sent:", form);
            try {
                await fetch(`/api/events/${event?.id}`, {
                    method: 'PUT',
                    headers,
                    body: requestBody,
                    credentials: "include",
                }).then((response) => {
                    if (!response.ok) {
                        throw new Error("Erreur lors de la mise à jour de l'événement.");
                    }
                    alert("Événement mis à jour avec succès !");
                    window.location.reload();
                });
            } catch (err) {
                console.error("Erreur lors de la mise à jour de l'événement:", err);
            }
        }
    };

    const handleDeleteEvent = async () => {
        const csrfToken = await getCsrfToken();
        const res = await fetch(`/api/events/${event?.id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": csrfToken,
            },
            body: JSON.stringify({ userId }),
            credentials: "include",
        });
        if (res.ok) {
            alert("Événement supprimé avec succès.");
            window.location.href = "/events";
        } else {
            alert("Échec de la suppression de l'événement.");
        }
        setShowDeletePopup(false);
    };

    if (!event) {
        return < Spinner />;
    }

    return (
            <div className="mb-4 flex flex-col items-center justify-between">
                <div className="flex items-center justify-between mb-4">
                    <Link href="/events" className="flex items-center text-blue-600 hover:underline">
                        <span className="mr-2">&#8592;</span> Retour aux événements
                    </Link>
                </div>
                <h1 className="text-2xl text-center font-bold mb-6">Cet événement a retenu votre curiosité ?</h1>
            { isLoading ? (
                <Spinner />
            ) : (
                <div>
                    <EventCardComponent event={{
                        id: event.id,
                        organizer_user_id: event.organizer_user_id,
                        sport_id: event.sport_id,
                        picture: event.picture,
                        title: event.title,
                        starting_date: event.starting_date,
                        ending_date: event.ending_date,
                        location: event.location,
                        lat: event.lat,
                        lon: event.lon,
                        max_attendees: event.max_attendees,
                        status: event.status,
                        description: event.description
                    }} />
                    <div className="bg-white text-black rounded-lg shadow p-6 mt-6">
                        <h2 className="text-xl font-bold mb-2 text-black">Détails de l&apos;événement</h2>
                        <p><span className="font-semibold">Organisateur :</span> {organizer ? organizer.first_name + " " + organizer.last_name : "Inconnu"}</p>
                        <p><span className="font-semibold">Sport :</span> {sport ? sport.label : event.sport_id}</p>
                        <div className="my-4">
                            <ShowEventMapComponent event={event} />
                        </div>
                        <p><span className="font-semibold">Nombre max de participants :</span> {event.max_attendees}</p>
                        <p><span className="font-semibold">Description :</span> {event.description}</p>

                        { isOrganizer ? (
                            <div className="mt-4 flex flex-col items-center">
                                <button
                                    className="px-4 py-2 text-white rounded"
                                    onClick={() => setShowForm((prev) => !prev)}
                                >
                                    {showForm ? "Fermer le formulaire" : "Modifier l'événement"}
                                </button>
                                {showForm && userId &&(
                                    <div>
                                        <AddOrUpdateEventComponent event={event} onUpdate={handleUpdateEvent} userId={userId} />
                                    </div>
                                )}
                                <button
                                    className="mt-4 ml-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                                    onClick={() => setShowDeletePopup(true)}
                                >
                                    Supprimer l&apos;événement
                                </button>
                                <div>
                                    <h3 className="text-lg mt-4 font-bold">Participants actuels : {currentAttendees?.length}</h3>
                                    <ol>
                                        {currentAttendees?.length > 0 ?
                                        currentAttendees.map((attendee) => (
                                            <li key={attendee.registration_id}>- {attendee.first_name ?? 'Prénom inconnu'} {attendee.last_name ?? 'Nom inconnu'} [Né le {attendee.birth_date ?? '?'}] ({attendee.email ?? 'Email inconnu'})</li>
                                        )) : (
                                            <li>Aucun participant inscrit</li>
                                        )}
                                    </ol>
                                </div>
                                {showDeletePopup && (
                                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                                        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
                                            <h3 className="text-lg font-bold mb-4">Confirmer la suppression</h3>
                                            <p className="mb-6">Voulez-vous vraiment supprimer cet événement ? Cette action est irréversible.</p>
                                            <div className="flex justify-center gap-4">
                                                <button
                                                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                                    onClick={() => setShowDeletePopup(false)}
                                                >
                                                    Annuler
                                                </button>
                                                <button
                                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                                    onClick={handleDeleteEvent}
                                                >
                                                    Supprimer
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>
                            {isRegistered ? (
                                <div className="flex flex-col items-center">
                                    <button
                                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                                        onClick={handleUnregister}
                                    >
                                        Se désinscrire de l&apos;événement
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <button
                                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                        onClick={handleRegister}
                                    >
                                        S&apos;inscrire à l&apos;événement
                                    </button>
                                </div>
                            )}
                            </div>
                        )}
                    </div>
                </div>
            )}
            {showProfilePopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
                        <h3 className="text-lg font-bold mb-4 text-black">Profil requis</h3>
                        <p className="mb-6 text-black">Vous devez créer un profil avant de pouvoir vous inscrire à un événement.</p>
                        <div className="flex justify-center gap-4">
                            <button
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                onClick={() => setShowProfilePopup(false)}
                            >
                                Annuler
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                onClick={() => window.location.href = "/my-account"}
                            >
                                Créer mon profil
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
        );
    }