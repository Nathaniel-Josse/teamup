export const getCsrfToken = async () => {
    try {
        const response = await fetch(`/api/csrf-token`, {
            credentials: 'include'
        });
        console.log("CSRF token requested");
        console.dir(response);
        if (!response.ok) {
            throw new Error('Failed to fetch CSRF token');
        }
        const data = await response.json();
        return data.csrfToken;
    } catch (error) {
        console.error("Error getting CSRF token:", error);
        return null;
    }
};