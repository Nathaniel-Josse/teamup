import React, { useState, useEffect } from 'react';

type Sport = {
    id: number;
    label: string;
};

type UserProfile = {
    first_name: string;
    last_name: string;
    birth_date?: string | null;
    fav_sport_id: number;
    level: { id: string; label: string };
    availability: { id: string; label: string };
};

type ProfileComponentProps = {
    profile: UserProfile | null;
    onUpdate: (updated: UserProfile) => void;
};

const ProfileComponent: React.FC<ProfileComponentProps> = ({ profile, onUpdate }) => {
    const [form, setForm] = useState<UserProfile>({
        first_name: profile?.first_name || '',
        last_name: profile?.last_name || '',
        birth_date: profile?.birth_date || '',
        fav_sport_id: profile?.fav_sport_id || 0,
        level: { id: profile?.level.id || 'beginner', label: profile?.level.label || 'Débutant' },
        availability: { id: profile?.availability.id || 'weekday', label: profile?.availability.label || 'Les jours de semaine' },
    });

    const [sports, setSports] = useState<Sport[]>([]);

    useEffect(() => {
        const fetchSports = async () => {
            try {
                const res = await fetch(`/api/sports`);
                const data = await res.json();
                setSports(data);
            } catch {
                setSports([]);
            }
        };
        fetchSports();
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.first_name || !form.last_name || !form.fav_sport_id || !form.level || !form.availability) {
            alert('Veuillez remplir tous les champs obligatoires.');
            return;
        }
        onUpdate({
            ...form,
            birth_date: form.birth_date ? form.birth_date : null,
        });
    };

    // Helper to get the sport label from id
    const getSportLabel = (id: number) => {
        const sport = sports.find((s) => s.id === id);
        return sport ? sport.label : id;
    };

    return (
        <div className="max-w-lg mx-auto shadow-md main-page-background rounded-lg p-6 space-y-6">
            {profile && (
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-black mb-4">Votre Profil</h2>
                    <div className="flex items-center space-x-4 mb-2">
                        <label className="w-40 font-semibold text-gray-700">Prénom:</label>
                        <span className="flex-1 text-gray-900">{profile.first_name}</span>
                    </div>
                    <div className="flex items-center space-x-4 mb-2">
                        <label className="w-40 font-semibold text-gray-700">Nom:</label>
                        <span className="flex-1 text-gray-900">{profile.last_name}</span>
                    </div>
                    <div className="flex items-center space-x-4 mb-2">
                        <label className="w-40 font-semibold text-gray-700">Date de Naissance:</label>
                        <span className="flex-1 text-gray-900">{profile.birth_date || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-4 mb-2">
                        <label className="w-40 font-semibold text-gray-700">Sport Favori:</label>
                        <span className="flex-1 text-gray-900">
                            {getSportLabel(profile.fav_sport_id)}
                        </span>
                    </div>
                    <div className="flex items-center space-x-4 mb-2">
                        <label className="w-40 font-semibold text-gray-700">Niveau:</label>
                        <span className="flex-1 text-gray-900">{profile.level.label}</span>
                    </div>
                    <div className="flex items-center space-x-4 mb-2">
                        <label className="w-40 font-semibold text-gray-700">Disponibilités:</label>
                        <span className="flex-1 text-gray-900">{profile.availability.label}</span>
                    </div>
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-xl font-semibold text-black mb-4">{profile ? 'Mettre à jour votre profil' : 'Créer votre profil'}</h2>
                <div className="flex flex-col items-center">
                    <label className="font-semibold text-gray-700 w-full text-center mb-1">
                        Prénom:
                    </label>
                    <input
                        name="first_name"
                        value={form.first_name}
                        onChange={handleChange}
                        required
                        type="text"
                        className="w-4/5 border rounded px-2 py-1 flex-1 text-black"
                    />
                </div>
                <div className="flex flex-col items-center">
                    <label className="font-semibold text-gray-700 w-full text-center mb-1">
                        Nom de Famille:
                    </label>
                    <input
                        name="last_name"
                        value={form.last_name}
                        onChange={handleChange}
                        required
                        type="text"
                        className="w-4/5 border rounded px-2 py-1 flex-1 text-black"
                    />
                </div>
                <div className="flex flex-col items-center">
                    <label className="font-semibold text-gray-700 w-full text-center mb-1">
                        Date de Naissance:
                    </label>
                    <input
                        name="birth_date"
                        value={form.birth_date || ''}
                        onChange={handleChange}
                        type="date"
                        className="w-4/5 border rounded px-2 py-1 flex-1 text-black"
                    />
                    <div className="text-sm text-gray-500 mt-4 mb-4">
                        <small className='text-black'>Cette information n&apos;est pas obligatoire mais elle est fortement recommandée si vous participez à des événements qui demandent un contrôle par pièce d&apos;identité.</small>
                    </div>
                </div>
                <div className="flex flex-col items-center">
                    <label className="font-semibold text-gray-700 w-full text-center mb-1">
                        Sport Favori (ou Sport Pratiqué):
                    </label>
                    <select
                        name="fav_sport_id"
                        value={form.fav_sport_id}
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
                        Niveau:
                    </label>
                    <select
                        name="level"
                        value={form.level.id}
                        onChange={handleChange}
                        required
                        className="w-4/5 border rounded px-2 py-1 flex-1 text-black"
                    >
                        <option value="beginner">Débutant</option>
                        <option value="intermediate">Intermédiaire</option>
                        <option value="expert">Expert/Professionnel</option>
                    </select>
                </div>
                <div className="flex flex-col items-center">
                    <label className="font-semibold text-gray-700 w-full text-center mb-1">
                        Disponibilités:
                    </label>
                    <select
                        name="availability"
                        value={form.availability.id}
                        onChange={handleChange}
                        required
                        className="w-4/5 border rounded px-2 py-1 flex-1 text-black"
                    >
                        <option value="weekday">Les jours de semaine</option>
                        <option value="weekend">En Week-end</option>
                        <option value="both">Aux deux</option>
                    </select>
                </div>
                <small className='text-black'>Pour plus d&apos;informations concernant le traitement de vos données, veuillez consulter notre <a href="/privacy">Politique de Confidentialité</a>.</small>
                <div className="flex flex-col items-center mt-4">
                    <button
                        type="submit"
                        className="w-3/5 p-2 rounded bg-blue-500 text-white hover:bg-blue-600"
                    >
                        {profile ? 'Mettre à jour' : 'Créer'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfileComponent;