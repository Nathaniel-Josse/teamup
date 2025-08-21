export const verifyUserToken = async function (token, jwt) {
    const JWT_SECRET = process.env.JWT_SECRET;
    
    if (!token) {
        return null;
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded.id;
    } catch (err) {
        console.error('Token verification failed:', err.message);
        return null;
    }
}