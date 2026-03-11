import { NextResponse } from 'next/server';
import blogData from '../../../data/blog.json';

export async function GET() {
    return NextResponse.json(blogData);
}
