"use client";

import React, { useEffect, useState, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { getCsrfToken } from '@/helpers/getCsrfToken';
import { getUserIdFromToken } from '@/helpers/getUserIdFromToken';

const socketInstance = io;
const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL;

const ChatComponent: React.FC = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [rooms, setRooms] = useState([]);
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
    const [showSidebar, setShowSidebar] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const currentRoomRef = useRef<string | null>(null);

    const userToken = typeof window !== "undefined" ? localStorage.getItem('token') : null;
    const [hasProfile, setHasProfile] = useState<boolean>(true); // default true for loading
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Check if user has a profile
    useEffect(() => {
        const checkUserProfile = async () => {
            if (!userToken) {
                setHasProfile(false);
                setIsLoading(false);
                return;
            }
            const userId = getUserIdFromToken(userToken);
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/profiles/user/${userId}`);
                if (!res.ok) throw new Error("Erreur lors de la vérification du profil utilisateur.");
                const data = await res.json();
                setHasProfile(!!data.exists);
            } catch {
                setHasProfile(false);
            } finally {
                setIsLoading(false);
            }
        };
        checkUserProfile();
    }, [userToken]);

    // This useEffect fetches the list of rooms accessible to the user
    useEffect(() => {
        const fetchUserRooms = async () => {
            if (!userToken) return;

            const userId = getUserIdFromToken(userToken);

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat/rooms/user/${userId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch user rooms');
                }
                const data = await response.json();
                setRooms(data);

                if (data.length > 0) {
                    setSelectedRoomId(data[0].room_id);
                }
            } catch (error) {
                console.error("Error fetching user rooms:", error);
            }
        };

        fetchUserRooms();
    }, [userToken]);

    // This useEffect handles the socket connection and new message listeners
    useEffect(() => {
        if (!userToken) return;

        const newSocket = io(SOCKET_SERVER_URL, {
            auth: { token: userToken },
            transports: ['websocket'],
        });

        newSocket.on('connect', () => {
            console.log('Successfully connected to the socket server');
        });

        newSocket.on('new_message', (message) => {
            console.log("New message received:", message);
            setMessages(prevMessages => [...prevMessages, message]);
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from socket server');
        });

        socketRef.current = newSocket;

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [userToken]); // Dependency only on userToken

    // This useEffect handles fetching messages for the selected room
    useEffect(() => {
        const fetchMessages = async () => {
            if (!socketRef.current || !selectedRoomId) return;

            // Check if the user is switching to a different room
            if (currentRoomRef.current !== selectedRoomId) {
                console.log(`Switching from room ${currentRoomRef.current} to ${selectedRoomId}`);

                // 1. Leave the old room on the backend
                if (currentRoomRef.current) {
                    socketRef.current.emit('leave_room', currentRoomRef.current);
                }

                // 2. Join the new room on the backend
                socketRef.current.emit('join_room', selectedRoomId);
                
                // 3. Update the ref with the new room ID
                currentRoomRef.current = selectedRoomId;
            }

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat/rooms/${selectedRoomId}/messages?timezone=${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch messages');
                }
                const data = await response.json();
                setMessages(data);
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };

        fetchMessages();

    }, [selectedRoomId]);

    // This useEffect handles the room change logic
    useEffect(() => {
        if (socketRef.current) {
            console.log(`Switching to new room: ${selectedRoomId}`);
        }
    }, [selectedRoomId]);

    // Automatically scroll to the bottom of the chat
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const sendMessage = () => {
        if (input.trim() && socketRef.current && selectedRoomId) {
            socketRef.current.emit('send_message', { roomId: selectedRoomId, userId: getUserIdFromToken(userToken), content: input, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone });
            console.log("Message sent:", input);
            setInput('');
        }
    };

    const handleRoomChange = (roomId: string) => {
        setSelectedRoomId(roomId);
        setShowSidebar(false);
    };

    const handleCreateRoom = async () => {
        const newRoomName = prompt("Entrez le nom du nouveau salon :");
        if (!newRoomName) return;

        // 1. Fetch the CSRF token before making the POST request
        const csrfToken = await getCsrfToken();
        if (!csrfToken) {
            alert("Erreur: Impossible d'obtenir le token de sécurité.");
            return;
        }

        try {
            const userId = getUserIdFromToken(userToken);
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat/rooms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`,
                    // 2. Add the CSRF token to the headers
                    'x-csrf-token': csrfToken // Or whatever header name you configured
                },
                body: JSON.stringify({ name: newRoomName, user: userId }),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to create room');
            }

            const newRoom = await response.json();
            setRooms(prevRooms => [...prevRooms, newRoom]);
            setSelectedRoomId(newRoom.room_id);

        } catch (error) {
            console.error("Error creating room:", error);
            alert("Erreur lors de la création du salon.");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[80vh]">
                <span className="text-gray-500">Chargement...</span>
            </div>
        );
    }

    if (!hasProfile) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] text-black p-4">
                <div className="mb-4 text-lg font-semibold">
                    Vous devez d&apos;abord créer un profil pour accéder au chat.
                </div>
                <button
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    onClick={() => window.location.href = '/my-account'}
                >
                    Créer un profil
                </button>
            </div>
        );
    }

    return (
        <div className="relative flex h-[80vh] max-w-4xl mx-auto bg-white rounded shadow border border-gray-300 overflow-hidden">
            {/* Burger menu for mobile */}
            <div className="md:hidden absolute left-2 top-2 z-20">
                <button
                    className="p-2 rounded bg-gray-200"
                    onClick={() => setShowSidebar(true)}
                    aria-label="Ouvrir le menu des salons"
                >
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>
            {/* Sidebar for rooms (desktop) */}
            <div className={`hidden md:flex flex-col w-1/4 bg-gray-100 border-r border-gray-300`}>
                <div className="font-bold text-lg p-4 border-b border-gray-300 text-black">Salons</div>
                <div className="flex-1 overflow-y-auto">
                    {rooms.map((room) => (
                        <p
                            key={room.room_id}
                            className={`text-left px-4 py-3 transition ${selectedRoomId === room.room_id ? 'bg-button-primary font-semibold' : 'text-black hover:bg-blue-100'}`}
                            onClick={() => handleRoomChange(room.room_id)}
                        >
                            {room.name}
                        </p>
                    ))}
                </div>
                <div className="p-4 border-t border-gray-300">
                    <button
                        onClick={handleCreateRoom}
                        className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                    >
                        Créer un salon
                    </button>
                </div>
            </div>
            {/* Sidebar overlay for mobile */}
            {showSidebar && (
                <div className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden" onClick={() => setShowSidebar(false)}>
                    <div
                        className="absolute left-0 top-0 h-full w-2/3 bg-gray-100 shadow-lg flex flex-col"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="font-bold text-lg p-4 border-b border-gray-300 text-black flex justify-between items-center">
                            Salons
                            <button
                                className="p-1 rounded bg-gray-300 ml-2"
                                onClick={() => setShowSidebar(false)}
                                aria-label="Fermer le menu"
                            >
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M6 6l8 8M6 14L14 6" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {rooms.map((room) => (
                                <p
                                    key={room.room_id}
                                    className={`text-left px-4 py-3 transition ${selectedRoomId === room.room_id ? 'bg-button-primary font-semibold' : 'text-black hover:bg-blue-100'}`}
                                    onClick={() => { handleRoomChange(room.room_id); setShowSidebar(false); }}
                                >
                                    {room.name}
                                </p>
                            ))}
                        </div>
                        <div className="p-4 border-t border-gray-300">
                            <button
                                onClick={() => { handleCreateRoom(); setShowSidebar(false); }}
                                className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                            >
                                Créer un salon
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Chat area */}
            <div className="flex-1 flex flex-col">
                <div className="border-b border-gray-300 px-4 py-3 bg-gray-50 font-semibold text-lg text-black ml-15">
                    {rooms.find(r => r.room_id === selectedRoomId)?.name || 'Salon de discussion'}
                </div>
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                    {messages.length === 0 ? (
                        <div className="text-gray-400 text-center mt-10">Aucun message dans ce salon...pour le moment !</div>
                    ) : (
                        messages.map((msg: any, idx) => (
                            <div key={idx} className="mb-2 text-gray-800">
                                <i className="text-gray-500">{msg.created_at} </i><strong>{msg.first_name} {msg.last_name}:</strong> {msg.content}
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t border-gray-300 bg-white flex">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        className="flex-1 mr-2 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300 text-black"
                        onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
                        placeholder="Écrivez un message..."
                    />
                    <button
                        onClick={sendMessage}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                        Envoyer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatComponent;