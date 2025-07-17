"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl"; // for types only
import mbxGeocoding from "@mapbox/mapbox-sdk/services/geocoding";
import L from "leaflet";

// Default to Paris
const defaultPosition = [48.8566, 2.3522];

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

const geocodingClient = mbxGeocoding({ accessToken: MAPBOX_TOKEN });

const LocationMarker = ({ setPosition }: { setPosition: Function }) => {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });
    return null;
};

export default function AddressInputWithMapComponent({
    onAddressChange,
}: {
    onAddressChange: (info: {
        address: string;
        lat: number;
        lng: number;
    }) => void;
}) {
    const [address, setAddress] = useState("");
    const [position, setPosition] = useState<{ lat: number; lng: number }>({
        lat: defaultPosition[0],
        lng: defaultPosition[1],
    });
    const [suggestions, setSuggestions] = useState<
        { place_name: string; center: [number, number] }[]
    >([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    // Fetch address from coordinates
    useEffect(() => {
        const fetchAddress = async () => {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}`
            );
            const data = await res.json();
            setAddress(data.display_name);
            onAddressChange({
                address: data.display_name,
                lat: position.lat,
                lng: position.lng,
            });
        };
        fetchAddress();
    }, [position, onAddressChange]);

    // Debounced autocomplete handler
    const handleAddressInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setAddress(value);

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        if (value.length < 3) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        debounceTimeout.current = setTimeout(async () => {
            try {
                const response = await geocodingClient
                    .forwardGeocode({
                        query: value,
                        limit: 5,
                        countries: ["fr"],
                    })
                    .send();
                const features = response.body.features;
                setSuggestions(
                    features.map((f: any) => ({
                        place_name: f.place_name,
                        center: f.center,
                    }))
                );
                setShowSuggestions(true);
            } catch {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 300);
    };

    const handleSuggestionClick = (suggestion: { place_name: string; center: [number, number] }) => {
        setAddress(suggestion.place_name);
        setPosition({ lat: suggestion.center[1], lng: suggestion.center[0] });
        setSuggestions([]);
        setShowSuggestions(false);
    };

    return (
        <div className="relative">
            <input
                ref={inputRef}
                type="text"
                value={address}
                onChange={handleAddressInput}
                className="w-full p-2 border border-black rounded mb-2 text-black"
                placeholder="Rechercher une adresse"
                onFocus={() => setShowSuggestions(suggestions.length > 3)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 300)}
            />
            {showSuggestions && suggestions.length > 3 && (
                <ul className="absolute z-10 bg-white border rounded w-full max-h-48 overflow-y-auto shadow">
                    {suggestions.map((s, idx) => (
                        <li
                            key={idx}
                            className="px-3 py-2 text-black cursor-pointer hover:bg-button-primary"
                            onMouseDown={() => handleSuggestionClick(s)}
                        >
                            {s.place_name}
                        </li>
                    ))}
                </ul>
            )}
            <MapContainer
                center={[position.lat, position.lng]}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: "300px", width: "100%", zIndex: 0 }}
                className="z-0"
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker setPosition={setPosition} />
                <Marker position={[position.lat, position.lng]} />
            </MapContainer>
        </div>
    );
}