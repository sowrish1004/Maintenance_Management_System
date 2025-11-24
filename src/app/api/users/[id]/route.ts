import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { userSchema } from '@/lib/formValidationSchemas';
import { clerkClient } from '@clerk/nextjs/server';
import { Role } from '@prisma/client'; 


export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const parsed = userSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Invalid data', errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password, firstName, lastName, role, isActive } = parsed.data;

    const clerkUpdateData: any = {};
    if (firstName) clerkUpdateData.firstName = firstName;
    if (lastName) clerkUpdateData.lastName = lastName;
    if (password && password.trim() !== '') clerkUpdateData.password = password;
    if (role) clerkUpdateData.publicMetadata = { role: role.toLowerCase() };

    const client = await clerkClient();
    try {
        if (Object.keys(clerkUpdateData).length > 0) {
             await client.users.updateUser(id, clerkUpdateData);
        }
    } catch (clerkError: any) {
        console.error("Error updating Clerk user:", clerkError);
        return NextResponse.json(
            { message: clerkError.errors?.[0]?.longMessage || 'Failed to sync update with Clerk' },
            { status: 400 }
        );
    }

    const prismaUpdateData: any = {
      ...(email && { email }),
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(role && { role: role as Role }),
      ...(isActive !== undefined && { isActive: isActive === 'yes' }),
    };


    if (password && password.trim() !== '') {
        prismaUpdateData.password = password; 
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: prismaUpdateData,
    });

    const { password: _, ...userToReturn } = updatedUser;
    return NextResponse.json(userToReturn, { status: 200 });

  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'User not found in database' }, { status: 404 });
    }
    console.error('Error updating user:', error);
    return NextResponse.json({ message: 'Error updating user' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const client = await clerkClient();

    try {
        await client.users.deleteUser(id);
    } catch (clerkError: any) {
        if (clerkError.status !== 404) {
            console.error("Error deleting from Clerk:", clerkError);
            return NextResponse.json(
                { message: 'Failed to delete user from Clerk' }, 
                { status: 500 }
            );
        }
    }
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'User not found in database' }, { status: 404 });
    }
    console.error('Error deleting user:', error);
    return NextResponse.json({ message: 'Error deleting user' }, { status: 500 });
  }
}