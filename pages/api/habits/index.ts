import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
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
  // reminderTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time format (HH:MM)').optional(),
  // reminderEnabled: z.boolean().default(false),
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user?.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await connectDB();

  if (req.method === 'GET') {
    try {
      const { categoryId, view = 'day' } = req.query;
      
      let filter: any = { userId: session.user.id, isActive: true };
      
      if (categoryId && categoryId !== 'all') {
        filter.categoryId = categoryId;
      }

      const habits = await Habit.find(filter)
        .populate('categoryId', 'name color icon')
        .sort({ createdAt: -1 });

      res.status(200).json(habits);
    } catch (error) {
      console.error('Get habits error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const validatedData = habitSchema.parse(req.body);

      // Verify category exists and belongs to user
      const category = await Category.findOne({
        _id: validatedData.categoryId,
        $or: [
          { userId: session.user.id },
          { isDefault: true }
        ]
      });

      if (!category) {
        return res.status(400).json({ message: 'Invalid category' });
      }

      const habit = await Habit.create({
        ...validatedData,
        userId: session.user.id,
      });

      const populatedHabit = await Habit.findById(habit._id).populate('categoryId', 'name color icon');

      res.status(201).json(populatedHabit);
    } catch (error) {
      console.error('Create habit error:', error);
      
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