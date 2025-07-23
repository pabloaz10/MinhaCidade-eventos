import React, { useState } from "react";
import { Outlet, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import HorizontalCalendar from "../components/Calendario";
import Tela from "../components/Tela";

const EventosLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isEventPage = location.pathname.includes('/evento/');
    const [searchParams, setSearchParams] = useSearchParams();
    const urlDate = searchParams.get('date');
    const initialDate = urlDate ? new Date(urlDate) : new Date();
    const [selectedDate, setSelectedDate] = useState(initialDate);

    const handleDateSelect = (date) => {
        setSelectedDate(date);

        const formattedDate = date.toISOString().split('T')[0];

        if (isEventPage) {
            navigate(`/?date=${formattedDate}`);
        } else {
            setSearchParams({ date: formattedDate });
        }
    };

    return (
        <Tela>
            <HorizontalCalendar
                onSelectDate={handleDateSelect}
                initialDate={selectedDate}
            />
            <Outlet context={{ selectedDate, setSelectedDate }} />
        </Tela>
    );
};

export default EventosLayout;