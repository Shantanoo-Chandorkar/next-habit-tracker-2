import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import { z } from 'zod';
import { NextResponse } from 'next/server';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(30, 'Category name cannot exceed 30 characters'),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color'),
  icon: z.string().min(1, 'Icon is required'),
});

/**
 * Update the category from the Delete button from the Habit Card.
 * @param request 
 * @param param1 
 * @returns 
 */
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const { id } = params;

  if (!id || typeof id !== "string") {
    return NextResponse.json({ message: 'Invalid habit ID' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const validatedData = categorySchema.parse(body);

    const { name, color, icon } = validatedData;

    const category = await Category.findOneAndUpdate(
      { _id: id, userId: session.user.id, isDefault: false },
      { name, color, icon },
      { new: true, runValidators: true }
    );

    if (!category) {
      return NextResponse.json({ message: "Category not found or cannot be edited" }, { status: 404 });
    }

    return NextResponse.json(category, { status: 200 });
  } catch (error) {
    console.error('Update category error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        message: "Validation Error",
        errors: error.errors,
      },
        { status: 400 })
    }

    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * Delete the category from the Delete button from the Habit Card.
 * @param request 
 * @param param1 
 * @returns 
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  if (!id) {
    return NextResponse.json({ message: 'Invalid habit ID' }, { status: 400 });
  }

  await connectDB();

  try {
    const category = await Category.findOneAndDelete({
      _id: id,
      userId: session.user.id,
      isDefault: false
    });

    if (!category) {
      return NextResponse.json({ message: 'Category not found or cannot be deleted' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Category deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}