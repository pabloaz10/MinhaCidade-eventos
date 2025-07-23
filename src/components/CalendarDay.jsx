import React from 'react';

const CalendarDay = ({ date, formatWeekday, isSelected, isToday, hasEvents, formatMonthShort, onClick }) => {
    return (
        <div
            onClick={onClick}
            className={`
                flex-shrink-0 text-center mx-1 w-16 h-20
                cursor-pointer rounded-lg py-2 transition-colors
                ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-400'}
                ${!hasEvents && !isSelected ? 'opacity-50' : ''}
                relative
            `}
        >
            {hasEvents && (
                <div className={`
                    absolute top-1 right-1.5
                    w-2 h-2 rounded-full 
                    ${isSelected ? 'bg-white' : 'bg-green-500'}
                `}></div>
            )}

            <div className="text-xs mb-1">{formatWeekday(date)}</div>
            <div className={`text-xl font-semibold ${isToday && !isSelected ? 'text-blue-500' : ''}`}>
                {date.getDate()}
            </div>
            <div className="text-xs mt-0.5">
                {formatMonthShort(date)}
            </div>
        </div>
    );
};

export default CalendarDay;