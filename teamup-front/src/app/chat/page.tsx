'use client';

import { useEffect } from "react";
import ChatComponent from "@/components/chat/chatComponent";

export default function Chat() {

    useEffect(() => {
        if (typeof window !== "undefined") {
            const userStr = localStorage.getItem("user");
            if (!userStr) {
                window.location.href = "/auth/login";
                return;
            }
        }
    }, []);

    return (
        <main className="container mx-auto p-4 flex flex-col items-center">
            <h1 className="text-2xl font-bold mb-6">Chat</h1>
            <ChatComponent />
        </main>
    );
}