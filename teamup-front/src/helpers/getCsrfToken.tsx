export const getCsrfToken = async () => {
    try {
        const response = await fetch(`/api/csrf-token`, {
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error('Échec de la récupération du token CSRF');
        }
        const data = await response.json();
        return data.csrfToken;
    } catch (error) {
        console.error("Erreur lors de la récupération du token CSRF:", error);
        return null;
    }
};