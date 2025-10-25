import { UsageTracker, configureUsageTracker } from '@repo/usage';
import { prisma } from '@/lib/db/prisma';

const globalForUsage = globalThis as unknown as { usageTracker?: UsageTracker };

export const usageTracker =
  globalForUsage.usageTracker ?? UsageTracker.createWithPrisma(prisma, { autoStart: true });

if (process.env.NODE_ENV !== 'production') {
  globalForUsage.usageTracker = usageTracker;
}

configureUsageTracker(usageTracker);
