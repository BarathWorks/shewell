'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { parse, subDays } from 'date-fns';

/**
 * The dashboard's selected date range, read from the URL.
 *
 * Three components each derived this independently with
 * `new Date(searchParams.get('startDate') ?? '')`. On first load there are no
 * params, so that is `new Date('')` — an Invalid Date — passed straight into the
 * query, where `formatISO` throws. The dashboard's own initial render put every
 * request into an error state.
 *
 * They also each kept the value in `useState` seeded by a `useEffect`, so the
 * first render always used empty strings even when the URL did have dates.
 *
 * One hook, derived directly from `useSearchParams` with no effect, defaulting to
 * the last 30 days when the URL says nothing.
 */
export const DEFAULT_RANGE_DAYS = 30;

export function useDashboardRange() {
  const searchParams = useSearchParams();

  return useMemo(() => {
    const parseParam = (value: string | null) => {
      if (!value) return null;
      const parsed = parse(value, 'yyyy-MM-dd', new Date());
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    };

    const parsedStart = parseParam(searchParams.get('startDate'));
    const parsedEnd = parseParam(searchParams.get('endDate'));

    if (parsedStart && parsedEnd) {
      return { startDate: parsedStart, endDate: parsedEnd, isDefaulted: false };
    }

    const today = new Date();
    return {
      startDate: subDays(today, DEFAULT_RANGE_DAYS - 1),
      endDate: today,
      isDefaulted: true
    };
  }, [searchParams]);
}

export default useDashboardRange;
