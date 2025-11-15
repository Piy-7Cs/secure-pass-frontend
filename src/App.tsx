import {BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register

from "./pages/Register";
function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"></Route>
        <Route path="/login" element ={<Login />}> </Route>
        <Route path="/register" element={<Register />}> </Route>
        <Route path="/dashboard"></Route>
        <Route path="/password/:id"></Route>
      </Routes>
    </BrowserRouter>
  );



}

export default App