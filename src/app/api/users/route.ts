import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { userSchema } from '@/lib/formValidationSchemas';
import { clerkClient } from '@clerk/nextjs/server';
import { Role } from '@prisma/client';

// Fetch all users
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
      },
      orderBy: { lastName: 'asc' },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'Error fetching users' }, { status: 500 });
  }
}

// Create a new user
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate form data
    const validated = userSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ message: 'Invalid data', errors: validated.error.flatten() }, { status: 400 });
    }

    const { email, password, firstName, lastName, role, isActive } = validated.data;

    // Password is strictly required for creation
    if (!password) {
        return NextResponse.json({ message: 'Password is required for new users' }, { status: 400 });
    }

    // Create user in clerk first
    const client = await clerkClient();

    const clerkUser = await client.users.createUser({
      emailAddress: [email],
      password: password,
      firstName: firstName,
      lastName: lastName,
      publicMetadata: { role: role.toLowerCase() }
    });

    // Using Clerk's role, create the user in the db with this user_id from clerk
    try {
      const newUser = await prisma.user.create({
        data: {
          id: clerkUser.id, 
          email,
          password: password, 
          firstName,
          lastName,
          role: role as Role,
          isActive: isActive === 'yes',
        },
      });

      const { password: _, ...userToReturn } = newUser;
      return NextResponse.json(userToReturn, { status: 201 });

    } catch (prismaError) {
      console.error("CRITICAL: Created Clerk user but failed to create DB user.", clerkUser.id, prismaError);
      throw prismaError; 
    }

  } catch (error: any) {
    if (error.clerkError && error.errors && error.errors.length > 0) {
        const clerkMessage = error.errors[0].longMessage || 'Error from Clerk';
        return NextResponse.json({ message: clerkMessage }, { status: 400 });
    }

    if (error.code === 'P2002') {
      return NextResponse.json({ message: 'Email already exists in the system.' }, { status: 409 });
    }

    console.error('Error creating user:', error);
    return NextResponse.json({ message: error.message || 'Error creating user' }, { status: 500 });
  }
}