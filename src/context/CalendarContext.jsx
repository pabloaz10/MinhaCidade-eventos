import React, { createContext, useState, useContext, useEffect } from 'react';
import MiddlewareEventos from '../middleware/MiddlewareEventos';
import { toDate, getDateKey } from '../utils/dateUtils';

const CalendarContext = createContext();

export const useCalendar = () => useContext(CalendarContext);

export const CalendarProvider = ({ children }) => {
    const [datesWithEvents, setDatesWithEvents] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    const debugEventsOnDate = async (dateStr) => {
        await MiddlewareEventos.inicializarCache();
        const eventos = await MiddlewareEventos.obterTodosEventos();

        const eventsOnDate = eventos.filter(event => {
            const eventDate = toDate(event.data);
            return eventDate && getDateKey(eventDate) === dateStr;
        });

        return eventsOnDate;
    };

    // Gera o mapa de disponibilidade para o mês atual e o próximo
    const generateAvailabilityMap = async (monthsAhead = 1) => {
        const result = {};
        const today = new Date();

        // Define o intervalo de datas a verificar
        const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        const endDate = new Date(today.getFullYear(), today.getMonth() + monthsAhead + 1, 0);

        // Obter todos os eventos através do middleware
        const eventos = await MiddlewareEventos.obterTodosEventos();

        // Processa cada evento para criar o mapa
        if (Array.isArray(eventos)) {
            eventos.forEach(event => {
                const eventDate = toDate(event.data);
                if (eventDate && eventDate >= startDate && eventDate <= endDate) {
                    const dateKey = getDateKey(eventDate);
                    if (dateKey) {
                        result[dateKey] = true;
                    }
                }
            });
        }

        // Debug específico para os dias problemáticos
        if (monthsAhead === 1) { // Só executar na primeira carga
            const problematicDates = ['2025-05-01', '2025-05-11'];
            for (const date of problematicDates) {
                await debugEventsOnDate(date);
            }
        }

        return result;
    };

    useEffect(() => {
        const initializeCalendar = async () => {
            setIsLoading(true);
            try {
                // Inicializar o cache de eventos primeiro
                await MiddlewareEventos.inicializarCache();
                const availabilityMap = await generateAvailabilityMap();
                setDatesWithEvents(availabilityMap);
            } catch (error) {
                console.error("Erro ao inicializar calendário:", error);
            } finally {
                setIsLoading(false);
            }
        };

        initializeCalendar();
    }, []);

    // Recarregar quando necessário (por exemplo ao mudar de mês)
    const refreshAvailability = async (monthsToLoad = 1) => {
        setIsLoading(true);
        try {
            const availabilityMap = await generateAvailabilityMap(monthsToLoad);
            setDatesWithEvents(availabilityMap);
        } catch (error) {
            console.error("Erro ao atualizar disponibilidade:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Verificar se uma data específica tem eventos
    const hasEventsOnDate = (date) => {
        const dateKey = getDateKey(date);
        return !!dateKey && !!datesWithEvents[dateKey];
    };

    return (
        <CalendarContext.Provider
            value={{
                datesWithEvents,
                isLoading,
                refreshAvailability,
                hasEventsOnDate,
                debugEventsOnDate  // Adiciona o método de debug para uso em desenvolvimento
            }}
        >
            {children}
        </CalendarContext.Provider>
    );
};