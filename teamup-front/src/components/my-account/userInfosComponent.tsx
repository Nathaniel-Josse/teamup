import React, { useState } from "react";
import ProfilePictureComponent from "./profilePictureComponent";
import LogoComponent from "../logoComponent";

type UserInfo = {
    id: string;
    email: string;
    password: string;
    subrole: string;
};

type Props = {
    user: UserInfo | null;
    onUpdate: (updated: Partial<UserInfo>) => void;
};

const UserInfosComponent: React.FC<Props> = ({ user, onUpdate }) => {
    const [editValues, setEditValues] = useState({
        id: user?.id,
        email: user?.email,
        password: "",
        subrole: user?.subrole,
    });

    const handleChange = (field: keyof UserInfo, value: string) => {
        setEditValues((prev) => ({ ...prev, [field]: value }));
    };

    const handleUpdate = (field: keyof UserInfo) => {
        if (!user) return;
        onUpdate({ [field]: editValues[field] });
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.reload();
    };

    const handleCopyId = () => {
        if (user?.id) {
            navigator.clipboard.writeText(user.id);
            alert("Votre identifiant a bien été copié dans le presse-papiers !");
        }
    }

    return (
        <div className="max-w-lg mx-auto shadow-md main-page-background rounded-lg p-6 space-y-6">
            <LogoComponent />
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Informations principales</h2>
            
            {/* Profile Picture */}
            <ProfilePictureComponent />
            {/* User ID and Copy Button */}
            <div className="flex items-center space-x-4">
                <label className="w-24 font-semibold text-gray-700">Votre ID: </label>
                <span className="flex-1 text-gray-900">{user?.id}</span>
                <button onClick={() => handleCopyId()}
                className="px-3 py-1 rounded">
                    Copier l&apos;ID
                </button>
            </div>
            <div className="text-sm text-gray-500 mb-4">
                <small className='text-black'>Attention: Votre ID est strictement confidentiel. Veuillez ne le diffuser qu&apos;à des personnes de confiance.</small>
            </div>

            <hr className="text-gray-300"></hr>

            {/* Informations display */}
            <div className="flex items-center space-x-4">
                <label className="w-24 font-semibold text-gray-700">Email:</label>
                <span className="flex-1 text-gray-900">{user?.email}</span>
            </div>
            <div className="flex items-center space-x-4">
                <label className="w-24 font-semibold text-gray-700">Mot de passe:</label>
                <span className="flex-1 text-gray-900">********</span>
            </div>
            <div className="flex items-center space-x-4">
                <label className="w-24 font-semibold text-gray-700">Votre rôle dans le sport:</label>
                <span className="flex-1 text-gray-900">{user?.subrole}</span>
            </div>

            <hr className="text-gray-300"></hr>
            {/* Editable fields */}
            {/* Email */}
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Modifier vos informations</h2>
            <div className="flex flex-col items-center">
                <label className="font-semibold text-gray-700">Email:</label>
                <input
                    type="email"
                    className="w-4/5 border rounded px-2 py-1 flex-1 text-black"
                    value={editValues.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                /><br />
                <button
                    className="w-3/5 p-2 rounded"
                    onClick={() => handleUpdate("email")}
                >
                    Mettre à jour l&apos;email
                </button>
            </div>
            {/* Password */}
            <div className="flex flex-col items-center mt-4">
                <label className="font-semibold text-gray-700">Mot de passe:</label>
                <input
                    type="password"
                    className="w-4/5 border rounded px-2 py-1 flex-1 text-black"
                    value={editValues.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    placeholder="Nouveau mot de passe"
                /><br />
                <button
                    className="w-3/5 p-2 rounded"
                    onClick={() => handleUpdate("password")}
                >
                    Mettre à jour le mot de passe
                </button>
            </div>
            {/* Subrole */}
            <div className="flex flex-col items-center mt-4">
                <label className="font-semibold text-gray-700">Votre rôle dans le sport:</label>
                <input
                    type="text"
                    className="w-4/5 border rounded px-2 py-1 flex-1 text-black"
                    value={editValues.subrole}
                    onChange={(e) => handleChange("subrole", e.target.value)}
                /><br />
                <button
                    className="w-3/5 p-2 rounded"
                    onClick={() => handleUpdate("subrole")}
                >
                    Mettre à jour le rôle
                </button>
            </div>
            <hr className="text-gray-300"></hr>
            <div className="flex items-center justify-center space-x-4">
                <button
                    className="px-3 py-1 rounded bg-red-500 text-white"
                    onClick={handleLogout}
                >
                    Se déconnecter
                </button>
            </div>
        </div>
    );
};

export default UserInfosComponent;