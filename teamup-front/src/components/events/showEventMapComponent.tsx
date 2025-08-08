import L from "leaflet";
import { MapContainer, TileLayer, Marker } from "react-leaflet";


export default function ShowEventMapComponent({ event }: { event: { lat: number; lon: number } }) {

    console.log("ShowEventMapComponent", event);

    if (!event || !event.lat || !event.lon) {
        return <div className="text-center text-gray-500">Aucune localisation disponible</div>;
    }

    const locationIcon = L.icon({
        iconUrl: '/assets/images/location-sign.webp',
        iconSize: [75, 75],
        iconAnchor: [37, 75],
        popupAnchor: [-3, -76]
    });

    return (
        <MapContainer
            center={[event.lat, event.lon]}
            zoom={15}
            scrollWheelZoom={false}
            style={{ height: "250px", width: "100%" }}
            className="rounded z-0"
        >
            <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[event.lat, event.lon]} icon={locationIcon} />
        </MapContainer>
    );

}