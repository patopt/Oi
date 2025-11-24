import React, { useEffect, useRef } from 'react';
import { IosSelector } from '../../lib/IosSelector';
import { datePickerStyles } from './DatePickerStyles';

interface DatePickerProps {
    onDateChange?: (date: Date) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ onDateChange }) => {
    const yearRef = useRef<HTMLDivElement>(null);
    const monthRef = useRef<HTMLDivElement>(null);
    const dayRef = useRef<HTMLDivElement>(null);
    
    // Selectors instances
    const selectors = useRef<{year?: IosSelector, month?: IosSelector, day?: IosSelector}>({});

    // State tracking to prevent infinite loops but kept in refs for IosSelector callbacks
    const current = useRef({
        year: new Date().getFullYear(),
        month: 1,
        day: 1
    });

    const getYears = () => {
        const currentYear = new Date().getFullYear();
        let years = [];
        for (let i = currentYear - 50; i < currentYear + 50; i++) {
            years.push({ value: i, text: `${i}` });
        }
        return years;
    };

    const getMonths = () => {
        let months = [];
        for (let i = 1; i <= 12; i++) {
            // Replaced Chinese with English
            const name = new Date(2000, i-1, 1).toLocaleString('default', { month: 'short' });
            months.push({ value: i, text: name });
        }
        return months;
    };

    const getDays = (year: number, month: number) => {
        let dayCount = new Date(year, month, 0).getDate(); 
        let days = [];
        for (let i = 1; i <= dayCount; i++) {
            days.push({ value: i, text: `${i}` });
        }
        return days;
    };

    useEffect(() => {
        // Inject styles
        const styleId = 'datepicker-styles';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.innerHTML = datePickerStyles;
            document.head.appendChild(style);
        }

        // Initialize Selectors
        if (yearRef.current && monthRef.current && dayRef.current) {
            
            const handleUpdate = () => {
                if (onDateChange) {
                    const date = new Date(current.current.year, current.current.month - 1, current.current.day);
                    onDateChange(date);
                }
            };

            // Day Selector (Init first to be updateable)
            selectors.current.day = new IosSelector({
                el: dayRef.current,
                type: 'infinite',
                source: getDays(current.current.year, current.current.month),
                count: 20,
                onChange: (selected: any) => {
                    current.current.day = selected.value;
                    handleUpdate();
                }
            });

            // Month Selector
            selectors.current.month = new IosSelector({
                el: monthRef.current,
                type: 'infinite',
                source: getMonths(),
                count: 20,
                onChange: (selected: any) => {
                    current.current.month = selected.value;
                    const newDays = getDays(current.current.year, current.current.month);
                    selectors.current.day?.updateSource(newDays);
                    handleUpdate();
                }
            });

            // Year Selector
            selectors.current.year = new IosSelector({
                el: yearRef.current,
                type: 'infinite',
                source: getYears(),
                count: 20,
                onChange: (selected: any) => {
                    current.current.year = selected.value;
                    const newDays = getDays(current.current.year, current.current.month);
                    selectors.current.day?.updateSource(newDays);
                    handleUpdate();
                }
            });

            // Set Initial Values
            const now = new Date();
            setTimeout(() => {
                selectors.current.year?.select(now.getFullYear());
                selectors.current.month?.select(now.getMonth() + 1);
                selectors.current.day?.select(now.getDate());
            }, 100);
        }

        return () => {
            selectors.current.year?.destroy();
            selectors.current.month?.destroy();
            selectors.current.day?.destroy();
        };
    }, []);

    return (
        <div className="date-selector bg-black/50 rounded-xl overflow-hidden backdrop-blur-md">
            <div ref={yearRef} id="year-selector"></div>
            <div ref={monthRef} id="month-selector"></div>
            <div ref={dayRef} id="day-selector"></div>
        </div>
    );
};

export default DatePicker;