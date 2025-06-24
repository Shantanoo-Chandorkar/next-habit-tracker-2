import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(30, 'Category name cannot exceed 30 characters'),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color'),
  icon: z.string().min(1, 'Icon is required'),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user?.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await connectDB();

  if (req.method === 'GET') {
    try {
      const categories = await Category.find({ 
        $or: [
          { userId: session.user.id },
          { isDefault: true }
        ]
      }).sort({ isDefault: -1, name: 1 });

      res.status(200).json(categories);
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, color, icon } = categorySchema.parse(req.body);

      // Check if category already exists for this user
      const existingCategory = await Category.findOne({
        userId: session.user.id,
        name: { $regex: new RegExp(`^${name}$`, 'i') }
      });

      if (existingCategory) {
        return res.status(400).json({ message: 'Category with this name already exists' });
      }

      const category = await Category.create({
        name,
        color,
        icon,
        userId: session.user.id,
        isDefault: false,
      });

      res.status(201).json(category);
    } catch (error) {
      console.error('Create category error:', error);
      
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