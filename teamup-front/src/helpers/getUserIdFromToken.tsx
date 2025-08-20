export const getUserIdFromToken = (token: string | null): string | null => {
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.id || null;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};