import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {fetchUpcomingPractices, setSelectedDate} from '../store/slices/calendarSlice';
import {ArrowLeft, Calendar as CalendarIcon, Plus, TrendingUp} from 'lucide-react';
import ExerciseCard from '../components/Practice/ExerciseCard';
import PracticeMode from '../components/Practice/PracticeMode';
import Header from '../components/Common/Header';
import MetronomeSidebar from '../components/Analyzer/MetronomeSidebar';
import DayView from '../components/Calendar/DayView';
import AddPracticeModal from '../components/Calendar/AddPracticeModal';
import PracticeCalendar from "../components/Calendar/PracticeCalendar";

const CalendarPage = () => {
    const navigate = useNavigate();
    const {user} = useAuth();
    const dispatch = useAppDispatch();
    const {upcomingPractices} = useAppSelector((state) => state.calendar);

    const [selectedDate, setSelectedDateState] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [modalDate, setModalDate] = useState(null);
    const [editingEntry, setEditingEntry] = useState(null);
    const [practiceFromCalendar, setPracticeFromCalendar] = useState(null);

    useEffect(() => {
        dispatch(fetchUpcomingPractices(5));
    }, [dispatch]);

    const handleDateClick = (date) => {
        setSelectedDateState(date);
        dispatch(setSelectedDate(date));
    };

    const handleAddPractice = (date) => {
        setModalDate(date || new Date());
        setShowAddModal(true);
        setSelectedDateState(null);
    };

    const handleEditEntry = (entry) => {
        setEditingEntry(entry);
        setModalDate(new Date(entry.scheduled_date));
        setShowAddModal(true);
        setSelectedDateState(null);
    };

    // Handle starting practice from calendar
    const handleStartPracticeFromCalendar = (calendarEntry) => {
        console.log('Starting practice from calendar:', calendarEntry);

        // Set state to show practice mode with this entry
        setPracticeFromCalendar({
            exercise: calendarEntry.exercise,
            calendarEntryId: calendarEntry.id
        });
    };

    const closeAddModal = () => {
        setShowAddModal(false);
        setModalDate(null);
        setEditingEntry(null);
    };

    const closeDayView = () => {
        setSelectedDateState(null);
    };

    const closePracticeMode = () => {
        setPracticeFromCalendar(null);
        // Refresh calendar entries after practice
        dispatch(fetchUpcomingPractices(5));
    };

    // Show practice mode if started from calendar
    if (practiceFromCalendar) {
        return (
            <PracticeMode
                exercise={practiceFromCalendar.exercise}
                calendarEntryId={practiceFromCalendar.calendarEntryId}
                onBack={closePracticeMode}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
            {/* Header */}
            <Header/>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5"/>
                        <span>Back to Home</span>
                    </button>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                Practice Calendar
                            </h1>
                            <p className="text-gray-600">
                                Plan and track your daily practice sessions
                            </p>
                        </div>
                        <button
                            onClick={() => handleAddPractice(new Date())}
                            className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all"
                        >
                            <Plus className="w-5 h-5"/>
                            Schedule Practice
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Calendar - Left/Main */}
                    <div className="lg:col-span-2">
                        <PracticeCalendar
                            onDateClick={handleDateClick}
                            onAddPractice={handleAddPractice}
                        />
                    </div>

                    {/* Sidebar - Right */}
                    <div className="space-y-6">
                        {/* Upcoming Practices */}
                        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="w-5 h-5 text-teal-600"/>
                                <h3 className="font-bold text-gray-900">Upcoming Practices</h3>
                            </div>

                            {upcomingPractices.length === 0 ? (
                                <p className="text-gray-500 text-sm">No upcoming practices scheduled</p>
                            ) : (
                                <div className="space-y-3">
                                    {upcomingPractices.map((practice) => {
                                        const date = new Date(practice.scheduled_date);
                                        return (
                                            <div
                                                key={practice.id}
                                                onClick={() => handleDateClick(date)}
                                                className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                                            >
                                                <div className="text-sm font-semibold text-gray-900 mb-1">
                                                    {date.toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                    {practice.scheduled_time && ` • ${practice.scheduled_time}`}
                                                </div>
                                                <div className="text-xs text-gray-600">
                                                    Exercise #{practice.exercise_id}
                                                    {practice.duration_minutes && ` • ${practice.duration_minutes} min`}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Quick Stats */}
                        <div
                            className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 p-6">
                            <h3 className="font-bold text-gray-900 mb-4">This Week</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Scheduled</span>
                                    <span className="font-bold text-gray-900">
                                        {upcomingPractices.length} sessions
                                    </span>
                                </div>
                                {/* Add more stats as needed */}
                            </div>
                        </div>

                        {/* Tips */}
                        <div
                            className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200 p-6">
                            <h3 className="font-bold text-gray-900 mb-3">💡 Practice Tips</h3>
                            <ul className="space-y-2 text-sm text-gray-700">
                                <li>• Schedule practice at the same time daily</li>
                                <li>• Start with breathing exercises</li>
                                <li>• Take breaks every 20 minutes</li>
                                <li>• Track your progress consistently</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {selectedDate && (
                <DayView
                    date={selectedDate}
                    onClose={closeDayView}
                    onAddPractice={handleAddPractice}
                    onEditEntry={handleEditEntry}
                    onStartPractice={handleStartPracticeFromCalendar}
                />
            )}

            {showAddModal && modalDate && (
                <AddPracticeModal
                    date={modalDate}
                    existingEntry={editingEntry}
                    onClose={closeAddModal}
                />
            )}


            <MetronomeSidebar/>
        </div>
    );
};

export default CalendarPage;