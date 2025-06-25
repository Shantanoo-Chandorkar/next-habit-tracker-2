// app/api/habits/entries/analytics/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import HabitEntry from '@/models/HabitEntry';
import { isValidObjectId } from 'mongoose';

/**
 * Fetch the data Habit Entries data for the analytics page
 * @param req 
 * @returns 
 */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const habitId = searchParams.get('habitId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!habitId || !isValidObjectId(habitId)) {
      return NextResponse.json({ message: 'Invalid habit ID' }, { status: 400 });
    }

    if (!startDate || !endDate) {
      return NextResponse.json({ message: 'Missing date range' }, { status: 400 });
    }

    const entries = await HabitEntry.find({
      habitId,
      userId: session.user.id,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    }).sort({ date: 1 }); // ascending by date

    return NextResponse.json(entries);
  } catch (error) {
    console.error('Failed to fetch analytics entries:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
