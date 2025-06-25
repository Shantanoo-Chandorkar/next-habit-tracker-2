'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, AlertCircle, TrendingUp, Target, Award, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval } from 'date-fns';
import { HabitProgressChart } from '@/components/analytics/habit-progress-chart';
import { usePathname } from 'next/navigation';

interface Category {
  _id: string;
  name: string;
  color: string;
  icon: string;
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
  createdAt: string;
}

interface HabitEntry {
  _id: string;
  habitId: string;
  completed: boolean;
  completedCount: number;
  notes?: string;
  date: string;
}

export default function HabitAnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  
  // State management
  const [habit, setHabit] = useState<Habit | null>(null);
  const [habitEntries, setHabitEntries] = useState<HabitEntry[]>([]);
  const [view, setView] = useState<'week' | 'month' | 'year'>('week');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [habitId, setHabitId] = useState<string | undefined>();

  useEffect(() => {
    const segments = pathname?.split('/');
    const idFromPath = segments?.[segments.length - 1]; // last segment
    setHabitId(idFromPath); // use local state to store it
  }, [pathname]);

  // Authentication check
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.push('/auth/signin');
  }, [session, status, router]);

  // Initialize data
  useEffect(() => {
    if (session && habitId) {
      initializeData();
    }
  }, [session, habitId, view]);

  const initializeData = async () => {
    // setIsLoading(true);
    try {
      await Promise.all([
        fetchHabit(),
        fetchHabitEntries(),
      ]);
    } catch (error) {
      console.error('Failed to initialize data:', error);
      setError('Failed to load analytics data');
    } finally {
      // setIsLoading(false);
    }
  };

  const fetchHabit = async () => {
    try {
      const response = await fetch(`/api/habits/${habitId}`);
      if (!response.ok) throw new Error('Failed to fetch habit');
      const data = await response.json();
      setHabit(data);
    } catch (error) {
      console.error('Failed to fetch habit:', error);
      toast.error('Failed to load habit details');
    }
  };

  const fetchHabitEntries = async () => {
    try {
      const today = new Date();
      let startDate: Date;

      switch (view) {
        case 'week':
          startDate = subDays(today, 30); // Last 30 days for better week view
          break;
        case 'month':
          startDate = subDays(today, 90); // Last 3 months
          break;
        case 'year':
          startDate = subDays(today, 365); // Last year
          break;
        default:
          startDate = subDays(today, 30);
      }

      const params = new URLSearchParams({
        habitId: habitId ?? '',
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(today, 'yyyy-MM-dd'),
      });
      
      const response = await fetch(`/api/habits/entries/analytics?${params}`);
      if (!response.ok) throw new Error('Failed to fetch habit entries');
      const data = await response.json();
      setHabitEntries(data);
    } catch (error) {
      console.error('Failed to fetch habit entries:', error);
      toast.error('Failed to load habit progress data');
    }
  };

  // Loading state
  if (status === 'loading') {
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

  if (!habit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Habit not found</AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  // Calculate analytics
  const calculateAnalytics = () => {
    const today = new Date();
    const completedEntries = habitEntries.filter(entry => entry.completed);
    const totalEntries = habitEntries.length;
    const completionRate = totalEntries > 0 ? Math.round((completedEntries.length / totalEntries) * 100) : 0;

    // Calculate current streak
    let currentStreak = 0;
    const sortedEntries = [...habitEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    for (const entry of sortedEntries) {
      if (entry.completed) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate best streak
    let bestStreak = 0;
    let tempStreak = 0;
    
    for (const entry of sortedEntries.reverse()) {
      if (entry.completed) {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    return {
      totalCompletions: completedEntries.length,
      totalDays: totalEntries,
      completionRate,
      currentStreak,
      bestStreak,
    };
  };

  const analytics = calculateAnalytics();

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

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{habit.name}</h1>
              <p className="text-gray-600 mt-1">Analytics & Progress Tracking</p>
            </div>
          </div>
          
          <Badge 
            variant="secondary" 
            className="text-sm px-3 py-1"
            style={{ 
              backgroundColor: `${habit.categoryId.color}20`,
              color: habit.categoryId.color,
              borderColor: `${habit.categoryId.color}40`
            }}
          >
            {habit.categoryId.name}
          </Badge>
        </div>

        {/* View Filter */}
        <div className="flex space-x-2 mb-6">
          {(['week', 'month', 'year'] as const).map((viewOption) => (
            <Button
              key={viewOption}
              variant={view === viewOption ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView(viewOption)}
              className="capitalize"
            >
              {viewOption}
            </Button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total Completions</p>
                  <p className="text-2xl font-bold">{analytics.totalCompletions}</p>
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
                  <p className="text-2xl font-bold">{analytics.completionRate}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-100" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Current Streak</p>
                  <p className="text-2xl font-bold">{analytics.currentStreak}</p>
                </div>
                <Award className="w-8 h-8 text-orange-100" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Best Streak</p>
                  <p className="text-2xl font-bold">{analytics.bestStreak}</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-100" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Chart */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Progress Chart</span>
              <span className="text-sm font-normal text-gray-500 capitalize">
                {view} View
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HabitProgressChart
              entries={habitEntries}
              view={view}
              habitColor={habit.categoryId.color}
            />
          </CardContent>
        </Card>

        {/* Habit Details */}
        <Card className="shadow-lg border-0 mt-6">
          <CardHeader>
            <CardTitle>Habit Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-gray-600">{habit.description || 'No description provided'}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Frequency</h4>
                <p className="text-gray-600 capitalize">{habit.frequency}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Target Count</h4>
                <p className="text-gray-600">{habit.targetCount} per {habit.frequency.slice(0, -2)}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Created</h4>
                <p className="text-gray-600">{format(new Date(habit.createdAt), 'MMM d, yyyy')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}