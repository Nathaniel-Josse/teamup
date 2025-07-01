import SignUpComponent from "../../../components/auth/signUpComponent";

export default function SignUpPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-page-background">
            <div className="w-full max-w-xl text-center">
                <h1 className="text-3xl font-bold mb-8">Inscription</h1>
                <SignUpComponent />
            </div>
        </div>
    );
}