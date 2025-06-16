import {
    HomeIcon,
    CalendarDaysIcon,
    ChatBubbleLeftRightIcon,
    UserCircleIcon,
} from '@heroicons/react/24/outline';

const tabs = [
    { name: 'Accueil', icon: <HomeIcon className="w-6 h-6 stroke-black" />, href: '/home' },
    { name: 'Événements', icon: <CalendarDaysIcon className="w-6 h-6 stroke-black" />, href: '/events' },
    { name: 'Chat', icon: <ChatBubbleLeftRightIcon className="w-6 h-6 stroke-black" />, href: '/chat' },
    { name: 'Mon Compte', icon: <UserCircleIcon className="w-6 h-6 stroke-black" />, href: '/my-account' },
];

export default function TabBar() {
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow z-50">
            <ul className="flex justify-around items-center h-16">
                {tabs.map((tab) => (
                    <li key={tab.name}>
                        <a
                            href={tab.href}
                            className="flex flex-col items-center text-gray-500 hover:text-blue-600 transition-colors"
                        >
                            <span className="text-xl">{tab.icon}</span>
                            <span className="text-xs mt-1 text-black">{tab.name}</span>
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}