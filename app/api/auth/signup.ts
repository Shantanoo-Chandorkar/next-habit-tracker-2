import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { z } from 'zod';
import { NextResponse } from 'next/server';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedData = signupSchema.parse(body);

    const { name, email, password } = validatedData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // return res.status(400).json({ message: 'User already exists with this email' });
      return NextResponse.json({
        message: 'User already exists with this email',
      }, { status: 400 });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Return success response (without password)
    const { password: _, ...userWithoutPassword } = user.toObject();

    return NextResponse.json({
      message: 'User created successfully',
      user: userWithoutPassword,
    }, { status: 200 })

  } catch (error) {

  }
}