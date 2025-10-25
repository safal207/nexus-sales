import Stripe from 'stripe';
import type { PrismaClient } from '@prisma/client';

export interface OverageCharge {
  ecoId: string;
  subscriptionId: string;
  overageCalls: number;
  overageCostCents: number;
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
  stripeCustomerId: string;
  stripeSubscriptionId?: string | null;
  stripeInvoiceItemId?: string | null;
}

export interface OverageProcessResult {
  processed: number;
  charges: Array<{
    ecoId: string;
    overageCalls: number;
    overageCostCents: number;
    stripeInvoiceItemId?: string | null;
    error?: string;
  }>;
}

export interface OverageSummary {
  ecoId: string;
  plan: string | null;
  overageCalls: number;
  overageCostCents: number;
  overageInvoiced: boolean;
  stripeInvoiceItemId?: string | null;
  billingPeriodStart?: Date;
  billingPeriodEnd?: Date;
  currency: string;
}

interface RawOverageRow {
  eco_id: string;
  subscription_id: string;
  overage_calls: number;
  overage_cost: number | null;
  billing_period_start: Date;
  billing_period_end: Date;
  overage_invoiced: boolean | null;
  stripe_invoice_item_id: string | null;
  plan: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
}

const OVERAGE_UNIT_COST_CENTS = 0.1; // $0.001 == 0.1 cents
const USD_CURRENCY = 'usd';

export class OverageService {
  constructor(private readonly stripe: Stripe, private readonly prisma: PrismaClient) {}

  private toCharge(row: RawOverageRow): OverageCharge | null {
    if (!row.stripe_customer_id) {
      return null;
    }

    const overageCalls = row.overage_calls ?? 0;
    const overageCostCents = row.overage_cost ?? Math.round(overageCalls * OVERAGE_UNIT_COST_CENTS);

    return {
      ecoId: row.eco_id,
      subscriptionId: row.subscription_id,
      overageCalls,
      overageCostCents,
      billingPeriodStart: new Date(row.billing_period_start),
      billingPeriodEnd: new Date(row.billing_period_end),
      stripeCustomerId: row.stripe_customer_id,
      stripeSubscriptionId: row.stripe_subscription_id,
      stripeInvoiceItemId: row.stripe_invoice_item_id ?? undefined,
    };
  }

  async calculateOverage(ecoId: string, periodStart: Date): Promise<OverageCharge | null> {
    const rows = await this.prisma.$queryRaw<RawOverageRow[]>`
      SELECT ur.eco_id,
             ur.subscription_id,
             ur.overage_calls,
             ur.overage_cost,
             ur.billing_period_start,
             ur.billing_period_end,
             ur.overage_invoiced,
             ur.stripe_invoice_item_id,
             s.plan,
             s.stripe_customer_id,
             s.stripe_subscription_id
        FROM eco_usage_records ur
        JOIN eco_subscriptions s ON s.id = ur.subscription_id
       WHERE ur.eco_id = ${ecoId}
         AND ur.billing_period_start = ${periodStart}
       LIMIT 1;
    `;

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    if (row.plan !== 'pro' || (row.overage_calls ?? 0) <= 0 || row.overage_invoiced) {
      return null;
    }

    return this.toCharge(row);
  }

  async chargeOverage(charge: OverageCharge): Promise<Stripe.InvoiceItem | null> {
    if (charge.overageCalls <= 0 || charge.overageCostCents <= 0) {
      return null;
    }

    const description = `API overage charges for period starting ${charge.billingPeriodStart.toISOString().split('T')[0]}`;

    const invoiceItem = await this.stripe.invoiceItems.create({
      customer: charge.stripeCustomerId,
      amount: charge.overageCostCents,
      currency: USD_CURRENCY,
      description,
      subscription: charge.stripeSubscriptionId ?? undefined,
      metadata: {
        eco_id: charge.ecoId,
        billing_period_start: charge.billingPeriodStart.toISOString(),
        billing_period_end: charge.billingPeriodEnd.toISOString(),
        type: 'api_overage',
      },
    });

    await this.prisma.$executeRaw`
      UPDATE eco_usage_records
         SET overage_invoiced = TRUE,
             stripe_invoice_item_id = ${invoiceItem.id},
             updated_at = NOW()
       WHERE eco_id = ${charge.ecoId}
         AND billing_period_start = ${charge.billingPeriodStart};
    `;

    return invoiceItem;
  }

