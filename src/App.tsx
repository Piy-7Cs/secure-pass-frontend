import {BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EntryDetails from "./pages/Details";
import { getEntries } from "./api/password";
import { useEffect, useState } from "react";
import ResetPassword from "./pages/ResetPassword";

import EditPassword from "./pages/EditPassword";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";

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
    if (!localStorage.getItem("token")) return;
    fetchEntries()
    console.log(entries)
  }, [])

  
  



  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<Dashboard entries={entries} refresh={fetchEntries}/>}/>
        <Route path="/" element={<Dashboard entries={entries} refresh={fetchEntries}/>}/>

        <Route path="/login" element ={<Login />} /> 
        <Route path="/register" element={<Register />} /> 
        
        <Route path="/details/:id" element={<EntryDetails passwords={entries}/>} />
        
        <Route path="/edit/:id" element={<EditPassword />} />
        <Route path="/forgot-password" element= {<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );



}

export default App