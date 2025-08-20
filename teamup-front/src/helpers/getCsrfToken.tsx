export const getCsrfToken = async () => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/csrf-token`, {
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