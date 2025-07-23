import React from "react";
import { FiCalendar, FiClock, FiMapPin, FiTag, FiExternalLink } from "react-icons/fi";
import { formatarNomeCategoria } from "../../utils/formatUtils";
import { getEventDateTime, isEventoHappeningNow } from "../../utils/dateUtils";
import { useNavigate } from "react-router-dom";
import ImagemComLoader from '../ImagemComLoader';
import MiddlewareEventos from "../../middleware/MiddlewareEventos";

const CardEventoAPI = ({ evento, onClick }) => {
    const navigate = useNavigate();
    const { data, hora } = getEventDateTime(evento.data);
    const isHappening = hora ? isEventoHappeningNow(hora, evento.data) : false;
    const isCancelled = MiddlewareEventos.isEventoCancelado(evento);


    const getDescricaoPrevia = (desc, maxLength = 150) => {
        if (!desc) return '';
        let textoNormalizado = desc
            .replace(/\\n/g, ' ')
            .replace(/\n/g, ' ')
            .replace(/\r/g, ' ');

        // Depois remove tags HTML
        const texto = textoNormalizado.replace(/<[^>]*>/g, '');

        if (texto.length > maxLength) {
            return texto.substring(0, maxLength) + '...';
        }

        return texto;
    };

    const descricaoPrevia = getDescricaoPrevia(evento.descricao_texto);
    const handleCardClick = (e) => {
        if (e.target.tagName.toLowerCase() === 'a' ||
            e.target.closest('a')) {
            return;
        }

        if (onClick) {
            onClick(evento);
        } else {
            navigate(`/evento/${evento.id}`);
        }
    };

    return (
        <div
            className={`p-4 rounded-lg border shadow-sm bg-white cursor-pointer hover:bg-gray-50 transition-colors relative overflow-hidden
                ${isHappening ? 'border-green-500 border-2' : ''}
                ${isCancelled ? 'border-red-300' : ''}`}
            onClick={handleCardClick}
        >
            {isHappening && !isCancelled && (
                <div className="bg-green-500 text-white px-2 py-1 rounded-md text-xs inline-block mb-2">
                    Acontecendo agora
                </div>
            )}
            <div className="flex flex-col md:h-1/2 md:flex-row gap-4 relative z-10">
                {isCancelled && (
                    <>
                        <div className="absolute top-0 right-0 left-0 bottom-0 overflow-hidden">
                            <div className="bg-red-500 text-white font-bold py-1 text-center transform rotate-45 absolute top-6 right-[-35%] w-full">
                                CANCELADO
                            </div>
                        </div>
                        <div className="bg-red-100 text-red-700 px-2 py-1 rounded-md text-xs inline-block mb-2 relative z-10">
                            Evento cancelado
                        </div>
                    </>
                )}

                {evento.imagem && (
                    <div className="w-full md:w-1/3 flex-shrink-0  ">
                        <ImagemComLoader
                            src={evento.imagem}
                            alt={evento.titulo}

                            className={`w-full h-1/2 md:h-full rounded-md flex justify-center items-center ${isCancelled ? 'opacity-70' : ''}`}
                            aspectRatio="16/9"
                        />
                    </div>
                )}
                <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gen-primary mb-2">{evento.titulo}</h2>
                    <div className="flex flex-wrap gap-3 text-font text-sm mb-3">
                        <div className="flex items-center">
                            <FiCalendar className="mr-1" size={16} />
                            <span>{data}</span>
                        </div>

                        {hora && (
                            <div className="flex items-center">
                                <FiClock className="mr-1" size={16} />
                                <span>{hora}</span>
                            </div>
                        )}

                        <div className="flex items-center">
                            <FiMapPin className="mr-1" size={16} />
                            <span>
                                {evento.local ? evento.local : "Local não especificado"}
                            </span>
                        </div>

                        {evento.categoria && (
                            <div className="flex items-center">
                                <FiTag className="mr-1" size={16} />
                                <span
                                    className="px-2 py-0.5 rounded-full text-xs"
                                    style={{ backgroundColor: evento.categoria.color, color: evento.categoria.text_color }}
                                >
                                    {formatarNomeCategoria(evento.categoria.nome)}
                                </span>
                            </div>
                        )}
                    </div>
                    <p className="text-gen-primary text-sm mb-4 line-clamp-3">
                        {descricaoPrevia}
                    </p>

                    <div className="flex justify-between items-center mt-auto">
                        <div className="text-xs text-gray-500">
                            Fonte: {evento.fonte}
                        </div>

                        {evento.link && (
                            <a
                                href={evento.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 text-xs flex items-center hover:underline"
                                onClick={(e) => e.stopPropagation()}
                            >
                                Ver site <FiExternalLink size={12} className="ml-1" />
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(CardEventoAPI);