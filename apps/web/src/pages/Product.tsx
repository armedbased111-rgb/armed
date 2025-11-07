import { useParams } from "react-router-dom";
export default function Cart() {
    const { slug } = useParams();
    return <div>Product - slug: {slug}</div>;
}