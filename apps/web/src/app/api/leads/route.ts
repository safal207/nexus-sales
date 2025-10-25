import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for leads (in production, use Supabase)
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  source: string; // utm_source
  medium: string; // utm_medium
  campaign: string; // utm_campaign
  referrer?: string;
  createdAt: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
}

const leads = new Map<string, Lead>();

// POST /api/leads - Create a new lead
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required and must be a string' },
        { status: 400 }
      );
    }

    if (!body.email || typeof body.email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required and must be a string' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Create lead
    const leadId = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const lead: Lead = {
      id: leadId,
      name: body.name,
      email: body.email,
      phone: body.phone || undefined,
      message: body.message || undefined,
      source: body.source || 'direct',
      medium: body.medium || 'organic',
      campaign: body.campaign || 'unknown',
      referrer: body.referrer || undefined,
      createdAt: new Date().toISOString(),
      status: 'new',
    };

    leads.set(leadId, lead);

    console.log(`✅ New lead created: ${lead.name} (${lead.email}) from ${lead.source}/${lead.medium}`);

    return NextResponse.json(
      {
        success: true,
        lead: {
          id: lead.id,
          name: lead.name,
          email: lead.email,
          status: lead.status,
          createdAt: lead.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/leads - Get all leads
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const source = searchParams.get('source');

    let filteredLeads = Array.from(leads.values());

    // Filter by status
    if (status) {
      filteredLeads = filteredLeads.filter(lead => lead.status === status);
    }

    // Filter by source
    if (source) {
      filteredLeads = filteredLeads.filter(lead => lead.source === source);
    }

    // Sort by createdAt desc
    filteredLeads.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      leads: filteredLeads,
      total: filteredLeads.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
