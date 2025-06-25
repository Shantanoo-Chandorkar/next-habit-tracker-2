// app/api/habits/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Habit from '@/models/Habit';
import Category from '@/models/Category';
import { z } from 'zod';

const habitSchema = z.object({
  name: z.string().min(1, 'Habit name is required').max(50, 'Habit name cannot exceed 50 characters'),
  description: z.string().max(200, 'Description cannot exceed 200 characters').optional(),
  categoryId: z.string().min(1, 'Category is required'),
  frequency: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
  targetCount: z.number().min(1, 'Target count must be at least 1').default(1),
  reminderEnabled: z.boolean().optional(),
  reminderTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time format (HH:MM)')
    .optional()
    .or(z.literal('')),
}).superRefine((data, ctx) => {
  if (data.reminderEnabled && !data.reminderTime) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Reminder time is required if reminders are enabled',
      path: ['reminderTime'],
    });
  }
});

/**
 * Get habits corresponding to the categories dropdown filter on the Dashboard page .
 * @param request 
 * @returns 
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();

  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const view = searchParams.get('view') || 'day';

    const filter: any = {
      userId: session.user.id,
      isActive: true,
    };

    if (categoryId && categoryId !== 'all') {
      filter.categoryId = categoryId;
      // filter.view = view;
    }

    const habits = await Habit.find(filter)
      .populate('categoryId', 'name color icon')
      .sort({ createdAt: -1 });

    return NextResponse.json(habits, { status: 200 });
  } catch (error) {
    console.error('Get habits error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Create new habit 
 * @param request 
 * @returns 
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();

  try {
    const body = await request.json();
    const validatedData = habitSchema.parse(body);

    const category = await Category.findOne({
      _id: validatedData.categoryId,
      $or: [
        { userId: session.user.id },
        { isDefault: true },
      ],
    });

    if (!category) {
      return NextResponse.json({ message: 'Invalid category' }, { status: 400 });
    }

    const habit = await Habit.create({
      ...validatedData,
      userId: session.user.id,
    });

    const populatedHabit = await Habit.findById(habit._id).populate('categoryId', 'name color icon');

    return NextResponse.json(populatedHabit, { status: 201 });
  } catch (error: any) {
    console.error('Create habit error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        message: 'Validation error',
        errors: error.errors,
      }, { status: 400 });
    }

    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
