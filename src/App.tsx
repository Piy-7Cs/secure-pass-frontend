import {BrowserRouter, Routes, Route } from "react-router-dom";


function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"></Route>
        <Route path="/register"></Route>
        <Route path="/dashboard"></Route>
        <Route path="/password/:id"></Route>
      </Routes>
    </BrowserRouter>
  );



}

export default App