"use client";

export default function LegalPage() {
    return (
        <main className="max-w-2xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 text-center">Mentions Légales</h1>
            <div className="main-page-background text-black rounded-lg p-6 space-y-6 border border-gray-800 w-full">
                <p>
                    Conformément aux dispositions de la loi n° 2004-575 du 21 juin 2004 pour la confiance en l&apos;économie numérique, il est précisé aux utilisateurs du site TeamUp! l&apos;identité des différents intervenants dans le cadre de sa réalisation et de son suivi.
                </p>
                <h2 className="text-xl font-semibold mt-6 mb-2">Edition du site</h2>
                <p>
                    Le présent site, accessible à l’URL <a href="https://teamup.njossedev.fr/" className="text-blue-600 underline">https://teamup.njossedev.fr/</a> (le « Site »), est édité par :
                </p>
                <p>
                    Nathaniel Josse, résidant 8 rue de la Fontaine au Roi, de nationalité Française (France), né(e) le 01/01/2000,
                </p>
                <h2 className="text-xl font-semibold mt-6 mb-2">Hébergement</h2>
                <p>
                    Le Site est hébergé par la société O2Switch, situé 222 Boulevard Gustave Flaubert, 63000 Clermont-Ferrand, (contact téléphonique ou email : (+33) 4 44 44 60 40).
                </p>
                <h2 className="text-xl font-semibold mt-6 mb-2">Directeur de publication</h2>
                <p>
                    Le Directeur de la publication du Site est Nathaniel Josse.
                </p>
                <h2 className="text-xl font-semibold mt-6 mb-2">Nous contacter</h2>
                <ul className="list-disc ml-6 mb-4">
                    <li>Par téléphone : +33444446040</li>
                    <li>Par email : <a href="mailto:nathaniel.josse.pro@gmail.com" className="text-blue-600 underline">nathaniel.josse.pro[arobase]gmail.com</a></li>
                    <li>Par courrier : 8 rue de la Fontaine au Roi</li>
                </ul>
                <h2 className="text-xl font-semibold mt-6 mb-2">Données personnelles</h2>
                <p>
                    Le traitement de vos données à caractère personnel est régi par notre Charte du respect de la vie privée, disponible depuis la section &quot;Charte de Protection des Données Personnelles&quot;, conformément au Règlement Général sur la Protection des Données 2016/679 du 27 avril 2016 («RGPD»).
                </p>
                <p className="mt-6">
                    Génération des mentions légales par Legalstart.
                </p>
            </div>
        </main>
    )
}