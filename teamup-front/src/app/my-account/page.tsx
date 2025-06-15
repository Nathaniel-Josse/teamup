'use client'
export default function MyAccountMainPage() {

    // We get the user ID from localstorage
    const user = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    console.log(user)
    const id = user ? JSON.parse(user).id : "No user ID found";
    return (
        <div className="text-center">
            <h1>My Account Page</h1>
            <p>Your ID: {id}</p>
            {/* Components coming soon omg... */}
        </div>
    )
}

