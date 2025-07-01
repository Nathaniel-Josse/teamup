import LoginComponent from "../../../components/auth/loginComponent";

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-page-background">
            <div className="w-full max-w-xl text-center">
                <h1 className="text-3xl font-bold mb-8">Connexion</h1>
                <LoginComponent />
            </div>
        </div>
    );
}