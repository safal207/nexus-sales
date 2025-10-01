import { NextRequest, NextResponse } from 'next/server';
import { Funnel } from '../../../../stores/funnelStore';

// Mock storage - in real app would use database
const funnels = new Map<string, Funnel>();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const funnelId = resolvedParams.id;
    const body = await request.json();

    if (!funnels.has(funnelId)) {
      return NextResponse.json(
        { error: 'Funnel not found' },
        { status: 404 }
      );
    }

    const updatedFunnel: Funnel = {
      ...body,
      id: funnelId,
      analytics: {
        ...body.analytics,
        updatedAt: new Date(),
      },
    };

    funnels.set(funnelId, updatedFunnel);

    return NextResponse.json({
      success: true,
      funnel: updatedFunnel
    });

  } catch (error) {
    console.error('Error updating funnel:', error);
    return NextResponse.json(
      { error: 'Failed to update funnel' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const funnelId = resolvedParams.id;

    if (!funnels.has(funnelId)) {
      return NextResponse.json(
        { error: 'Funnel not found' },
        { status: 404 }
      );
    }

    funnels.delete(funnelId);

    return NextResponse.json({
      success: true,
      message: 'Funnel deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting funnel:', error);
    return NextResponse.json(
      { error: 'Failed to delete funnel' },
      { status: 500 }
    );
  }
}
