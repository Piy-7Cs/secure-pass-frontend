import {  useState, type FormEvent } from "react";
import { createEntry, updateEntry } from "../api/password";

interface PasswordFormProps {
    entryId? : number,
    initialData? : {
    service_name: string;
    service_username: string;
    password: string;
    notes: string;
    site_url: string;
    };
    onSuccess: () => void;
}

export default function PasswordForm( {entryId, initialData, onSuccess} : PasswordFormProps){

    const [serviceName, setServiceName ] = useState(initialData?.service_name || "");
    const [serviceUsername, setServiceUsername] = useState(initialData?.service_username || "");
    const [password, setPassword] = useState(initialData?.password || "");
    const [notes, setNotes] = useState(initialData?.notes || "");
    const [siteUrl, setSiteUrl] = useState(initialData?.site_url || "");

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            if(entryId){
                await updateEntry(entryId, serviceName, serviceUsername, password, notes, siteUrl);
            }
            else {
                await createEntry(serviceName, serviceUsername, password, notes, siteUrl)
            }
            onSuccess();
            setServiceName(""); setServiceUsername(""); setPassword(""); setNotes(""), setSiteUrl("");

        } catch(err){
            console.error(err);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input placeholder="Service Name" value={serviceName} onChange={e => setServiceName(e.target.value)} />
            <input placeholder="Service Username" value={serviceUsername} onChange={e => setServiceUsername(e.target.value)} />
            <input placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            <input placeholder="Notes" value={notes} onChange={e => setNotes(e.target.value)} />
            <input placeholder="Site URL" value={siteUrl} onChange={e => setSiteUrl(e.target.value)} />
            <button type="submit">{entryId ? "Update" : "Add"} Password</button>
        </form>
    );
}
