'use client';

import { useEffect, useState } from "react";
import ChatComponent from "@/components/chat/chatComponent";

export default function Chat() {

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
        <main className="container mx-auto p-4 flex flex-col items-center">
            <h1 className="text-2xl font-bold mb-6">Chat</h1>
            <ChatComponent />
        </main>
    );
}