import { NextResponse } from 'next/server';
import toolsData from '../../../data/tools.json';

export async function GET() {
    return NextResponse.json(toolsData);
}
