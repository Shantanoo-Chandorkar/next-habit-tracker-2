import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';

const defaultCategories = [
  { name: 'Health', color: '#10B981', icon: 'Heart' },
  { name: 'Fitness', color: '#F59E0B', icon: 'Dumbbell' },
  { name: 'Learning', color: '#3B82F6', icon: 'BookOpen' },
  { name: 'Mindfulness', color: '#8B5CF6', icon: 'Brain' },
  { name: 'Productivity', color: '#EF4444', icon: 'Target' },
  { name: 'Social', color: '#06B6D4', icon: 'Users' },
  { name: 'Creative', color: '#EC4899', icon: 'Palette' },
  { name: 'Personal', color: '#84CC16', icon: 'User' },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    // Check if default categories already exist
    const existingCategories = await Category.find({ isDefault: true });
    
    if (existingCategories.length > 0) {
      return res.status(200).json({ message: 'Default categories already exist' });
    }

    // Create default categories
    const categories = await Category.insertMany(
      defaultCategories.map(cat => ({
        ...cat,
        isDefault: true,
        userId: null, // Default categories don't belong to any specific user
      }))
    );

    res.status(201).json({
      message: 'Default categories created successfully',
      categories,
    });
  } catch (error: any) {
    console.error('Seed categories error:', error);
    res.status(500).json({ message: error.message || 'Internal server error', error });
  }
}