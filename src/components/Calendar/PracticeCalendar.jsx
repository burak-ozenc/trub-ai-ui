import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchCalendarEntries } from '../../store/slices/calendarSlice';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PracticeCalendar = ({ onDateClick, onAddPractice }) => {
    const dispatch = useAppDispatch();
    const { entries, loading } = useAppSelector((state) => state.calendar);

    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        // Fetch entries for current month
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);

        dispatch(fetchCalendarEntries({ startDate: startOfMonth, endDate: endOfMonth }));
    }, [currentDate, dispatch]);

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        return { daysInMonth, startingDayOfWeek, firstDay, lastDay };
    };

    const getEntriesForDate = (date) => {
        return entries.filter(entry => {
            const entryDate = new Date(entry.scheduled_date);
            return entryDate.getDate() === date.getDate() &&
                entryDate.getMonth() === date.getMonth() &&
                entryDate.getFullYear() === date.getFullYear();
        });
    };

    const previousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const today = new Date();

    // Generate calendar days
    const calendarDays = [];

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
        calendarDays.push(null);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dayEntries = getEntriesForDate(date);
        const isToday = date.toDateString() === today.toDateString();
        const isPast = date < today && !isToday;
        const completedCount = dayEntries.filter(e => e.completed).length;

        calendarDays.push({
            day,
            date,
            entries: dayEntries,
            isToday,
            isPast,
            completedCount
        });
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={previousMonth}
                        className="p-2 hover:bg-orange-400 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    <h2 className="text-2xl font-bold">{monthName}</h2>

                    <button
                        onClick={nextMonth}
                        className="p-2 hover:bg-orange-400 rounded-lg transition-colors"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>

                <button
                    onClick={goToToday}
                    className="w-full bg-orange-400 hover:bg-orange-300 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                    Today
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="p-4">
                {/* Day Labels */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Days */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-7 gap-2">
                        {calendarDays.map((dayData, index) => {
                            if (!dayData) {
                                return <div key={`empty-${index}`} className="aspect-square"></div>;
                            }

                            const { day, date, entries, isToday, isPast, completedCount } = dayData;
                            const hasEntries = entries.length > 0;
                            const allCompleted = hasEntries && completedCount === entries.length;

                            return (
                                <div
                                    key={day}
                                    onClick={() => onDateClick(date)}
                                    className={`aspect-square p-2 rounded-xl cursor-pointer transition-all border-2 ${
                                        isToday
                                            ? 'border-orange-500 bg-orange-50 hover:bg-orange-100'
                                            : isPast
                                                ? 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                                                : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                                    }`}
                                >
                                    <div className="flex flex-col h-full">
                                        <div className={`text-sm font-semibold mb-1 ${
                                            isToday ? 'text-orange-600' : isPast ? 'text-gray-400' : 'text-gray-900'
                                        }`}>
                                            {day}
                                        </div>

                                        {hasEntries && (
                                            <div className="flex-1 flex flex-col items-center justify-center">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                                    allCompleted
                                                        ? 'bg-green-500 text-white'
                                                        : 'bg-orange-500 text-white'
                                                }`}>
                                                    {completedCount}/{entries.length}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="border-t p-4 bg-gray-50">
                <div className="flex items-center justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                        <span className="text-gray-600">Scheduled</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                        <span className="text-gray-600">Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-orange-500 border-2 border-orange-500 rounded"></div>
                        <span className="text-gray-600">Today</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PracticeCalendar;