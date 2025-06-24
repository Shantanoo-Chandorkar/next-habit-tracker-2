'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Filter } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  color: string;
  icon: string;
  isDefault: boolean;
}

interface DashboardHeaderProps {
  view: 'day' | 'week' | 'month' | 'year';
  onViewChange: (view: 'day' | 'week' | 'month' | 'year') => void;
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  categories: Category[];
  onAddHabit: () => void;
  onAddCategory: () => void;
}

export function DashboardHeader({
  view,
  onViewChange,
  selectedCategory,
  onCategoryChange,
  categories,
  onAddHabit,
  onAddCategory,
}: DashboardHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Your Habits Dashboard
          </h1>
          <p className="text-gray-600">
            Track your progress and build lasting habits
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* View Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <Select value={view} onValueChange={onViewChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="year">Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category._id} value={category._id}>
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span>{category.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onAddCategory}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Category</span>
            </Button>
            <Button
              size="sm"
              onClick={onAddHabit}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Habit</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}