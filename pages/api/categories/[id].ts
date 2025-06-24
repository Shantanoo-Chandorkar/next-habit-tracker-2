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

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid category ID' });
  }

  await connectDB();

  if (req.method === 'PUT') {
    try {
      const { name, color, icon } = categorySchema.parse(req.body);

      const category = await Category.findOneAndUpdate(
        { _id: id, userId: session.user.id, isDefault: false },
        { name, color, icon },
        { new: true, runValidators: true }
      );

      if (!category) {
        return res.status(404).json({ message: 'Category not found or cannot be edited' });
      }

      res.status(200).json(category);
    } catch (error) {
      console.error('Update category error:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation error',
          errors: error.errors,
        });
      }

      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const category = await Category.findOneAndDelete({
        _id: id,
        userId: session.user.id,
        isDefault: false
      });

      if (!category) {
        return res.status(404).json({ message: 'Category not found or cannot be deleted' });
      }

      res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
      console.error('Delete category error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}