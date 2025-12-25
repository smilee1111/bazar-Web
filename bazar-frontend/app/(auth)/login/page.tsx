import Link from "next/link";
import LoginForm from "../_components/login-form";

export default function Page() {
    return (
        <div>
            Login Page
            <LoginForm/>
            <Link 
                className="bg-blue-500 text-white px-4 py-2 rounded" 
                href="/register">
                Register
            </Link>
        </div>
    );
}