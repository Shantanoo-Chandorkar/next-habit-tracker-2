// app/api/seed-categories/route.ts

import { NextResponse } from 'next/server';
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

export async function POST(request: Request) {
  try {
    await connectDB();

    const existingCategories = await Category.find({ isDefault: true });

    if (existingCategories.length > 0) {
      return NextResponse.json({ message: 'Default categories already exist' }, { status: 200 });
    }

    const categories = await Category.insertMany(
      defaultCategories.map(cat => ({
        ...cat,
        isDefault: true,
        userId: null,
      }))
    );

    return NextResponse.json(
      {
        message: 'Default categories created successfully',
        categories,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Seed categories error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error', error },
      { status: 500 }
    );
  }
}
