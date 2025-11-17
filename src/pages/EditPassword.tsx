import PasswordForm from "../components/PasswordForm";
import { useParams } from "react-router-dom";


export default function EditPassword(){
    const { id } = useParams<{id : string}>();
    const entry_Id = Number(id);
     

    const handleSuccess = () =>{
        console.log("Data updated Successfully")
    };

    return (
        <>
            <h1>Update Details</h1>
            <PasswordForm entryId={entry_Id} onSuccess={() => handleSuccess}></PasswordForm>
        </>
        
    )

}