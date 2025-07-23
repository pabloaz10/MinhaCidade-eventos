import React from "react";
import Header from "./Header";
import Footer from "./Footer";


const Tela = ({ children }) => {

    return <div className="w-full h-full min-h-screen overflow-x-hidden"> <Header /> {children} <Footer /></div>;
}

export default Tela;