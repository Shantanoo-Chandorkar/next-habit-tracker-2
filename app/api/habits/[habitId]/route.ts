// app/api/habits/[id]/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Habit from '@/models/Habit';
import HabitEntry from '@/models/HabitEntry';
import Category from '@/models/Category';
import { z } from 'zod';

const habitSchema = z.object({
  name: z.string().min(1, 'Habit name is required').max(50, 'Habit name cannot exceed 50 characters'),
  description: z.string().max(200, 'Description cannot exceed 200 characters').optional(),
  categoryId: z.string().min(1, 'Category is required'),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  targetCount: z.number().min(1, 'Target count must be at least 1'),
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
 * Fetch the habit based on the Habit Id
 * @param request 
 * @param param1 
 * @returns 
 */
export async function GET(request: Request, { params }: { params: { habitId: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { habitId } = params;

  if (!habitId) {
    return NextResponse.json({ message: 'Invalid habit ID' }, { status: 400 });
  }

  try {
    await connectDB();
    const habit = await Habit.findOne(
      { _id: habitId, userId: session.user.id },
    );

    if (!habit) {
      return NextResponse.json({ message: 'Habit not found' }, { status: 404 });
    }

    return NextResponse.json(habit, { status: 200 });
  } catch (error) {
    console.error('Fetch habit error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Update the Habit from the edit button on Habit Card
 * @param request 
 * @param param1 
 * @returns 
 */
export async function PUT(request: Request, { params }: { params: { habitId: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { habitId } = params;

  if (!habitId) {
    return NextResponse.json({ message: 'Invalid habit ID' }, { status: 400 });
  }


  try {
    await connectDB();
    const body = await request.json();
    const validatedData = habitSchema.parse(body);

    const category = await Category.findOne({
      _id: validatedData.categoryId,
      $or: [
        { userId: session.user.id },
        { isDefault: true }
      ]
    });

    if (!category) {
      return NextResponse.json({ message: 'Invalid category' }, { status: 400 });
    }

    const habit = await Habit.findOneAndUpdate(
      { _id: habitId, userId: session.user.id },
      validatedData,
      { new: true, runValidators: true }
    ).populate('categoryId', 'name color icon');

    if (!habit) {
      return NextResponse.json({ message: 'Habit not found' }, { status: 404 });
    }

    return NextResponse.json(habit, { status: 200 });

  } catch (error: any) {
    console.error('Update habit error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}


/**
 * Delete the habit from the Delete button from the Habit Card.
 * @param request 
 * @param param1 
 * @returns 
 */
export async function DELETE(request: Request, { params }: { params: { habitId: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { habitId } = params;

  if (!habitId) {
    return NextResponse.json({ message: 'Invalid habit ID' }, { status: 400 });
  }

  try {
    await connectDB();

    const habit = await Habit.findOneAndDelete(
      { _id: habitId, userId: session.user.id },
    );

    const habitEntries = await HabitEntry.deleteMany({
      habitId,
      userId: session.user.id,
    })

    if (!habit) {
      return NextResponse.json({ message: 'Habit not found' }, { status: 404 });
    }

    if (!habitEntries) {
      return NextResponse.json({ message: 'Habit Entries not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Habit and associated entries are deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Delete habit error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
