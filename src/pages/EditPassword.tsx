import PasswordForm from "../components/PasswordForm";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function EditPassword(){
    const { id } = useParams<{id : string}>();
    const entry_Id = Number(id);
    const navigate = useNavigate()

    const handleSuccess = () =>{
        console.log("Data updated Successfully")
        navigate(`/details/${id}`)

    };

    return (
        <>
            <h1>Update Details</h1>
            <PasswordForm entryId={entry_Id} onSuccess={handleSuccess}></PasswordForm>
        </>
        
    )

}