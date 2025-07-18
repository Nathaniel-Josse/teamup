import React from "react";
import Image from "next/image";

type Status = 'open' | 'closed' | 'done' | 'cancelled';

type Event = {
    id: number;
    sport_id: number;
    organizer_user_id: string;
    picture: string;
    title: string;
    description: string;
    starting_date: string;
    ending_date: string;
    location: string;
    lat: number;
    lon: number;
    max_attendees: number;
    status: Status;
};

type EventCardProps = {
    event: Event;
};

const statusColors: Record<Status, string> = {
    open: "bg-green-500",
    closed: "bg-gray-400",
    done: "bg-blue-500",
    cancelled: "bg-red-500",
};

const EventCardComponent: React.FC<EventCardProps> = ({ event }) => {
    return (
        <div className="max-w-lg mx-auto shadow-md main-page-background rounded-lg p-6 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="flex-shrink-0 w-32 h-32 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                <Image
                    src={process.env.NEXT_PUBLIC_UPLOAD_PROTOCOL + "://" + process.env.NEXT_PUBLIC_UPLOADS_HOST + ":" + process.env.NEXT_PUBLIC_UPLOADS_PORT + event.picture}
                    alt={event.title}
                    className="object-cover w-full h-full"
                    width={800}
                    height={800}
                    style={{ objectFit: "cover", width: "100%", height: "100%" }}
                />
            </div>
            <div className="flex-1 w-full">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{event.title}</h3>
                <div className="flex items-center text-gray-700 mb-1">
                    <span className="font-semibold mr-2">Début:</span>
                    <span>{event.starting_date}</span>
                </div>
                <div className="flex items-center text-gray-700 mb-1">
                    <span className="font-semibold mr-2">Fin:</span>
                    <span>{event.ending_date}</span>
                </div>
                <div className="flex items-center text-gray-700 mb-1">
                    <span className="font-semibold mr-2">Lieu:</span>
                    <span>{event.location}</span>
                </div>
                <div className="flex items-center mt-2">
                    <span className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${statusColors[event.status]}`}>
                        {event.status === "open" && "Ouvert"}
                        {event.status === "closed" && "Fermé"}
                        {event.status === "done" && "Terminé"}
                        {event.status === "cancelled" && "Annulé"}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default EventCardComponent;