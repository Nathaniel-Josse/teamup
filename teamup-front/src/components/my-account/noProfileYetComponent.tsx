import React from 'react';
import styles from './my-account-components.module.css';

const NoProfileYetComponent: React.FC = () => (
    <div
        className={styles.noProfileYet}
        role="alert"
        aria-live="assertive"
    >
        <svg
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
        >
            <circle cx="12" cy="12" r="12" fill="#ffeeba" />
            <path
                d="M12 8v4m0 4h.01"
                stroke="#856404"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
        <div>
            Vous n&apos;avez pas encore complété votre profil. Rendez-vous en bas de cette page pour le faire !
        </div>
    </div>
);

export default NoProfileYetComponent;