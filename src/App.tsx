import {BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EntryDetails from "./pages/Details";
import { getEntries } from "./api/password";
import { useEffect, useState } from "react";
import PasswordList from "./components/PasswordList";
import PasswordForm from "./components/PasswordForm";
import EditPassword from "./pages/EditPassword";

function App(){
  const [entries, setEntries] = useState([])

 
  const fetchEntries = async () => {
    try {
      const data = await getEntries();
      console.log(data)
      setEntries(data)
     }catch(err){
        console.error(err)
    }
  }

  useEffect( ()=> {
    fetchEntries()
  }, [])

  
  



  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element ={<Login />} /> 
        <Route path="/register" element={<Register />} /> 
        <Route path="/" element={<PasswordList passwords={entries} onDelete={() => {console.log("Successfully deleted Password")}} refreshEntries={fetchEntries} />} />
        <Route path="/details/:id" element={<EntryDetails passwords={entries}/>} />
        <Route path="/entry" element={<PasswordForm onSuccess={() => console.log("Password Entry created successfully")} />}/>
        <Route path="/edit/:id" element={<EditPassword />} />
      </Routes>
    </BrowserRouter>
  );



}

export default App