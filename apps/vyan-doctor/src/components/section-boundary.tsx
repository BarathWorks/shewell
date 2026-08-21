"use client";

import React from "react";
import { reportClientError } from "~/lib/report-client-error";

type Props = {
  /** Identifies this boundary in the logs, e.g. "home:testimonials". */
  name: string;
  children: React.ReactNode;
  /** Replaces the default inline fallback. Receives a retry callback. */
  fallback?: (state: { reference: string | null; retry: () => void }) => React.ReactNode;
  /** Render nothing at all when this section fails. For non-essential widgets. */
  silent?: boolean;
};

type State = { hasError: boolean; reference: string | null };

/**
 * Isolates one part of a page.
 *
 * A route-level `error.tsx` replaces the entire page, so a single broken widget
 * takes down everything around it. Wrapping that widget here contains the failure:
 * the rest of the page renders normally, and the widget shows a small retry
 * affordance instead.
 *
 * Only catches errors thrown while rendering its own subtree — not event handlers
 * or async code, which must report through `reportClientError` directly.
 */
export class SectionBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, reference: null };

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    const reference = reportClientError({
      error,
      boundary: this.props.name,
      componentStack: info.componentStack ?? undefined,
    });
    this.setState({ reference });
  }

  retry = () => {
    this.setState({ hasError: false, reference: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.silent) return null;
    if (this.props.fallback) {
      return this.props.fallback({ reference: this.state.reference, retry: this.retry });
    }

    return (
      <div
        role="alert"
        style={{
          padding: "1.25rem",
          margin: "0.5rem 0",
          border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: "0.5rem",
          background: "rgba(0,0,0,0.02)",
          textAlign: "center",
          fontSize: "0.9rem",
        }}
      >
        <p style={{ margin: 0, color: "#444" }}>
          This section could not be loaded.
        </p>
        <button
          onClick={this.retry}
          style={{
            marginTop: "0.75rem",
            padding: "0.4rem 1rem",
            borderRadius: "0.375rem",
            border: "1px solid rgba(0,0,0,0.2)",
            background: "#fff",
            cursor: "pointer",
            fontSize: "0.85rem",
          }}
        >
          Retry
        </button>
        {this.state.reference ? (
          <p style={{ margin: "0.75rem 0 0", fontSize: "0.7rem", color: "#999" }}>
            Reference: {this.state.reference}
          </p>
        ) : null}
      </div>
    );
  }
}

export default SectionBoundary;
