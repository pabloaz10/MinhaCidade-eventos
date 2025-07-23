import React, { useEffect, useState } from "react";
import { toDate } from "../utils/dateUtils"; // Adicionar esta importação
import apiService from "../api/apiService";

const EventoClima = ({ eventoData }) => {
    const [clima, setClima] = useState({ temp: null, icon: null, descricao: "" });

    useEffect(() => {
        if (!eventoData) return;
        // Usa a função toDate para garantir uma data válida
        const eventoDate = toDate(eventoData);
        if (!eventoDate) return;

        // Pega o horário do evento (hora e minuto)
        const horaEvento = eventoDate.getHours();

        // Monta o range de busca para a API: pega a hora anterior, a hora do evento e a próxima hora
        const horasBusca = [
            new Date(eventoDate.getFullYear(), eventoDate.getMonth(), eventoDate.getDate(), horaEvento - 1, 0, 0),
            new Date(eventoDate.getFullYear(), eventoDate.getMonth(), eventoDate.getDate(), horaEvento, 0, 0),
            new Date(eventoDate.getFullYear(), eventoDate.getMonth(), eventoDate.getDate(), horaEvento + 1, 0, 0)
        ];

        const start = horasBusca[0].toISOString().slice(0, 13) + ":00";
        const end = horasBusca[2].toISOString().slice(0, 13) + ":00";

        const url = `https://api.open-meteo.com/v1/forecast?latitude=-23.6594&longitude=-52.6056&hourly=temperature_2m,weathercode&start=${start}&end=${end}&timezone=America/Sao_Paulo`;

        fetch(url)
            .then(res => res.json())
            .then(data => {
                if (data.hourly && data.hourly.time && data.hourly.temperature_2m && data.hourly.weathercode) {
                    // Procura o índice da hora mais próxima do evento
                    let idxMaisProxima = 0;
                    let menorDiferenca = Infinity;
                    data.hourly.time.forEach((t, idx) => {
                        const dataHora = new Date(t);
                        const diff = Math.abs(dataHora.getTime() - eventoDate.getTime());
                        if (diff < menorDiferenca) {
                            menorDiferenca = diff;
                            idxMaisProxima = idx;
                        }
                    });

                    const temp = data.hourly.temperature_2m[idxMaisProxima];
                    const code = data.hourly.weathercode[idxMaisProxima];

                    const weatherIcons = {
                        0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️", 45: "🌫️", 48: "🌫️",
                        51: "🌦️", 53: "🌦️", 55: "🌦️", 61: "🌧️", 63: "🌧️", 65: "🌧️",
                        71: "🌨️", 73: "🌨️", 75: "🌨️", 80: "🌦️", 81: "🌦️", 82: "🌦️",
                        95: "⛈️", 96: "⛈️", 99: "⛈️"
                    };
                    setClima({
                        temp: Math.round(temp),
                        icon: weatherIcons[code] || "❓",
                        descricao: ""
                    });
                }
            });
    }, [eventoData]);

    return (
        <div className="flex px-3 py-1 rounded-md">
            <span className="mr-1">{clima.icon || "☀️"}</span>
            <span className="text-gray-700">
                {clima.temp !== null ? `${clima.temp}°C` : "..."}
            </span>
        </div>
    );
};

export default EventoClima;