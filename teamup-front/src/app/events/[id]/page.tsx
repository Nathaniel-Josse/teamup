import EventDetailsClientComponent from "@/components/events/eventDetailsClientComponent";
import { notFound } from 'next/navigation';

// Helper to get the base URL for SSR context
function getBaseUrl() {
    if (typeof window !== 'undefined') {
        return '';
    }
    return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
}

// Helper to fetch the event data with proper error handling
async function getEvent(id: string) {
    try {
        console.log(`Fetching event with ID: ${id}`);
        const baseUrl = getBaseUrl();
        const res = await fetch(`${baseUrl}/api/events/${id}`, {
            next: { revalidate: 60 },
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        console.log(`Event fetch response status: ${res.status}`);
        
        if (!res.ok) {
            if (res.status === 404) {
                console.log(`Event not found: ${id}`);
                return null;
            }
            throw new Error(`HTTP error status: ${res.status}`);
        }
        
        const data = await res.json();
        console.log(`Event fetched successfully:`, data);
        return data;
    } catch (error) {
        console.error(`Error fetching event ${id}:`, error);
        return null;
    }
}

// Helper to fetch organizer data with error handling
async function getOrganizer(organizerUserId: string) {
    if (!organizerUserId) {
        console.log('No organizer user ID provided');
        return null;
    }
    
    try {
        console.log(`Fetching organizer profile for user: ${organizerUserId}`);
        const baseUrl = getBaseUrl();
        
        // First, get the user's profile ID
        const userRes = await fetch(`${baseUrl}/api/profiles/user/${organizerUserId}`, {
            next: { revalidate: 300 },
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!userRes.ok) {
            console.log(`User profile not found for: ${organizerUserId}`);
            return null;
        }
        
        const userData = await userRes.json();
        if (!userData?.profile_id) {
            console.log(`No profile_id found for user: ${organizerUserId}`);
            return null;
        }
        
        // Then get the actual profile data
        const profileRes = await fetch(`${baseUrl}/api/profiles/${userData.profile_id}`, {
            next: { revalidate: 300 },
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!profileRes.ok) {
            console.log(`Profile not found for profile_id: ${userData.profile_id}`);
            return null;
        }
        
        const profileData = await profileRes.json();
        console.log(`Organizer profile fetched successfully`);
        return profileData;
    } catch (error) {
        console.error(`Error fetching organizer for user ${organizerUserId}:`, error);
        return null;
    }
}

// Helper to fetch sport data with error handling
async function getSport(sportId: number) {
    if (!sportId) {
        console.log('No sport ID provided');
        return null;
    }
    
    try {
        console.log(`Fetching sport with ID: ${sportId}`);
        const baseUrl = getBaseUrl();
        const res = await fetch(`${baseUrl}/api/sports/${sportId}`, {
            next: { revalidate: 3600 },
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!res.ok) {
            console.log(`Sport not found: ${sportId}`);
            return null;
        }
        
        const sportData = await res.json();
        console.log(`Sport fetched successfully`);
        return sportData;
    } catch (error) {
        console.error(`Error fetching sport ${sportId}:`, error);
        return null;
    }
}

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        
        if (!id) {
            console.error('No event ID provided');
            notFound();
        }

        console.log(`Loading event page for ID: ${id}`);
        
        // Fetch the main event first
        const currentEvent = await getEvent(id);
        
        if (!currentEvent) {
            console.log(`Event not found: ${id}`);
            notFound();
        }

        // Now fetch related data in parallel
        const [currentOrganizer, currentSport] = await Promise.allSettled([
            getOrganizer(currentEvent.organizer_user_id),
            getSport(currentEvent.sport_id),
        ]);

        // Extract values from Promise.allSettled results
        const organizer = currentOrganizer.status === 'fulfilled' ? currentOrganizer.value : null;
        const sport = currentSport.status === 'fulfilled' ? currentSport.value : null;

        if (currentOrganizer.status === 'rejected') {
            console.error('Failed to fetch organizer:', currentOrganizer.reason);
        }
        if (currentSport.status === 'rejected') {
            console.error('Failed to fetch sport:', currentSport.reason);
        }

        console.log(`Event page data loaded successfully for ID: ${id}`);

        return (
            <EventDetailsClientComponent 
                currentEvent={currentEvent} 
                currentOrganizer={organizer} 
                currentSport={sport} 
            />
        );
    } catch (error) {
        console.error('Error in EventPage component:', error);
        // Return a fallback UI or re-throw to trigger error boundary
        throw new Error('Failed to load event page');
    }
}