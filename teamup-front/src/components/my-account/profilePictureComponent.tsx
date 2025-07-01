import Image from 'next/image';
import styles from './my-account-components.module.css';

const ProfilePictureComponent = () => (
    <div className={styles.profilePicture}>
        <Image
            src="/assets/images/avatar.webp"
            alt="Avatar de l'utilisateur"
            width={120}
            height={120}
            className="object-cover w-full h-full"
        />
    </div>
);

export default ProfilePictureComponent;