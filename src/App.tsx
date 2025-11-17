import {BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EntryDetails from "./pages/Details";
import { getEntries } from "./api/password";
import { useEffect, useState } from "react";

function App(){
  const [entries, setEntries] = useState([])

  useEffect( () => {
    const fetchEntries = async () => {
      try {
        const data = await getEntries();
        setEntries(data)
      }catch(err){
        console.error(err)
      }
    }

    fetchEntries()
  }, []);
  
  



  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element ={<Login />} /> 
        <Route path="/register" element={<Register />} /> 
        <Route path="/details/:id" element={<EntryDetails passwords={entries}/>} />
        
      </Routes>
    </BrowserRouter>
  );



}

export default App