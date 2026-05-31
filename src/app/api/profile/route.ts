import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/options';
import dbConnect from '@/lib/dbConnect';
import User from '../../../models/user.model';

export async function PUT(request: NextRequest) {
  await dbConnect();

  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { username } = await request.json();
    if (!username) {
      return NextResponse.json({ success: false, message: 'Username is required' }, { status: 400 });
    }

    const existing = await User.findOne({ username, isVerified: true });
    if (existing && existing._id.toString() !== session.user._id) {
      return NextResponse.json({ success: false, message: 'Username already taken' }, { status: 400 });
    }

    await User.findByIdAndUpdate(session.user._id, { username });

    return NextResponse.json({ success: true, message: 'Username updated' }, { status: 200 });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}