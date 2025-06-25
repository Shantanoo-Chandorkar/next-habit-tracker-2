import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import HabitEntry from '@/models/HabitEntry';
import Habit from '@/models/Habit';
import { z } from 'zod';
import { NextResponse } from 'next/server';

const entrySchema = z.object({
  habitId: z.string().min(1, 'Habit ID is required'),
  date: z.string().min(1, 'Date is required'),
  completed: z.boolean(),
  completedCount: z.number().min(0).default(0),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

/**
 * To fetch all the habits on the view filter (Day, Week, Month and Year)
 * @param request 
 * @returns 
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const habitId = searchParams.get('habitId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let filter: any = { userId: session.user.id };

    if (habitId) {
      filter.habitId = habitId;
    }

    if (date) {
      const targetDate = new Date(date as string);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    } else if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }

    const entries = await HabitEntry.find(filter)
      .populate({
        path: 'habitId',
        populate: {
          path: 'categoryId',
          select: 'name color icon'
        }
      })
      .sort({ date: -1 });

    return NextResponse.json(entries, { status: 200 });
  } catch (error) {
    console.error("Get habit entries error: ", error);
    return NextResponse.json("Internal server error", { status: 500 });
  }
}
/**
 * Update the habit upon toggle click
 * @param request 
 * @returns 
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  try {
    const body = await request.json();
    const validatedData = entrySchema.parse(body);

    const { habitId, date, completed, completedCount, notes } = validatedData;

    // Verify habit exists and belongs to user
    const habit = await Habit.findOne({
      _id: habitId,
      userId: session.user.id,
      isActive: true
    });

    if (!habit) {
      return NextResponse.json({ message: 'Invalid habit' }, { status: 400 });
    }

    const entryDate = new Date(date);

    // Upsert habit entry
    const entry = await HabitEntry.findOneAndUpdate(
      {
        habitId,
        userId: session.user.id,
        date: {
          $gte: new Date(entryDate.setHours(0, 0, 0, 0)),
          $lte: new Date(entryDate.setHours(23, 59, 59, 999))
        }
      },
      {
        habitId,
        userId: session.user.id,
        date: new Date(date),
        completed,
        completedCount: completed ? (completedCount || 1) : 0,
        notes,
      },
      {
        upsert: true,
        new: true,
        runValidators: true
      }
    ).populate({
      path: 'habitId',
      populate: {
        path: 'categoryId',
        select: 'name color icon'
      }
    });

    return NextResponse.json(entry, { status: 200 });

  } catch (error) {
    console.error('Create/Update habit entry error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        message: "Validation Error",
        errors: error.errors,
      }, { status: 400 });
    }

    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}