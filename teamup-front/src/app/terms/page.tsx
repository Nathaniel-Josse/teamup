import React from "react";

const TermsPage: React.FC = () => (
    <main className="max-w-2xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Conditions d&apos;utilisation de TeamUp</h1>
        <div className="main-page-background text-black rounded-lg p-6 space-y-6 border border-gray-800 w-full mb-8">
            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-2">1. Respect et bonne conduite</h2>
                <p>
                    L&apos;utilisation de TeamUp implique le respect des autres membres. Dans les salons de discussion, adoptez un langage courtois et évitez tout propos offensant, discriminatoire ou inapproprié. Les comportements agressifs, harcèlement ou incitation à la haine sont strictement interdits.
                </p>
            </section>
            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-2">2. Participation aux événements</h2>
                <p>
                    Lorsque vous vous inscrivez à un événement, veillez à honorer votre engagement. Les désistements de dernière minute perturbent l&apos;organisation et le bon déroulement des activités.
                </p>
            </section>
            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-2">3. Protection des données personnelles</h2>
                <p>
                    Ne partagez pas d&apos;informations personnelles sensibles dans les espaces publics du site. Respectez la vie privée des autres utilisateurs et n&apos;utilisez pas leurs données sans consentement. Votre identifiant utilisateur permet votre ajout à des salons privés de chat. Il ne doit être divulgué qu&apos;à des personnes de confiance.
                </p>
            </section>
            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-2">4. Utilisation appropriée de la plateforme</h2>
                <p>
                    N&apos;utilisez pas TeamUp à des fins commerciales, publicitaires ou pour diffuser du contenu non sollicité. Toute tentative de fraude ou d&apos;usurpation d&apos;identité entraînera une exclusion immédiate.
                </p>
            </section>
            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-2">5. Signalement et modération</h2>
                <p>
                    Si vous constatez un comportement inapproprié, utilisez les outils de signalement mis à disposition. L&apos;équipe de modération se réserve le droit de suspendre ou supprimer tout compte ne respectant pas ces règles.
                </p>
                <small>Les outils de modération sont en cours de développement. En attendant leur finition, veuillez contacter contact[arobase]teamup.fr pour tout signalement nécessaire.</small>
            </section>
            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-2">6. Acceptation des conditions</h2>
                <p>
                    En utilisant TeamUp, vous acceptez de respecter ces conditions. Celles-ci peuvent évoluer ; consultez-les régulièrement pour rester informé.
                </p>
            </section>
            <section className="mt-8 text-sm">
                Dernière mise à jour : Septembre 2025
            </section>
        </div>
    </main>
);

export default TermsPage;