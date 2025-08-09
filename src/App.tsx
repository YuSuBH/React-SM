import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { Main } from "./pages/main";
import { Login } from "./pages/login";
import { Navbar } from "./components/navbar";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />

        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/login" element={<Login />} />

        </Routes>
        
      </BrowserRouter>

    </div>
  );
}

export default App;
