import React, { useState, useEffect } from "react";
import { FiCalendar, FiClock, FiMapPin, FiTag, FiArrowLeft, FiExternalLink } from "react-icons/fi";
import { formatarNomeCategoria, formatarTextoComQuebras } from "../utils/formatUtils";
import { getEventDateTime, formatLongDate } from "../utils/dateUtils";
import ElementEvent from "../components/forms/ElementEvent";
import { analisarDescricaoEvento } from "../utils/eventAnalyzer";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import EventoIframe from "../components/EventoIframe";
import EventoClima from "../components/EventoClima";

import MiddlewareEventos from "../middleware/MiddlewareEventos";

const EventoAberto = ({ eventoInicial, onVoltar }) => {
    const [evento, setEvento] = useState(eventoInicial);
    const [loading, setLoading] = useState(!eventoInicial);

    const { id } = useParams();
    const navigate = useNavigate();
    const { selectedDate, setSelectedDate } = useOutletContext();
    const dataEvento = evento ? new Date(evento.data) : null;
    const isCancelled = evento ? MiddlewareEventos.isEventoCancelado(evento) : false;

    useEffect(() => {
        const carregarEvento = async () => {
            if (!evento && id) {
                setLoading(true);
                try {
                    const eventoEncontrado = await MiddlewareEventos.obterEventoPorId(parseInt(id));
                    if (eventoEncontrado) {
                        setEvento(eventoEncontrado);
                        const dataEvento = new Date(eventoEncontrado.data);
                        setSelectedDate(dataEvento);
                        MiddlewareEventos.registrarVisualizacao(parseInt(id));
                    } else {
                        navigate("/");
                    }
                } catch (error) {
                    console.error("Erro ao carregar evento:", error);
                    navigate("/");
                } finally {
                    setLoading(false);
                }
            }
        };

        carregarEvento();
    }, [id, evento, navigate, setSelectedDate]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <p className="text-lg text-gray-600">Carregando evento...</p>
                </div>
            </div>
        );
    }

    const elementosEstruturados = evento?.descricao_provas
        ? analisarDescricaoEvento(evento.descricao_provas)
        : [];

    if (!evento) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <p className="text-lg text-gray-600">Evento não encontrado.</p>
                </div>
            </div>
        );
    }

    const dataLonga = formatLongDate(evento.data);
    const { data, hora } = getEventDateTime(evento.data);

    // Para lidar com a diferença entre o formato da API e dos mocks
    const categoriaNome = evento.categoria?.nome || evento.categoria;
    const categoriaCor = evento.categoria?.cor;

    const renderDescricao = () => {
        if (elementosEstruturados && elementosEstruturados.length > 0) {
            const textoDescricao = evento.descricao_texto || '';
            return (
                <>
                    {textoDescricao && (
                        <div
                            className="text-gray-700 mb-6"
                            dangerouslySetInnerHTML={{
                                __html: formatarTextoComQuebras(textoDescricao)
                            }}
                        />
                    )}
                    {elementosEstruturados.map((elemento, idx) => (
                        elemento && (  // Verificação adicional
                            <div key={idx} className="mt-6">
                                <h3 className="text-lg font-semibold mb-3">{elemento.title || ''}</h3>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    {elemento.items && elemento.items.map((item, itemIdx) => (
                                        <ElementEvent
                                            key={itemIdx}
                                            item={item}
                                            type={elemento.type || 'default'}
                                        />
                                    ))}
                                </div>
                            </div>
                        )
                    ))}
                </>
            );
        }

        return (
            <div
                className="text-gray-700"
                dangerouslySetInnerHTML={{
                    __html: formatarTextoComQuebras(evento.descricao_texto || '')
                }}
            ></div>
        );
    };

    const handleVoltarClick = () => {
        if (onVoltar) {
            onVoltar();
        } else {
            navigate("/");
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-primary shadow-md rounded-lg overflow-hidden">
                <button
                    onClick={handleVoltarClick}
                    className="flex items-center bg-gray-100 p-3 hover:bg-gray-200 transition-colors"
                >
                    <FiArrowLeft className="mr-2" /> Voltar para eventos
                </button>

                {evento.imagem && (
                    <div className="relative">
                        <img
                            src={evento.imagem}
                            alt={evento.titulo}
                            className={`w-full h-64 object-cover ${isCancelled ? 'opacity-70' : ''}`}
                        />
                        {isCancelled && (
                            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center overflow-hidden">
                                <div className="bg-red-500 text-white font-bold py-3 text-center transform rotate-45 absolute w-[150%]">
                                    CANCELADO
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className={`p-6 rounded-md shadow-md bg-white ${isCancelled ? 'relative overflow-hidden' : ''}`}>
                    {isCancelled && !evento.imagem && (
                        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center overflow-hidden">
                            <div className="bg-red-500 text-white font-bold py-3 text-center transform rotate-45 absolute w-[150%]">
                                CANCELADO
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-xl text-font-primary font-bold">{evento.titulo}</h1>
                        <EventoClima eventoData={evento.data} />
                    </div>

                    {isCancelled && (
                        <div className="bg-red-100 text-red-700 px-4 py-2 rounded-md mb-4 relative z-10 font-medium">
                            Este evento foi cancelado.
                        </div>
                    )}

                    <div className="flex flex-wrap gap-4 mb-6 relative z-10">
                        <div className="flex items-center text-font-primary">
                            <FiCalendar className="mr-2" size={18} />
                            <span>{dataLonga}</span>
                        </div>

                        {hora && (
                            <div className="flex items-center text-font-primary">
                                <FiClock className="mr-2" size={18} />
                                <span>{hora}</span>
                            </div>
                        )}

                        <div className="flex items-center text-font-primary">
                            <FiMapPin className="mr-2" size={18} />
                            <span>{evento.local || "Local não especificado"}</span>
                        </div>

                        <div className="flex items-center">
                            <FiTag className="mr-2" size={18} />
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoriaCor}`}>
                                {formatarNomeCategoria(categoriaNome)}
                            </span>
                        </div>
                    </div>

                    <div className="prose max-w-none relative z-10">
                        {renderDescricao()}
                    </div>
                    <div className="mt-6 flex items-center text-font-primary relative z-10">
                        <span>Fonte: {evento.fonte}</span>
                    </div>
                    <div className="mt-8 flex flex-wrap gap-4 relative z-10">
                        {evento.link && (
                            <a
                                href={evento.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                            >
                                Site do evento
                                <FiExternalLink className="ml-2" />
                            </a>
                        )}
                    </div>
                </div>
                <div className="prose max-w-none">
                    {evento.iframe && (
                        <EventoIframe
                            iframeContent={evento.iframe}
                            title="Localização"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventoAberto;