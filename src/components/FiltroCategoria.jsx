import React, { useState, useEffect, useCallback } from "react";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { formatarNomeCategoria } from "../utils/formatUtils";
import MiddlewareEventos from "../middleware/MiddlewareEventos";

const FiltroCategoria = ({ categoriaAtiva, onSelectCategoria }) => {
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = React.useRef(null);

    const scrollLeft = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
        }
    };

    const carregarCategorias = useCallback(async () => {
        try {
            setLoading(true);
            // Usar o middleware que já mantém o cache
            const categoriasData = await MiddlewareEventos.obterTodasCategorias();
            setCategorias(categoriasData);
        } catch (error) {
            console.error("Erro ao carregar categorias:", error);
            setCategorias([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        carregarCategorias();
    }, [carregarCategorias]);

    const isCategoriaAtiva = (categoria) => {
        if (!categoriaAtiva) return false;

        // Se categoriaAtiva for um objeto (formato API)
        if (typeof categoriaAtiva === 'object' && categoriaAtiva.id) {
            return categoriaAtiva.id === categoria.id;
        }

        // Se categoriaAtiva for um ID
        if (typeof categoriaAtiva === 'number') {
            return categoriaAtiva === categoria.id;
        }

        // Se categoriaAtiva for um nome e categoria também for nome
        if (typeof categoriaAtiva === 'string' && typeof categoria === 'string') {
            return categoriaAtiva === categoria;
        }

        // Se categoriaAtiva for um nome, mas categoria é objeto
        if (typeof categoriaAtiva === 'string' && categoria.nome) {
            return categoriaAtiva === categoria.nome;
        }

        return false;
    };

    const getCategoriaStyle = (categoria) => {
        const isActive = isCategoriaAtiva(categoria);

        if (isActive) {
            return {
                backgroundColor: categoria.color || '#f3f4f6',
                color: categoria.text_color || '#333'
            };
        }

        // Se não estiver ativa, usamos cores padrão com hover mais claro
        return {};
    };

    if (loading) {
        return (
            <div className="p-2 bg-white rounded-lg shadow">
                <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-semibold">Categorias</h3>
                </div>
                <div className="flex space-x-2 overflow-x-auto pb-2">
                    <div className="animate-pulse flex space-x-2">
                        <div className="bg-gray-200 h-8 w-20 rounded-full"></div>
                        <div className="bg-gray-200 h-8 w-28 rounded-full"></div>
                        <div className="bg-gray-200 h-8 w-24 rounded-full"></div>
                        <div className="bg-gray-200 h-8 w-32 rounded-full"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-2 bg-white rounded-lg shadow">
            <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-semibold">Categorias</h3>
                <div className="hidden md:flex space-x-2">
                    <button
                        onClick={scrollLeft}
                        className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700"
                        aria-label="Rolar para esquerda"
                    >
                        <FiArrowLeft size={18} />
                    </button>
                    <button
                        onClick={scrollRight}
                        className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700"
                        aria-label="Rolar para direita"
                    >
                        <FiArrowRight size={18} />
                    </button>
                </div>
            </div>
            <div
                ref={scrollRef}
                className="flex overflow-x-auto pb-2 scrollbar-hide"
                style={{
                    WebkitOverflowScrolling: 'touch'
                }}
            >
                <div className="flex space-x-2 min-w-max">
                    <button
                        onClick={() => onSelectCategoria(null)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors whitespace-nowrap
                          ${!categoriaAtiva
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        title="Mostrar todas as categorias"
                    >
                        Todas
                    </button>

                    {Array.isArray(categorias) && categorias.map((categoria, index) => (
                        <button
                            key={categoria.id || index}
                            onClick={() => onSelectCategoria(categoria)}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors whitespace-nowrap
                              ${isCategoriaAtiva(categoria)
                                    ? 'border border-current'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            title={categoria.descricao || ""}
                            style={getCategoriaStyle(categoria)}
                        >
                            {formatarNomeCategoria(typeof categoria === 'object' ? categoria.nome : categoria)}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FiltroCategoria;