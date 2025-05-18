

export default function LoginPage() {
    return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <h1 className="text-3xl font-bold">Se connecter</h1>
        <form className="flex flex-col items-center mt-4">
            <label className="mb-2 text-lg">Adresse Email</label>
            <input type="email" placeholder="Email" className="mb-2 p-2 border border-gray-300 rounded" />
            <label className="mb-2 text-lg">Mot de passe</label>
            <input type="password" placeholder="Mot de passe" className="mb-2 p-2 border border-gray-300 rounded" />
            <button type="submit" className="p-2 bg-blue-500 text-white rounded">Se connecter</button>
        </form>
        <div className="mt-4">
            <p className="text-sm">Pas encore de compte ? <a href="/auth/signup" className="text-blue-500">S&apos;inscrire</a></p>
        </div>
    </div>
    );
}