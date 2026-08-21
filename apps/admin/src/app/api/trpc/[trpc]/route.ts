import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { type NextRequest } from 'next/server';

import { appRouter } from '@/src/server/api/root';
import { createTRPCContext } from '@/src/server/api/trpc';
import { createTrpcErrorHandler } from '@repo/observability';

const trpcErrorHandler = createTrpcErrorHandler({
  getUserId: (ctx) => (ctx as { session?: { user?: { id?: string } } } | null)?.session?.user?.id
});

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a HTTP request (e.g. when you make requests from Client Components).
 */
const createContext = async (req: NextRequest) => {
  return createTRPCContext({
    headers: req.headers
  });
};

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createContext(req),
    // Runs in every environment. This was previously `undefined` in production,
    // so a failing procedure returned a 500 with nothing written to the logs.
    onError: trpcErrorHandler
  });

export { handler as GET, handler as POST };
