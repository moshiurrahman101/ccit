import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    message: 'সফলভাবে লগআউট হয়েছে'
  });
}
