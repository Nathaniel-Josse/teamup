"use client";
import { useEffect, useState } from "react";

export default function Home() {

    type UserInfo = {
        id: string;
        email: string;
        password: string;
        subrole: string;
    };

    const [user, setUser] = useState<UserInfo | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const userStr = localStorage.getItem("user");
            if (!userStr) {
                window.location.href = "/auth/login";
                return;
            }
            setUser(JSON.parse(userStr));
        }
    }, []);


    return (
        <main>
            <h1>Home Page</h1>
            <p>ça va arriver...j&apos;espère</p>
        </main>
    );
}