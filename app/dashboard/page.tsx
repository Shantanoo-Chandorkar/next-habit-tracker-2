'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DateSlider } from '@/components/dashboard/date-slider';
import { HabitCard } from '@/components/dashboard/habit-card';
import { HabitFormModal } from '@/components/dashboard/habit-form-modal';
import { CategoryFormModal } from '@/components/dashboard/category-form-modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, TrendingUp, Target, Award } from 'lucide-react';
import { toast } from 'sonner';
import { format, startOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval } from 'date-fns';

interface Category {
  _id: string;
  name: string;
  color: string;
  icon: string;
  isDefault: boolean;
}

interface Habit {
  _id: string;
  name: string;
  description?: string;
  categoryId: Category;
  frequency: 'daily' | 'weekly' | 'monthly';
  targetCount: number;
  currentStreak: number;
  longestStreak: number;
  reminderTime?: string;
  reminderEnabled: boolean;
}

interface HabitEntry {
  _id: string;
  habitId: string;
  completed: boolean;
  completedCount: number;
  notes?: string;
  date: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // State management
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [view, setView] = useState<'day' | 'week' | 'month' | 'year'>('day');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitEntries, setHabitEntries] = useState<HabitEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Authentication check
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.push('/auth/signin');
  }, [session, status, router]);

  // Initialize data
  useEffect(() => {
    if (session) {
      initializeData();
    }
  }, [session]);

  // Fetch data when filters change
  useEffect(() => {
    if (session) {
      fetchHabits();
      fetchHabitEntries();
    }
  }, [session, selectedCategory, selectedDate, view]);

  const initializeData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        seedDefaultCategories(),
        fetchCategories(),
        fetchHabits(),
        fetchHabitEntries(),
      ]);
    } catch (error) {
      console.error('Failed to initialize data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const seedDefaultCategories = async () => {
    try {
      await fetch('/api/seed-categories', { method: 'POST' });
    } catch (error) {
      console.error('Failed to seed categories:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const fetchHabits = async () => {
    try {
      const params = new URLSearchParams({
        categoryId: selectedCategory,
        view,
      });
      
      const response = await fetch(`/api/habits?${params}`);
      if (!response.ok) throw new Error('Failed to fetch habits');
      const data = await response.json();
      setHabits(data);
    } catch (error) {
      console.error('Failed to fetch habits:', error);
      toast.error('Failed to load habits');
    }
  };

  const fetchHabitEntries = async () => {
    try {
      let startDate: Date;
      let endDate: Date;

      switch (view) {
        case 'week':
          startDate = startOfWeek(selectedDate);
          endDate = endOfWeek(selectedDate);
          break;
        case 'month':
          startDate = startOfMonth(selectedDate);
          endDate = endOfMonth(selectedDate);
          break;
        case 'year':
          startDate = startOfYear(selectedDate);
          endDate = endOfYear(selectedDate);
          break;
        default:
          startDate = selectedDate;
          endDate = selectedDate;
      }

      const params = new URLSearchParams({
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
      });
      
      const response = await fetch(`/api/habits/entries?${params}`);
      if (!response.ok) throw new Error('Failed to fetch habit entries');
      const data = await response.json();
      setHabitEntries(data);
    } catch (error) {
      console.error('Failed to fetch habit entries:', error);
      toast.error('Failed to load habit progress');
    }
  };

  const handleToggleHabitComplete = async (habitId: string, completed: boolean) => {
    try {
      const response = await fetch('/api/habits/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          habitId,
          date: format(selectedDate, 'yyyy-MM-dd'),
          completed,
          completedCount: completed ? 1 : 0,
        }),
      });

      if (!response.ok) throw new Error('Failed to update habit');
      
      await fetchHabitEntries();
      toast.success(completed ? 'Habit completed!' : 'Habit unchecked');
    } catch (error) {
      console.error('Failed to toggle habit:', error);
      toast.error('Failed to update habit');
    }
  };

  const handleCreateHabit = async (habitData: any) => {
    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(habitData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create habit');
      }

      await fetchHabits();
      toast.success('Habit created successfully!');
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create habit');
    }
  };

  const handleUpdateHabit = async (habitData: any) => {
    if (!editingHabit) return;
    
    try {
      const response = await fetch(`/api/habits/${editingHabit._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(habitData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update habit');
      }

      await fetchHabits();
      toast.success('Habit updated successfully!');
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update habit');
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    if (!confirm('Are you sure you want to delete this habit?')) return;
    
    try {
      const response = await fetch(`/api/habits/${habitId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete habit');
      
      await fetchHabits();
      toast.success('Habit deleted successfully');
    } catch (error) {
      console.error('Failed to delete habit:', error);
      toast.error('Failed to delete habit');
    }
  };

  const handleCreateCategory = async (categoryData: any) => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create category');
      }

      await fetchCategories();
      toast.success('Category created successfully!');
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create category');
    }
  };

  const handleUpdateCategory = async (categoryData: any) => {
    if (!editingCategory) return;
    
    try {
      const response = await fetch(`/api/categories/${editingCategory._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update category');
      }

      await fetchCategories();
      toast.success('Category updated successfully!');
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update category');
    }
  };

  // Loading state
  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Not authenticated
  if (!session) {
    return null;
  }

  // Calculate stats based on view
  const calculateStats = () => {
    let relevantEntries: HabitEntry[] = [];
    let totalDays = 1;

    switch (view) {
      case 'week':
        const weekStart = startOfWeek(selectedDate);
        const weekEnd = endOfWeek(selectedDate);
        const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
        totalDays = weekDays.length;
        relevantEntries = habitEntries.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate >= weekStart && entryDate <= weekEnd;
        });
        break;
      case 'month':
        const monthStart = startOfMonth(selectedDate);
        const monthEnd = endOfMonth(selectedDate);
        const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
        totalDays = monthDays.length;
        relevantEntries = habitEntries.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate >= monthStart && entryDate <= monthEnd;
        });
        break;
      case 'year':
        const yearStart = startOfYear(selectedDate);
        const yearEnd = endOfYear(selectedDate);
        const yearDays = eachDayOfInterval({ start: yearStart, end: yearEnd });
        totalDays = yearDays.length;
        relevantEntries = habitEntries.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate >= yearStart && entryDate <= yearEnd;
        });
        break;
      default:
        relevantEntries = habitEntries.filter(entry => 
          format(new Date(entry.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
        );
    }

    const completedEntries = relevantEntries.filter(entry => entry.completed);
    const totalHabits = habits.length;
    const maxPossibleCompletions = totalHabits * (view === 'day' ? 1 : totalDays);
    const completionRate = maxPossibleCompletions > 0 ? Math.round((completedEntries.length / maxPossibleCompletions) * 100) : 0;

    return {
      completed: completedEntries.length,
      total: maxPossibleCompletions,
      completionRate,
      totalHabits
    };
  };

  const stats = calculateStats();

  const getStatsLabel = () => {
    switch (view) {
      case 'week':
        return "Week's Progress";
      case 'month':
        return "Month's Progress";
      case 'year':
        return "Year's Progress";
      default:
        return "Today's Progress";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <DashboardHeader
          view={view}
          onViewChange={setView}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
          onAddHabit={() => {
            setEditingHabit(null);
            setIsHabitModalOpen(true);
          }}
          onAddCategory={() => {
            setEditingCategory(null);
            setIsCategoryModalOpen(true);
          }}
        />

        {/* Date Slider */}
        <DateSlider
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          view={view}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-6">
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">{getStatsLabel()}</p>
                  <p className="text-2xl font-bold">{stats.completed}/{stats.total}</p>
                </div>
                <Target className="w-8 h-8 text-green-100" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Completion Rate</p>
                  <p className="text-2xl font-bold">{stats.completionRate}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-100" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Active Habits</p>
                  <p className="text-2xl font-bold">{stats.totalHabits}</p>
                </div>
                <Award className="w-8 h-8 text-purple-100" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Habits List */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {view === 'day' && `Habits for ${format(selectedDate, 'MMMM d, yyyy')}`}
                {view === 'week' && 'This Week\'s Habits'}
                {view === 'month' && 'This Month\'s Habits'}
                {view === 'year' && 'This Year\'s Habits'}
              </span>
              <span className="text-sm font-normal text-gray-500">
                {selectedCategory !== 'all' && 
                  categories.find(c => c._id === selectedCategory)?.name
                }
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {habits.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Target className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No habits found</h3>
                <p className="text-gray-600 mb-4">
                  {selectedCategory !== 'all' 
                    ? 'No habits in this category. Try selecting a different category or create a new habit.'
                    : 'Start building better habits by creating your first habit.'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {habits.map((habit) => {
                  const entry = habitEntries.find(e => 
                    e.habitId === habit._id && 
                    format(new Date(e.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                  );
                  return (
                    <HabitCard
                      key={habit._id}
                      habit={habit}
                      entry={entry}
                      selectedDate={selectedDate}
                      onToggleComplete={handleToggleHabitComplete}
                      onEdit={(habit) => {
                        setEditingHabit(habit);
                        setIsHabitModalOpen(true);
                      }}
                      onDelete={handleDeleteHabit}
                      onViewAnalytics={(habitId) => {
                        router.push(`/dashboard/analytics/${habitId}`);
                      }}
                    />
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modals */}
        <HabitFormModal
          isOpen={isHabitModalOpen}
          onClose={() => {
            setIsHabitModalOpen(false);
            setEditingHabit(null);
          }}
          onSubmit={editingHabit ? handleUpdateHabit : handleCreateHabit}
          categories={categories}
          habit={
            editingHabit
              ? {
                  ...editingHabit,
                  categoryId: editingHabit.categoryId._id,
                }
              : undefined
          }
          isEditing={!!editingHabit}
        />

        <CategoryFormModal
          isOpen={isCategoryModalOpen}
          onClose={() => {
            setIsCategoryModalOpen(false);
            setEditingCategory(null);
          }}
          onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}
          category={editingCategory || undefined}
          isEditing={!!editingCategory}
        />
      </main>
    </div>
  );
}