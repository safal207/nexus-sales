import { NextRequest, NextResponse } from 'next/server';
import { Funnel } from '../../../stores/funnelStore';

// Mock storage - in real app would use database
const funnels = new Map<string, Funnel>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const newFunnel: Funnel = {
      id: `funnel_${Date.now()}`,
      name,
      steps: [],
      settings: {
        theme: 'light',
        primaryColor: '#3B82F6',
      },
      analytics: {
        views: 0,
        conversions: 0,
        createdAt: new Date(),
      },
    };

    funnels.set(newFunnel.id, newFunnel);

    return NextResponse.json({
      success: true,
      funnel: newFunnel
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating funnel:', error);
    return NextResponse.json(
      { error: 'Failed to create funnel' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const funnelId = searchParams.get('id');

    if (funnelId) {
      // Get specific funnel
      const funnel = funnels.get(funnelId);
      if (!funnel) {
        return NextResponse.json(
          { error: 'Funnel not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ funnel });
    } else {
      // Get all funnels for current user
      const userFunnels = Array.from(funnels.values());
      return NextResponse.json({ funnels: userFunnels });
    }

  } catch (error) {
    console.error('Error fetching funnels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch funnels' },
      { status: 500 }
    );
  }
}
