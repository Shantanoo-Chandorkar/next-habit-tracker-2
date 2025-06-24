'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Edit, Trash2, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface HabitCardProps {
  habit: {
    _id: string;
    name: string;
    description?: string;
    categoryId: {
      _id: string;
      name: string;
      color: string;
      icon: string;
    };
    frequency: string;
    targetCount: number;
    currentStreak: number;
    reminderTime?: string;
    reminderEnabled: boolean;
  };
  entry?: {
    _id: string;
    completed: boolean;
    completedCount: number;
    notes?: string;
  };
  selectedDate: Date;
  onToggleComplete: (habitId: string, completed: boolean) => void;
  onEdit: (habit: any) => void;
  onDelete: (habitId: string) => void;
}

export function HabitCard({
  habit,
  entry,
  selectedDate,
  onToggleComplete,
  onEdit,
  onDelete,
}: HabitCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isCompleted = entry?.completed || false;

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      await onToggleComplete(habit._id, !isCompleted);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-200 border-l-4" 
          style={{ borderLeftColor: habit.categoryId.color }}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <button
              onClick={handleToggle}
              disabled={isLoading}
              className={`
                w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 mt-1
                ${isCompleted 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
                }
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {isCompleted ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Circle className="w-4 h-4 opacity-0" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <h3 className={`font-medium text-gray-900 ${isCompleted ? 'line-through text-gray-500' : ''}`}>
                {habit.name}
              </h3>
              {habit.description && (
                <p className="text-sm text-gray-600 mt-1">{habit.description}</p>
              )}
              
              <div className="flex items-center space-x-3 mt-2">
                <Badge 
                  variant="secondary" 
                  className="text-xs"
                  style={{ 
                    backgroundColor: `${habit.categoryId.color}20`,
                    color: habit.categoryId.color,
                    borderColor: `${habit.categoryId.color}40`
                  }}
                >
                  {habit.categoryId.name}
                </Badge>
                
                {habit.currentStreak > 0 && (
                  <span className="text-xs text-orange-600 font-medium">
                    🔥 {habit.currentStreak} day streak
                  </span>
                )}
                
                {habit.reminderEnabled && habit.reminderTime && (
                  <span className="text-xs text-blue-600 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {habit.reminderTime}
                  </span>
                )}
              </div>

              {entry?.notes && (
                <p className="text-sm text-gray-500 mt-2 italic">
                  "{entry.notes}"
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(habit)}
              className="h-8 w-8 p-0"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(habit._id)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {isCompleted && (
          <div className="mt-3 text-xs text-green-600 font-medium">
            ✅ Completed on {format(selectedDate, 'MMM d, yyyy')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}