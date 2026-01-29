import { handleWhoAmI } from "@/lib/actions/auth-action";
import { notFound } from "next/navigation";
import UpdateForm from "./components/UpdateForm";

export default async function ProfilePage() {

    const result = await handleWhoAmI();
    if(!result.success){
        throw new Error(result.message || "some error occurred");
    }

    if(!result.data){
        notFound();
    }
    return (
        <div>
            <UpdateForm user = { result.data } />
            profile page loaded 
        </div>
    );
}