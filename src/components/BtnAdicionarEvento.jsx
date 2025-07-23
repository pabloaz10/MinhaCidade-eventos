import React from "react";
import { Link } from "react-router-dom";
import { FiPlusCircle } from "react-icons/fi";

const BtnAdicionarEvento = () => {
    return (
        <Link
            to="/adicionar-evento"
            className="fixed bottom-16 right-4 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors z-99"
            title="Adicionar novo evento"
        >
            <FiPlusCircle size={24} />
        </Link>
    );
};

export default BtnAdicionarEvento;