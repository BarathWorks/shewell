import * as React from 'react';

/**
 * One dashboard figure.
 *
 * Replaces `card.tsx`, which had no notion of a comparison at all — it rendered
 * a title, a value, and optionally a second title/value pair squeezed onto the
 * same row. Every tile therefore stated a number with no indication of whether
 * it was rising, falling, or unknowable.
 *
 * `deltaPct` is `number | null | undefined`: null/undefined renders "No prior
 * data" rather than a confident 0%. That distinction matters on this dashboard
 * because a freshly-installed instance has no previous period at all.
 */

type Intent = 'brand' | 'success' | 'danger' | 'info' | 'warning';

export type StatTileProps = {
  label: string;
  value: string;
  /** Optional supporting figure, e.g. revenue beside an appointment count. */
  secondaryLabel?: string;
  secondaryValue?: string;
  deltaPct?: number | null;
  deltaLabel?: string;
  footnote?: string;
  icon?: string;
  intent?: Intent;
  /** When true, a higher number is worse — cancellations, for instance. */
  invertDelta?: boolean;
};

const StatTile = ({
  label,
  value,
  secondaryLabel,
  secondaryValue,
  deltaPct,
  deltaLabel = 'vs previous period',
  footnote,
  icon,
  intent = 'brand',
  invertDelta = false
}: StatTileProps) => {
  const hasDelta = typeof deltaPct === 'number' && Number.isFinite(deltaPct);
  const rising = hasDelta && deltaPct! > 0;
  const falling = hasDelta && deltaPct! < 0;

  // A rise in cancellations is not good news, so the colour follows meaning
  // rather than sign.
  const good = invertDelta ? falling : rising;
  const bad = invertDelta ? rising : falling;

  return (
    <div className="sw-card h-full">
      <div className="sw-card-body flex flex-column h-full">
        <div className="flex align-items-start justify-content-between gap-3">
          <p className="sw-eyebrow">{label}</p>
          {icon ? (
            <span className={`sw-icon sw-icon-${intent}`}>
              <i className={`pi ${icon}`} style={{ fontSize: '1rem' }} />
            </span>
          ) : null}
        </div>

        <p className="sw-figure">{value}</p>

        {secondaryLabel ? (
          <p className="sw-subfigure">
            <span className="text-500">{secondaryLabel}: </span>
            <span className="font-semibold text-900">{secondaryValue}</span>
          </p>
        ) : null}

        <div
          className="flex flex-wrap align-items-center gap-2 mt-auto pt-3"
          style={{ borderTop: '1px solid var(--sw-hairline)', marginTop: '1rem' }}
        >
          {hasDelta ? (
            <span className={`sw-delta ${good ? 'is-up' : bad ? 'is-down' : 'is-flat'}`}>
              <i
                className={`pi ${rising ? 'pi-arrow-up-right' : falling ? 'pi-arrow-down-right' : 'pi-minus'}`}
                style={{ fontSize: '0.6rem' }}
              />
              {Math.abs(deltaPct!).toFixed(1)}%
            </span>
          ) : (
            <span className="sw-delta is-flat">No prior data</span>
          )}
          <span className="sw-footnote">{footnote ?? deltaLabel}</span>
        </div>
      </div>
    </div>
  );
};

export default StatTile;
