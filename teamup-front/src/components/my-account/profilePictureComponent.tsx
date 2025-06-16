import Image from 'next/image';

const ProfilePictureComponent = () => (
    <div className="w-[120px] h-[120px] rounded-full overflow-hidden border-4 border-gray-200 flex items-center justify-center">
        <Image
            src="/assets/images/avatar.jpg"
            alt="Profile Avatar"
            width={120}
            height={120}
            className="object-cover w-full h-full"
        />
    </div>
);

export default ProfilePictureComponent;