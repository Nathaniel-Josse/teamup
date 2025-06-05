const db = require('./config/db');

async function promoteToAdmin(email) {
    if (!email) {
        console.error("Veuillez fournir un email en argument.");
        process.exit(1);
    }
    try {
        const [result] = await db.query('UPDATE users SET role = "admin" WHERE email = ?', [email]);
        if (result.affectedRows === 0) {
            console.log("Aucun utilisateur trouvé avec cet email.");
        } else {
            console.log(`Utilisateur ${email} promu au rôle admin.`);
        }
    } catch (err) {
        console.error("Erreur lors de la promotion :", err.message);
    } finally {
        process.exit();
    }
}

promoteToAdmin(process.argv[2]);