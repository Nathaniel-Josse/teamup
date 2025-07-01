import React from "react";

const Footer: React.FC = () => (
    <footer className="mt-8 pb-20 bg-gray-100 text-gray-700">
        <div className="container mx-auto flex flex-col justify-around items-center py-6 px-4">
            <div className="flex space-x-6 mb-4 md:mb-0">
                <a href="/privacy" className="hover:underline">
                    Politique de Confidentialité
                </a>
                <a href="/terms" className="hover:underline">
                    Mentions Légales
                </a>
            </div>
            <div className="text-sm text-gray-500">
                &copy; {new Date().getFullYear()} TeamUp. Tous droits réservés.
            </div>
        </div>
    </footer>
);

export default Footer;