import React, { useState, useEffect } from 'react';
import AddressInputWithMapComponent from './addressInputMapComponent';

type Status = 'open' | 'closed' | 'done' | 'cancelled';

type Sport = {
    id: number;
    label: string;
};

type Event = {
    sport_id: number;
    title: string;
    starting_date: string;
    ending_date: string;
    location: string;
    lat: number;
    lon: number;
    max_attendees: number;
    status: Status;
    description: string;
    picture: string | null;
    is_new_event?: boolean;
};

type EventComponentProps = {
    event: Event | null;
    onUpdate: (updated: Event) => void;
};

const AddOrUpdateEventComponent: React.FC<EventComponentProps> = ({ event, onUpdate }) => {
    const [form, setForm] = useState<Event>({
        sport_id: event?.sport_id || 0,
        title: event?.title || '',
        starting_date: event?.starting_date || '',
        ending_date: event?.ending_date || '',
        location: event?.location || '',
        lat: event?.lat || 0,
        lon: event?.lon || 0,
        max_attendees: event?.max_attendees || 0,
        status: event?.status || 'open',
        description: event?.description || '',
        picture: event?.picture || null,
        is_new_event: event ? false : true,
    });

    const [sports, setSports] = useState<Sport[]>([]);
    const [addressData, setAddressData] = useState({
        address: form.location,
        lat: form.lat,
        lng: form.lon,
    });
    const [pictureFile, setPictureFile] = useState<File | null>(null);

    useEffect(() => {
        const fetchSports = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sports`);
                const data = await res.json();
                setSports(data);
            } catch {
                setSports([]);
            }
        };
        fetchSports();
    }, []);

    // Update form when addressData changes
    useEffect(() => {
        setForm((prev) => ({
            ...prev,
            location: addressData.address,
            lat: addressData.lat,
            lon: addressData.lng,
        }));
    }, [addressData]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type, files } = e.target as HTMLInputElement;
        if (type === "file" && files && files[0]) {
            setPictureFile(files[0]);
            setForm((prev) => ({
                ...prev,
                picture: URL.createObjectURL(files[0]), // For preview only
            }));
        } else {
            setForm((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const mergedForm = {
            ...form,
            location: addressData.address,
            lat: addressData.lat,
            lon: addressData.lng,
        };
        if (
            !mergedForm.title ||
            !mergedForm.sport_id ||
            !mergedForm.starting_date ||
            !mergedForm.ending_date ||
            !mergedForm.location ||
            !mergedForm.max_attendees ||
            !mergedForm.status
        ) {
            alert('Veuillez remplir tous les champs obligatoires.');
            return;
        }
        
        onUpdate({ ...mergedForm }, pictureFile);
    };

    return (
        <div className="max-w-lg mx-auto shadow-md main-page-background rounded-lg p-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    {event ? 'Mettre à jour votre événement' : 'Créer un événement'}
                </h2>
                <div className="flex flex-col items-center">
                    <label className="font-semibold text-gray-700 w-full text-center mb-1">
                        Titre de l&apos;événement:
                    </label>
                    <input
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        required
                        type="text"
                        className="w-4/5 border rounded px-2 py-1 flex-1 text-black"
                        placeholder="Titre"
                    />
                </div>
                <div className="flex flex-col items-center">
                    <label className="font-semibold text-gray-700 w-full text-center mb-1">
                        Sport:
                    </label>
                    <select
                        name="sport_id"
                        value={form.sport_id}
                        onChange={handleChange}
                        required
                        className="w-4/5 border rounded px-2 py-1 flex-1 text-black"
                    >
                        <option value="">Sélectionnez un sport</option>
                        {sports.map((sport) => (
                            <option key={sport.id} value={sport.id}>
                                {sport.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col items-center">
                    <label className="font-semibold text-gray-700 w-full text-center mb-1">
                        Date de début:
                    </label>
                    <input
                        name="starting_date"
                        value={form.starting_date}
                        onChange={handleChange}
                        required
                        type="datetime-local"
                        className="w-4/5 border rounded px-2 py-1 flex-1 text-black"
                    />
                </div>
                <div className="flex flex-col items-center">
                    <label className="font-semibold text-gray-700 w-full text-center mb-1">
                        Date de fin:
                    </label>
                    <input
                        name="ending_date"
                        value={form.ending_date}
                        onChange={handleChange}
                        required
                        type="datetime-local"
                        className="w-4/5 border rounded px-2 py-1 flex-1 text-black"
                    />
                </div>
                <div className="flex flex-col items-center">
                    <label className="font-semibold text-gray-700 w-full text-center mb-1">
                        Adresse et position sur la carte:
                    </label>
                    <AddressInputWithMapComponent
                        onAddressChange={setAddressData}
                    />
                </div>
                <div className="flex flex-col items-center">
                    <label className="font-semibold text-gray-700 w-full text-center mb-1">
                        Nombre maximum de participants:
                    </label>
                    <input
                        name="max_attendees"
                        value={form.max_attendees}
                        onChange={handleChange}
                        required
                        type="number"
                        min={1}
                        className="w-4/5 border rounded px-2 py-1 flex-1 text-black"
                        placeholder="Nombre maximum"
                    />
                </div>
                <div className="flex flex-col items-center">
                    <label className="font-semibold text-gray-700 w-full text-center mb-1">
                        Statut:
                    </label>
                    <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        required
                        className="w-4/5 border rounded px-2 py-1 flex-1 text-black"
                    >
                        <option value="open">Ouvert</option>
                        <option value="closed">Fermé</option>
                        <option value="done">Terminé</option>
                        <option value="cancelled">Annulé</option>
                    </select>
                </div>
                <div className="flex flex-col items-center">
                    <label className="font-semibold text-gray-700 w-full text-center mb-1">
                        Description:
                    </label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        className="w-4/5 border rounded px-2 py-1 flex-1 text-black"
                        placeholder="Description de l'événement"
                        rows={3}
                    />
                </div>
                <div className="flex flex-col items-center">
                    <label className="font-semibold text-gray-700 w-full text-center mb-1">
                        Image de l&apos;événement:
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        name="picture"
                        onChange={handleChange}
                        className="w-4/5 border rounded px-2 py-1 flex-1 text-black"
                    />
                    {form.picture && (
                        <img
                            src={form.picture}
                            alt="Aperçu"
                            className="mt-2 rounded max-h-40"
                        />
                    )}
                </div>
                <div className="flex flex-col items-center mt-4">
                    <button
                        type="submit"
                        className="w-3/5 p-2 rounded bg-blue-500 text-white hover:bg-blue-600"
                    >
                        {event ? 'Mettre à jour' : 'Créer'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddOrUpdateEventComponent;