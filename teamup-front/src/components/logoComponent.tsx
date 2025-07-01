import Image from 'next/image';

const LogoComponent = () => (
    <div className="flex items-center justify-center">
        <Image
            src="/assets/images/logo_teamup_full.webp"
            alt="Logo TeamUp"
            width={136}
            height={114}
        />
    </div>
);

export default LogoComponent;