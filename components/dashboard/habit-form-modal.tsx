'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  color: string;
  icon: string;
  isDefault: boolean;
}

interface Habit {
  _id?: string;
  name: string;
  description?: string;
  categoryId: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  targetCount: number;
  reminderTime?: string;
  reminderEnabled: boolean;
}

interface HabitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (habit: Omit<Habit, '_id'>) => Promise<void>;
  categories: Category[];
  habit?: Habit;
  isEditing?: boolean;
}

export function HabitFormModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  habit,
  isEditing = false,
}: HabitFormModalProps) {
  const [formData, setFormData] = useState<Omit<Habit, '_id'>>({
    name: '',
    description: '',
    categoryId: '',
    frequency: 'daily',
    targetCount: 1,
    reminderTime: '',
    reminderEnabled: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (habit && isEditing) {
      setFormData({
        name: habit.name,
        description: habit.description || '',
        categoryId: habit.categoryId,
        frequency: habit.frequency,
        targetCount: habit.targetCount,
        reminderTime: habit.reminderTime || '',
        reminderEnabled: habit.reminderEnabled,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        categoryId: '',
        frequency: 'daily',
        targetCount: 1,
        reminderTime: '',
        reminderEnabled: false,
      });
    }
    setError('');
  }, [habit, isEditing, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!formData.name.trim()) {
        throw new Error('Habit name is required');
      }
      if (!formData.categoryId) {
        throw new Error('Category is required');
      }

      await onSubmit(formData);
      onClose();
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Habit' : 'Create New Habit'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update your habit details below.' 
              : 'Add a new habit to track your progress.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Habit Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Morning Exercise"
              maxLength={50}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Optional description of your habit"
              maxLength={200}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Category *</Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) => handleInputChange('categoryId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span>{category.name}</span>
                      {category.isDefault && (
                        <span className="text-xs text-gray-500">(Default)</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                  handleInputChange('frequency', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetCount">Target Count</Label>
              <Input
                id="targetCount"
                type="number"
                min="1"
                max="100"
                value={formData.targetCount}
                onChange={(e) => handleInputChange('targetCount', parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="reminderEnabled">Enable Reminders</Label>
              <Switch
                id="reminderEnabled"
                checked={formData.reminderEnabled}
                onCheckedChange={(checked) => handleInputChange('reminderEnabled', checked)}
              />
            </div>

            {formData.reminderEnabled && (
              <div className="space-y-2">
                <Label htmlFor="reminderTime">Reminder Time</Label>
                <Input
                  id="reminderTime"
                  type="time"
                  value={formData.reminderTime}
                  onChange={(e) => handleInputChange('reminderTime', e.target.value)}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isLoading ? 'Saving...' : isEditing ? 'Update Habit' : 'Create Habit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}