  async processMonthlyOverage(referenceDate: Date = new Date()): Promise<OverageProcessResult> {
    const rows = await this.prisma.$queryRaw<RawOverageRow[]>`
      SELECT ur.eco_id,
             ur.subscription_id,
             ur.overage_calls,
             ur.overage_cost,
             ur.billing_period_start,
             ur.billing_period_end,
             ur.overage_invoiced,
             ur.stripe_invoice_item_id,
             s.plan,
             s.stripe_customer_id,
             s.stripe_subscription_id
        FROM eco_usage_records ur
        JOIN eco_subscriptions s ON s.id = ur.subscription_id
       WHERE (ur.overage_invoiced IS NULL OR ur.overage_invoiced = FALSE)
         AND ur.overage_calls > 0
         AND s.plan = 'pro'
         AND ur.billing_period_end <= ${referenceDate}
       ORDER BY ur.billing_period_end ASC;
    `;

    const charges: OverageProcessResult['charges'] = [];

    for (const row of rows) {
      const charge = this.toCharge(row);
      if (!charge) {
        charges.push({
          ecoId: row.eco_id,
          overageCalls: row.overage_calls ?? 0,
          overageCostCents: row.overage_cost ?? 0,
          error: 'Missing Stripe customer information',
        });
        continue;
      }

      try {
        const invoiceItem = await this.chargeOverage(charge);
        charges.push({
          ecoId: charge.ecoId,
          overageCalls: charge.overageCalls,
          overageCostCents: charge.overageCostCents,
          stripeInvoiceItemId: invoiceItem?.id,
        });
      } catch (error: unknown) {
        console.error('[overage] Failed to charge overage', {
          ecoId: charge.ecoId,
          error,
        });

        charges.push({
          ecoId: charge.ecoId,
          overageCalls: charge.overageCalls,
          overageCostCents: charge.overageCostCents,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return { processed: charges.filter((entry) => !entry.error).length, charges };
  }

  async getOverageSummary(ecoId: string): Promise<OverageSummary> {
    const rows = await this.prisma.$queryRaw<RawOverageRow[]>`
      SELECT ur.eco_id,
             ur.subscription_id,
             ur.overage_calls,
             ur.overage_cost,
             ur.billing_period_start,
             ur.billing_period_end,
             ur.overage_invoiced,
             ur.stripe_invoice_item_id,
             s.plan,
             s.stripe_customer_id,
             s.stripe_subscription_id
        FROM eco_usage_records ur
        JOIN eco_subscriptions s ON s.id = ur.subscription_id
       WHERE ur.eco_id = ${ecoId}
       ORDER BY ur.billing_period_start DESC
       LIMIT 1;
    `;

    if (rows.length === 0) {
      return {
        ecoId,
        plan: null,
        overageCalls: 0,
        overageCostCents: 0,
        overageInvoiced: false,
        currency: USD_CURRENCY,
      };
    }

    const row = rows[0];
    const summary: OverageSummary = {
      ecoId: row.eco_id,
      plan: row.plan,
      overageCalls: row.overage_calls ?? 0,
      overageCostCents: row.overage_cost ?? Math.round((row.overage_calls ?? 0) * OVERAGE_UNIT_COST_CENTS),
      overageInvoiced: Boolean(row.overage_invoiced),
      stripeInvoiceItemId: row.stripe_invoice_item_id ?? undefined,
      billingPeriodStart: new Date(row.billing_period_start),
      billingPeriodEnd: new Date(row.billing_period_end),
      currency: USD_CURRENCY,
    };

    return summary;
  }
}
