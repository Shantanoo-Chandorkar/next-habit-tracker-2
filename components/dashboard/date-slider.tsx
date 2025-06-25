'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, subDays, isAfter, startOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

interface DateSliderProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  view: 'day' | 'week' | 'month' | 'year';
}

export function DateSlider({ selectedDate, onDateChange, view }: DateSliderProps) {
  const [visibleDates, setVisibleDates] = useState<Date[]>([]);
  const today = startOfDay(new Date());
  const dayAfterTomorrow = addDays(today, 2);

  useEffect(() => {
    generateVisibleDates();
  }, [selectedDate, view]);

  const generateVisibleDates = () => {
    const dates: Date[] = [];
    const startDate = subDays(selectedDate, 7);
    
    for (let i = 0; i < 15; i++) {
      dates.push(addDays(startDate, i));
    }
    
    setVisibleDates(dates);
  };

  const handlePrevious = () => {
    let newDate: Date;
    
    switch (view) {
      case 'day':
        newDate = subDays(selectedDate, 1);
        break;
      case 'week':
        newDate = subDays(selectedDate, 7);
        break;
      case 'month':
        newDate = subDays(selectedDate, 30);
        break;
      case 'year':
        newDate = subDays(selectedDate, 365);
        break;
      default:
        newDate = subDays(selectedDate, 1);
    }
    
    onDateChange(newDate);
  };

  const handleNext = () => {
    let newDate: Date;
    
    switch (view) {
      case 'day':
        newDate = addDays(selectedDate, 1);
        break;
      case 'week':
        newDate = addDays(selectedDate, 7);
        break;
      case 'month':
        newDate = addDays(selectedDate, 30);
        break;
      case 'year':
        newDate = addDays(selectedDate, 365);
        break;
      default:
        newDate = addDays(selectedDate, 1);
    }
    
    if (!isAfter(newDate, dayAfterTomorrow)) {
      onDateChange(newDate);
    }
  };

  const handleDateClick = (date: Date) => {
    if (!isAfter(date, dayAfterTomorrow)) {
      onDateChange(date);
    }
  };

  const isDateDisabled = (date: Date) => {
    return isAfter(date, dayAfterTomorrow);
  };

  const isDateSelected = (date: Date) => {
    return format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
  };

  const getDateRangeText = () => {
    switch (view) {
      case 'week':
        const weekStart = startOfWeek(selectedDate);
        const weekEnd = endOfWeek(selectedDate);
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      case 'month':
        return format(selectedDate, 'MMMM yyyy');
      case 'year':
        return format(selectedDate, 'yyyy');
      default:
        return format(selectedDate, 'MMMM d, yyyy');
    }
  };

  return (
    <div className="flex items-center space-x-4 bg-white rounded-lg shadow-sm border p-4">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrevious}
        className="h-8 w-8 p-0"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {view === 'day' ? (
        <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
          {visibleDates.map((date) => {
            const disabled = isDateDisabled(date);
            const selected = isDateSelected(date);
            const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');

            return (
              <button
                key={format(date, 'yyyy-MM-dd')}
                onClick={() => handleDateClick(date)}
                disabled={disabled}
                className={`
                  flex flex-col items-center justify-center min-w-[60px] h-16 rounded-lg border-2 transition-all duration-200
                  ${selected 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : disabled 
                      ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                  ${isToday && !selected ? 'border-orange-300 bg-orange-50' : ''}
                `}
              >
                <span className="text-xs font-medium">
                  {format(date, 'EEE')}
                </span>
                <span className={`text-lg font-bold ${selected ? 'text-blue-700' : disabled ? 'text-gray-400' : 'text-gray-900'}`}>
                  {format(date, 'd')}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 text-center">
          <span className="text-lg font-semibold text-gray-900">
            {getDateRangeText()}
          </span>
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={handleNext}
        disabled={view === 'day' ? isAfter(addDays(selectedDate, 1), dayAfterTomorrow) : false}
        className="h-8 w-8 p-0"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}