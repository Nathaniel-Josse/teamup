import { useParams } from "next/navigation";

export default function MyAccountMainPage() {
    const { id } = useParams();
    return <h1>Compte actuel : {id}</h1>;
}

