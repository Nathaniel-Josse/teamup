import EventDetailsClientComponent from "@/components/events/eventDetailsClientComponent";
import { notFound } from 'next/navigation';

// Helper to get the correct base URL for server-side rendering
function getBaseUrl() {
    // Check for explicitly set API URL
    if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, ''); // Remove trailing slash
    }
    
    // For Render deployment
    if (process.env.RENDER_EXTERNAL_URL) {
        return process.env.RENDER_EXTERNAL_URL.replace(/\/$/, '');
    }
    
    // Dev fallback to localhost
    const port = process.env.PORT || 3000;
    return `http://localhost:${port}`;
}

// Create a fetch wrapper for server-side requests
async function fetchWithContext(url: string, options?: RequestInit) {
    const baseUrl = getBaseUrl();
    const fullUrl = `${baseUrl}${url}`;
    
    try {
        const response = await fetch(fullUrl, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        });
        
        return response;
    } catch (error) {
        console.error(`Erreur lors de la récupération de ${fullUrl}:`, error);
        throw error;
    }
}

// Helper to fetch the event data
async function getEvent(id: string) {
    try {        
        const res = await fetchWithContext(`/api/events/${id}`, {
            next: { revalidate: 60 },
        });
        
        if (!res.ok) {
            if (res.status === 404) {
                return null;
            }
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        return data;
    } catch (error) {
        console.error(`Erreur lors de la récupération de l'événement ${id}:`, error);
        return null;
    }
}

// Helper to fetch organizer data
async function getOrganizer(organizerUserId: string) {
    if (!organizerUserId) {
        return null;
    }
    
    try {
        // Get user's profile ID
        const userRes = await fetchWithContext(`/api/profiles/user/${organizerUserId}`, {
            next: { revalidate: 300 },
        });
        
        if (!userRes.ok) {
            return null;
        }
        
        const userData = await userRes.json();
        if (!userData?.profile_id) {
            return null;
        }
        
        // Get actual profile data
        const profileRes = await fetchWithContext(`/api/profiles/${userData.profile_id}`, {
            next: { revalidate: 300 },
        });
        
        if (!profileRes.ok) {
            return null;
        }
        
        const profileData = await profileRes.json();
        return profileData;
    } catch (error) {
        console.error(`Erreur lors de la récupération de l'organisateur:`, error);
        return null;
    }
}

// Helper to fetch sport data
async function getSport(sportId: number) {
    if (!sportId) {
        return null;
    }
    
    try {        
        const res = await fetchWithContext(`/api/sports/${sportId}`, {
            next: { revalidate: 3600 },
        });
        
        if (!res.ok) {
            return null;
        }
        
        const sportData = await res.json();
        return sportData;
    } catch (error) {
        console.error(`Erreur lors de la récupération du sport:`, error);
        return null;
    }
}

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        
        if (!id) {
            console.error('Aucun ID d\'événement fourni');
            notFound();
        }
        
        // Fetch the main event first
        const currentEvent = await getEvent(id);
        
        if (!currentEvent) {
            notFound();
        }

        // Fetch related data in parallel
        const [currentOrganizer, currentSport] = await Promise.allSettled([
            getOrganizer(currentEvent.organizer_user_id),
            getSport(currentEvent.sport_id),
        ]);

        // Extract values from Promise.allSettled results
        const organizer = currentOrganizer.status === 'fulfilled' ? currentOrganizer.value : null;
        const sport = currentSport.status === 'fulfilled' ? currentSport.value : null;

        if (currentOrganizer.status === 'rejected') {
            console.error('Erreur lors de la récupération de l\'organisateur:', currentOrganizer.reason);
        }
        if (currentSport.status === 'rejected') {
            console.error('Erreur lors de la récupération du sport:', currentSport.reason);
        }

        return (
            <EventDetailsClientComponent 
                currentEvent={currentEvent} 
                currentOrganizer={organizer} 
                currentSport={sport} 
            />
        );
    } catch (error) {
        console.error('Erreur dans le composant EventPage:', error);
        throw new Error('Échec du chargement de la page de l\'événement');
    }
}