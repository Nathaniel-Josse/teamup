import EventDetailsClientComponent from "@/components/events/eventDetailsClientComponent";
import { notFound } from 'next/navigation';

// Helper to get the correct base URL for different contexts
function getBaseUrl() {
    // Client-side: use relative URLs
    if (typeof window !== 'undefined') {
        return '';
    }
    
    // Server-side: we need absolute URLs
    
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

// Create a fetch wrapper that handles SSR vs client-side differences
async function fetchWithContext(url: string, options?: RequestInit) {
    const baseUrl = getBaseUrl();
    const fullUrl = baseUrl ? `${baseUrl}${url}` : url;
    
    console.log(`Fetching: ${fullUrl} (base: ${baseUrl}, relative: ${url})`);
    
    try {
        const response = await fetch(fullUrl, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        });
        
        console.log(`Response: ${response.status} for ${fullUrl}`);
        return response;
    } catch (error) {
        console.error(`Fetch error for ${fullUrl}:`, error);
        throw error;
    }
}

// Helper to fetch the event data
async function getEvent(id: string) {
    try {
        console.log(`Fetching event with ID: ${id}`);
        
        const res = await fetchWithContext(`/api/events/${id}`, {
            next: { revalidate: 60 },
        });
        
        if (!res.ok) {
            if (res.status === 404) {
                console.log(`Event not found: ${id}`);
                return null;
            }
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        console.log(`Event fetched successfully`);
        return data;
    } catch (error) {
        console.error(`Error fetching event ${id}:`, error);
        return null;
    }
}

// Helper to fetch organizer data
async function getOrganizer(organizerUserId: string) {
    if (!organizerUserId) {
        return null;
    }
    
    try {
        console.log(`Fetching organizer profile for user: ${organizerUserId}`);
        
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
        console.error(`Error fetching organizer:`, error);
        return null;
    }
}

// Helper to fetch sport data
async function getSport(sportId: number) {
    if (!sportId) {
        return null;
    }
    
    try {
        console.log(`Fetching sport with ID: ${sportId}`);
        
        const res = await fetchWithContext(`/api/sports/${sportId}`, {
            next: { revalidate: 3600 },
        });
        
        if (!res.ok) {
            return null;
        }
        
        const sportData = await res.json();
        return sportData;
    } catch (error) {
        console.error(`Error fetching sport:`, error);
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
        console.log('Environment info:', {
            NODE_ENV: process.env.NODE_ENV,
            NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
            RENDER_EXTERNAL_URL: process.env.RENDER_EXTERNAL_URL,
            isServer: typeof window === 'undefined',
        });
        
        // Fetch the main event first
        const currentEvent = await getEvent(id);
        
        if (!currentEvent) {
            console.log(`Event not found: ${id}`);
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
        throw new Error('Failed to load event page');
    }
}