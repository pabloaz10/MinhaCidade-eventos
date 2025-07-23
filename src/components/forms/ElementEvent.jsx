import React from "react";
import { isEventoHappeningNow, isEventoPassed } from "../../utils/dateUtils";

const ElementEvent = ({ item, type }) => {
    // Verificar status do evento baseado no horário
    const isHappening = isEventoHappeningNow(item.horario, 50); // Assume 50 minutos por evento
    const isPassed = isEventoPassed(item.horario);

    // Classes condicionais baseadas no status
    const getStatusClasses = () => {
        if (isHappening) {
            return "border-l-4 border-green-500 bg-green-50";
        } else if (isPassed) {
            return "opacity-60";
        }
        return "";
    };

    // Renderização baseada no tipo de elemento
    switch (type) {
        case "prova":
            return (
                <div className={`border-b border-gray-200 py-3 ${getStatusClasses()}`}>
                    <div className="flex flex-wrap gap-2">
                        <div className="flex items-center">
                            {isHappening && (
                                <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                            )}
                            <span className={`font-medium ${isHappening ? 'text-green-800' : 'text-gray-800'}`}>
                                {item.horario}:
                            </span>
                        </div>
                        <span className={`py-0.5 rounded-full text-sm ${isHappening ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                            {item.prova}
                        </span>

                        <div className="flex gap-1 items-center ml-auto">
                            {item.categoria && (
                                <span className="bg-gray-100 text-gray-700   py-0.5 rounded-full text-xs">
                                    {item.categoria}
                                </span>
                            )}
                            {item.nivel && (
                                <span className="bg-purple-100 text-purple-700  py-0.5 rounded-full text-xs">
                                    {item.nivel}
                                </span>
                            )}
                            {item.naipe && (
                                <span className="bg-green-100 text-green-700  py-0.5 rounded-full text-xs">
                                    {item.naipe === "M" ? "Masculino" : item.naipe === "F" ? "Feminino" : item.naipe}
                                </span>
                            )}
                        </div>
                    </div>

                    {isHappening && (
                        <div className="mt-1 text-xs text-green-600 font-medium">
                            Agora
                        </div>
                    )}
                </div>
            );

        case "instituicao":
            return (
                <div className={`py-1 ${getStatusClasses()}`}>
                    <span className="inline-block bg-gray-50 text-gray-700 px-1 py-1 rounded-md text-sm mb-1">
                        {item.nome}
                    </span>
                    {item.descricao && <p className="text-sm text-gray-600 pl-1">{item.descricao}</p>}
                </div>
            );

        // Podemos adicionar mais tipos conforme necessário
        default:
            return (
                <div className={`py-1 ${getStatusClasses()}`}>
                    <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(item, null, 2)}
                    </pre>
                </div>
            );
    }
};

export default ElementEvent;