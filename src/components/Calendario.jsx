import React, { useState, useEffect, useRef, useMemo } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useCalendar } from "../context/CalendarContext";
import { isSameDay, formatWeekday, formatMonthShort } from "../utils/dateUtils";
import CalendarDay from './CalendarDay';

const HorizontalCalendar = ({ onSelectDate, initialDate }) => {
    const [dates, setDates] = useState([]);
    const [selectedDate, setSelectedDate] = useState(initialDate || new Date());
    const scrollRef = useRef(null);
    const { hasEventsOnDate, isLoading } = useCalendar();

    useEffect(() => {
        if (initialDate) {
            setSelectedDate(new Date(initialDate));
        }
    }, [initialDate]);

    const generateDateRange = (centerDate, daysBack = 7, daysForward = 30) => {
        const newDates = [];
        const current = new Date(centerDate);

        for (let i = -daysBack; i < daysForward; i++) {
            const date = new Date(current);
            date.setDate(current.getDate() + i);
            newDates.push(date);
        }

        return newDates;
    };

    const scrollToSelectedDate = (dateArray, targetDate) => {
        if (!scrollRef.current) return;

        const selectedIndex = dateArray.findIndex(date => isSameDay(date, targetDate));
        if (selectedIndex > -1) {
            const selectedElement = scrollRef.current.children[selectedIndex];
            if (selectedElement) {
                scrollRef.current.scrollLeft = selectedElement.offsetLeft -
                    (scrollRef.current.clientWidth / 2) +
                    (selectedElement.clientWidth / 2);
            }
        }
    };

    const generatedDates = useMemo(() => {
        return generateDateRange(new Date());
    }, []);

    // Efeito para inicialização
    useEffect(() => {
        setDates(generatedDates);
    }, [generatedDates]);

    // Efeito para atualizar quando a data selecionada muda
    useEffect(() => {
        if (dates.length > 0) {
            setTimeout(() => {
                scrollToSelectedDate(dates, selectedDate);
            }, 100);
        }
    }, [selectedDate, dates]);


    const handleDateSelect = (date) => {
        setSelectedDate(date);
        onSelectDate(date);
    };

    const scrollLeft = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
        }
    };

    return (
        <div className="bg-white shadow-sm py-2 mt-14">
            <div className="container mx-auto px-4 relative">
                <div className="flex items-center justify-between">
                    <button
                        className="p-2 rounded-full hover:bg-gray-200 absolute left-0 z-10 hidden md:block"
                        onClick={scrollLeft}
                        aria-label="Scroll esquerda"
                    >
                        <FiChevronLeft size={20} />
                    </button>
                    <div
                        className="flex overflow-x-auto scrollbar-hide py-2 px-2 md:px-10 scroll-smooth mx-auto"
                        ref={scrollRef}
                    >
                        {dates.map((date, index) => {
                            const hasEvents = hasEventsOnDate(date);
                            const isToday = isSameDay(date, new Date());
                            const isSelected = isSameDay(date, selectedDate);

                            return (
                                <CalendarDay
                                    key={index}
                                    date={date}
                                    formatWeekday={formatWeekday}
                                    isSelected={isSelected}
                                    isToday={isToday}
                                    hasEvents={hasEvents}
                                    formatMonthShort={formatMonthShort}
                                    onClick={() => handleDateSelect(date)}
                                />
                            );
                        })}
                    </div>
                    <button
                        className="p-2 rounded-full hover:bg-gray-200 absolute right-0 z-10 hidden md:block"
                        onClick={scrollRight}
                        aria-label="Scroll direita"
                    >
                        <FiChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HorizontalCalendar;