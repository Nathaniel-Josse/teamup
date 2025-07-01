"use client";
import { usePathname } from "next/navigation";
import {
    HomeIcon,
    CalendarDaysIcon,
    ChatBubbleLeftRightIcon,
    UserCircleIcon,
} from '@heroicons/react/24/outline';

const tabs = [
    { name: 'Accueil', icon: <HomeIcon className="w-6 h-6" />, href: '/home' },
    { name: 'Événements', icon: <CalendarDaysIcon className="w-6 h-6" />, href: '/events' },
    { name: 'Chat', icon: <ChatBubbleLeftRightIcon className="w-6 h-6" />, href: '/chat' },
    { name: 'Mon Compte', icon: <UserCircleIcon className="w-6 h-6" />, href: '/my-account' },
];

export default function TabBar() {
    const pathname = usePathname();

    if (pathname === "/auth/login" || pathname === "/auth/signup") {
        return null;
    }

    return (
        <nav className="fixed bottom-0 left-0 right-0 nav-background border-t border-gray-200 shadow z-50">
            <ul className="flex justify-around items-center h-16">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href;
                    return (
                        <li key={tab.name} className="flex-1">
                            <a
                                href={tab.href}
                                className={`flex flex-col items-center transition-colors h-16 justify-center mx-2 my-2
                                    ${isActive ? "general-background rounded-xl" : ""}
                                `}
                            >
                                <span className={`text-xl "text-white"`}>
                                    {tab.icon}
                                </span>
                                <span className={`text-xs mt-1 ${isActive ? "text-white font-bold" : "text-white"}`}>
                                    {tab.name}
                                </span>
                            </a>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}