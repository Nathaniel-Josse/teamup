import EventDetailsClientComponent from "@/components/events/eventDetailsClientComponent";

// Helper to fetch the event data
async function getEvent(id: string) {
    const res = await fetch(`/api/events/${id}`);
    if (!res.ok) {
        throw new Error("Erreur lors de la récupération de l'événement.");
    }
    const data = await res.json();
    return data;
}

// Helper to fetch organizer data
async function getOrganizer(organizerUserId: string) {
    // ... your logic to fetch the organizer ...
    const res = await fetch(`/api/profiles/user/${organizerUserId}`);
    if (!res.ok) {
        return null;
    }
    const orgExistsData = await res.json();
    if (!orgExistsData) {
        return null;
    }
    const orgRes = await fetch(`/api/profiles/${orgExistsData.profile_id}`);
    if (!orgRes.ok) {
        return null;
    }
    return orgRes.json();
}

// Helper to fetch sport data
async function getSport(sportId: number) {
    // ... your logic to fetch the sport ...
    const res = await fetch(`/api/sports/${sportId}`);
    if (!res.ok) {
        return null;
    }
    return res.json();
}

export default async function EventPage({ params }: any) {
    const { id } = params;

    const currentEvent = await getEvent(id);

    // Now you have the event, you can fetch the related data
    const [currentOrganizer, currentSport] = await Promise.all([
        getOrganizer(currentEvent.organizer_user_id),
        getSport(currentEvent.sport_id),
    ]);

    return <EventDetailsClientComponent currentEvent={currentEvent} currentOrganizer={currentOrganizer} currentSport={currentSport} />;
}