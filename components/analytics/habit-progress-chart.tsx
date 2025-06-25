'use client';

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO, eachDayOfInterval, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

interface HabitEntry {
  _id: string;
  habitId: string;
  completed: boolean;
  completedCount: number;
  notes?: string;
  date: string;
}

interface HabitProgressChartProps {
  entries: HabitEntry[];
  view: 'week' | 'month' | 'year';
  habitColor: string;
}

export function HabitProgressChart({ entries, view, habitColor }: HabitProgressChartProps) {
  const chartData = useMemo(() => {
    const today = new Date();
    let dateRange: Date[] = [];
    let dateFormat = 'MMM d';

    // Generate date range based on view
    switch (view) {
      case 'week':
        const weekStart = subDays(today, 30);
        const weekEnd = today;
        dateRange = eachDayOfInterval({ start: weekStart, end: weekEnd });
        dateFormat = 'MMM d';
        break;
      case 'month':
        const monthStart = subDays(today, 90);
        const monthEnd = today;
        dateRange = eachDayOfInterval({ start: monthStart, end: monthEnd });
        dateFormat = 'MMM d';
        break;
      case 'year':
        const yearStart = subDays(today, 365);
        const yearEnd = today;
        dateRange = eachDayOfInterval({ start: yearStart, end: yearEnd });
        dateFormat = 'MMM yyyy';
        break;
    }

    // Create a map of entries by date
    const entriesMap = new Map();
    entries.forEach(entry => {
      const dateKey = format(parseISO(entry.date), 'yyyy-MM-dd');
      entriesMap.set(dateKey, entry);
    });

    // Generate chart data with progress logic
    let currentProgress = 0;
    const data = dateRange.map((date, index) => {
      const dateKey = format(date, 'yyyy-MM-dd');
      const entry = entriesMap.get(dateKey);
      
      if (entry) {
        if (entry.completed) {
          // Habit completed - line goes up
          currentProgress += 1;
        } else {
          // Habit not completed - line goes down
          currentProgress = Math.max(0, currentProgress - 1);
        }
      } else {
        // No entry for this date - line stays same (horizontal)
        // currentProgress remains unchanged
      }

      return {
        date: format(date, dateFormat),
        progress: currentProgress,
        completed: entry?.completed || false,
        hasEntry: !!entry,
      };
    });

    // For better visualization, we might want to sample data for year view
    if (view === 'year') {
      // Sample every 7th day for year view to avoid overcrowding
      return data.filter((_, index) => index % 7 === 0);
    }

    return data;
  }, [entries, view]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-gray-600">
            Progress: {data.progress}
          </p>
          <p className="text-sm">
            Status: {data.hasEntry ? (data.completed ? 'Completed' : 'Not Completed') : 'No Entry'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            stroke="#666"
            fontSize={12}
            tick={{ fill: '#666' }}
          />
          <YAxis 
            stroke="#666"
            fontSize={12}
            tick={{ fill: '#666' }}
            label={{ value: 'Progress', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="progress"
            stroke={habitColor}
            strokeWidth={3}
            dot={(props) => {
              const { cx, cy, payload } = props;
              if (!payload.hasEntry) {
                return <circle cx={cx} cy={cy} r={3} fill="#d1d5db" stroke={habitColor} strokeWidth={2} />;
              }
              return (
                <circle 
                  cx={cx} 
                  cy={cy} 
                  r={4} 
                  fill={payload.completed ? '#10b981' : '#ef4444'} 
                  stroke={habitColor} 
                  strokeWidth={2} 
                />
              );
            }}
            activeDot={{ r: 6, fill: habitColor }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}