import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import connectDB from '@/lib/mongodb';
import HabitEntry from '@/models/HabitEntry';
import Habit from '@/models/Habit';
import { z } from 'zod';

const entrySchema = z.object({
  habitId: z.string().min(1, 'Habit ID is required'),
  date: z.string().min(1, 'Date is required'),
  completed: z.boolean(),
  completedCount: z.number().min(0).default(0),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user?.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await connectDB();

  if (req.method === 'GET') {
    try {
      const { date, habitId, startDate, endDate } = req.query;
      
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

      res.status(200).json(entries);
    } catch (error) {
      console.error('Get habit entries error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { habitId, date, completed, completedCount, notes } = entrySchema.parse(req.body);

      // Verify habit exists and belongs to user
      const habit = await Habit.findOne({
        _id: habitId,
        userId: session.user.id,
        isActive: true
      });

      if (!habit) {
        return res.status(400).json({ message: 'Invalid habit' });
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

      res.status(200).json(entry);
    } catch (error) {
      console.error('Create/Update habit entry error:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation error',
          errors: error.errors,
        });
      }

      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}