'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const predefinedColors = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308',
  '#84CC16', '#22C55E', '#10B981', '#14B8A6',
  '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
  '#8B5CF6', '#A855F7', '#D946EF', '#EC4899',
];

const iconOptions = [
  'Heart', 'Dumbbell', 'BookOpen', 'Brain', 'Target', 'Users',
  'Palette', 'User', 'Coffee', 'Music', 'Camera', 'Gamepad2',
  'Utensils', 'Car', 'Home', 'Briefcase'
];

interface Category {
  _id?: string;
  name: string;
  color: string;
  icon: string;
  isDefault?: boolean;
}

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (category: Omit<Category, '_id' | 'isDefault'>) => Promise<void>;
  category?: Category;
  isEditing?: boolean;
}

export function CategoryFormModal({
  isOpen,
  onClose,
  onSubmit,
  category,
  isEditing = false,
}: CategoryFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    color: predefinedColors[0],
    icon: iconOptions[0],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (category && isEditing) {
      setFormData({
        name: category.name,
        color: category.color,
        icon: category.icon,
      });
    } else {
      setFormData({
        name: '',
        color: predefinedColors[0],
        icon: iconOptions[0],
      });
    }
    setError('');
  }, [category, isEditing, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!formData.name.trim()) {
        throw new Error('Category name is required');
      }

      await onSubmit(formData);
      onClose();
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Category' : 'Create New Category'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update your category details below.' 
              : 'Add a new category to organize your habits.'
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
            <Label htmlFor="name">Category Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Health & Fitness"
              maxLength={30}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="grid grid-cols-8 gap-2">
              {predefinedColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleInputChange('color', color)}
                  className={`
                    w-8 h-8 rounded-full border-2 transition-all duration-200
                    ${formData.color === color 
                      ? 'border-gray-900 scale-110' 
                      : 'border-gray-300 hover:border-gray-400'
                    }
                  `}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="grid grid-cols-8 gap-2">
              {iconOptions.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => handleInputChange('icon', icon)}
                  className={`
                    w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all duration-200
                    ${formData.icon === icon 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }
                  `}
                >
                  <span className="text-sm">{icon.charAt(0)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div
              className="w-6 h-6 rounded-full"
              style={{ backgroundColor: formData.color }}
            />
            <span className="font-medium">{formData.name || 'Category Name'}</span>
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
              {isLoading ? 'Saving...' : isEditing ? 'Update Category' : 'Create Category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}