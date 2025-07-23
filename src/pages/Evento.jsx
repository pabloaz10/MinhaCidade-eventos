import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import BtnAdicionarEvento from "../components/BtnAdicionarEvento";
import MiddlewareEventos from "../middleware/MiddlewareEventos";
import FiltroCategoria from "../components/FiltroCategoria";
import { formatarNomeCategoria } from "../utils/formatUtils";
import { useNavigate } from "react-router-dom";
import CardEventoAPI from "../components/evento/CardEventoAPI";

const Evento = () => {
    // Usar o contexto do outlet para obter a data selecionada
    const { selectedDate } = useOutletContext();
    const [categoriaAtiva, setCategoriaAtiva] = useState(null);
    const [hasEvents, setHasEvents] = useState(false);
    const [categorias, setCategorias] = useState([]);
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const verificarEventos = async () => {
            try {
                setLoading(true);
                const temEventos = await MiddlewareEventos.verificarExistenciaEventos();
                setHasEvents(temEventos);

                if (temEventos) {
                    const cats = await MiddlewareEventos.obterTodasCategorias();
                    setCategorias(cats);
                }
            } catch (error) {
                console.error("Erro ao verificar eventos:", error);
                setHasEvents(false);
            } finally {
                setLoading(false);
            }
        };

        verificarEventos();
    }, []);

    // Carregar eventos quando a data ou categoria mudar
    useEffect(() => {
        const carregarEventos = async () => {
            if (!hasEvents) return;

            try {
                setLoading(true);
                const eventosEncontrados = await MiddlewareEventos.filtrarEventos(selectedDate, categoriaAtiva);
                setEventos(eventosEncontrados);
            } catch (error) {
                console.error("Erro ao filtrar eventos:", error);
                setEventos([]);
            } finally {
                setLoading(false);
            }
        };

        carregarEventos();
    }, [selectedDate, categoriaAtiva, hasEvents]);

    const handleSelectCategoria = (categoria) => {
        setCategoriaAtiva(categoria);
    };

    const handleEventoClick = (evento) => {
        navigate(`/evento/${evento.id}`);
    };

    return (
        <div className="flex flex-col min-h-screen">
            {/* Conteúdo principal */}
            <main className="flex-1">
                <BtnAdicionarEvento />
                {hasEvents && (
                    <div className="container mx-auto px-4 py-2">
                        <FiltroCategoria
                            categorias={categorias}
                            categoriaAtiva={categoriaAtiva}
                            onSelectCategoria={handleSelectCategoria}
                        />
                    </div>
                )}

                <div className="container mx-auto px-4 py-6">
                    {loading ? (
                        <div className="text-center p-8">
                            <p className="text-gray-600">Carregando eventos...</p>
                        </div>
                    ) : hasEvents ? (
                        <div className="w-full max-w-3xl mx-auto">
                            {eventos.length > 0 ? (
                                <div className="space-y-4">
                                    {eventos.map(evento => (
                                        <CardEventoAPI
                                            key={evento.id}
                                            evento={evento}
                                            onClick={handleEventoClick}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center font-poppins font-light p-8 bg-primary rounded-lg shadow">
                                    <p className="text-gray-700">
                                        {categoriaAtiva
                                            ? `Nenhum evento de ${typeof categoriaAtiva === 'object'
                                                ? formatarNomeCategoria(categoriaAtiva.nome)
                                                : formatarNomeCategoria(categorias.find(c => c.id === categoriaAtiva)?.nome || categoriaAtiva)
                                            } encontrado para esta data.`
                                            : "Nenhum evento encontrado para esta data."}
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center p-8 bg-white rounded-lg shadow">
                            <p className="text-red-500">Nenhum evento disponível no sistema.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default Evento;