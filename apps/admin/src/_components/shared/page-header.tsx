import * as React from 'react';

/**
 * The heading block that opens an admin page.
 *
 * None of the fifteen CRUD screens had one. Each rendered straight into
 * `.grid.crud-demo > .card > Toolbar + DataTable`, so the only indication of
 * which screen you were on was the highlighted row in the sidebar — and the
 * sidebar is closed on anything under 992px. On a tablet an operator could not
 * tell "Specialities" from "Speciality categories" without opening the menu.
 *
 * `description` is optional and worth filling in where a screen's scope is not
 * obvious from its title alone.
 */
export function PageHeader({
  title,
  description,
  actions
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
      <div>
        <h1 className="m-0 text-2xl font-semibold" style={{ color: 'var(--sw-ink)', letterSpacing: '-0.015em' }}>
          {title}
        </h1>
        {description ? <p className="sw-footnote mt-2">{description}</p> : null}
      </div>
      {actions}
    </div>
  );
}

export default PageHeader;
