import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import { z } from 'zod';
import { NextResponse } from 'next/server';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(30, 'Category name cannot exceed 30 characters'),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color'),
  icon: z.string().min(1, 'Icon is required'),
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  try {
    const categories = await Category.find({
      $or: [
        { userId: session.user.id },
        { isDefault: true }
      ]
    }).sort({ isDefault: -1, name: 1 });

    return NextResponse.json(categories, { status: 200 });

  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  try {
    const body = await request.json();
    const validatedData = categorySchema.parse(body);

    const { name, color, icon } = validatedData;

    // Check if category already exists for this user
    const existingCategory = await Category.findOne({
      userId: session.user.id,
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });

    if (existingCategory) {
      return NextResponse.json({ message: "Category with this name already exist." }, { status: 400 });
    }

    const category = await Category.create({
      name,
      color,
      icon,
      userId: session.user.id,
      isDefault: false,
    });

    return NextResponse.json(category, { status: 200 });

  } catch (error) {
    console.error("Create Category Error: ", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        message: "Validation Error",
        errors: error.errors,
      }, { status: 400 });
    }

    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });

  }
}