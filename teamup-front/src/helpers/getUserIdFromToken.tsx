export const getUserIdFromToken = (token: string | null): string | null => {
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.id || null;
    } catch (error) {
        console.error('Erreur lors du décodage du token:', error);
        return null;
    }
};