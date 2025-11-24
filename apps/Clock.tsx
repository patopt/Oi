
import React, { useState } from 'react';
import DatePicker from '../components/ui/DatePicker';
import { Clock as ClockIcon } from 'lucide-react';

const Clock: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    return (
        <div className="h-full flex flex-col bg-gray-900 text-white p-6 items-center">
            <div className="text-center mb-8">
                <ClockIcon size={48} className="mx-auto mb-4 text-blue-500" />
                <h1 className="text-4xl font-light font-mono">
                    {selectedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </h1>
                <p className="text-gray-400 mt-2">
                    {selectedDate.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>

            <div className="w-full max-w-md flex-1 relative">
                <DatePicker onDateChange={setSelectedDate} />
            </div>
            
            <p className="text-xs text-gray-600 mt-4">XlineOS Time System</p>
        </div>
    );
};

export default Clock;
