/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import { classNames } from 'primereact/utils';
import React, { forwardRef, useContext, useImperativeHandle, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { AppTopbarRef } from '@/types';
import { LayoutContext } from './context/layoutcontext';
import { signOut } from 'next-auth/react';
import { confirmDialog } from 'primereact/confirmdialog';

/**
 * Admin top bar.
 *
 * Rebuilt. The previous version was Sakai's stock bar: an 80px tall band holding
 * a logo, a hamburger, a kebab, and a single circular icon button whose only
 * label was a `<span>Logout</span>` that the theme hid at every breakpoint — so
 * the sole action in the header was an unlabelled icon.
 *
 * What is here now:
 *  - 64px band with a hairline, matching the client and practitioner headers.
 *  - A breadcrumb-style location so an admin can see where they are; the sidebar
 *    scrolls independently and on mobile it is closed, which left no indication
 *    of the current section at all.
 *  - The sign-out control is a labelled button on desktop and keeps its
 *    `aria-label` when it collapses to an icon on small screens.
 *
 * The refs and `LayoutContext` wiring are unchanged — `AppTopbarRef`,
 * `onMenuToggle` and `showProfileSidebar` behave exactly as before, because
 * `layout.tsx` uses them for outside-click handling.
 */

/** Turns `/manage-users/admin-users` into `Manage Users › Admin Users`. */
function useBreadcrumb() {
  const pathname = usePathname();

  if (!pathname || pathname === '/') return ['Dashboard'];

  return pathname
    .split('/')
    .filter(Boolean)
    .map((segment) =>
      segment
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (character) => character.toUpperCase())
    );
}

const AppTopbar = forwardRef<AppTopbarRef>((props, ref) => {
  const { layoutState, onMenuToggle, showProfileSidebar } = useContext(LayoutContext);
  const menubuttonRef = useRef(null);
  const topbarmenuRef = useRef(null);
  const topbarmenubuttonRef = useRef(null);
  const crumbs = useBreadcrumb();

  useImperativeHandle(ref, () => ({
    menubutton: menubuttonRef.current,
    topbarmenu: topbarmenuRef.current,
    topbarmenubutton: topbarmenubuttonRef.current
  }));

  /**
   * Sign out, after confirming.
   *
   * Three corrections to what was here:
   *
   *  - `signOut()` with no `callbackUrl` returns to the *current* page. Every
   *    admin page is behind middleware, so the browser landed on a protected
   *    route with no session and was bounced to `/auth/login` — the right
   *    destination reached by an extra round trip, and with a flash of the
   *    admin shell in between. It goes there directly.
   *  - "Do you want to logout ?" with `pi-info-circle` framed an irreversible
   *    action as information. The dialog now says what happens, and the accept
   *    and reject buttons say which is which instead of defaulting to Yes/No.
   *
   * The dialog does not name the signed-in account: this app mounts no
   * `<SessionProvider>`, so `useSession()` throws here, and the session is not
   * threaded down to the topbar. If that identity is wanted later, it has to come
   * from the server layout as a prop rather than from a hook.
   */
  const onClickSignOut = () => {
    confirmDialog({
      header: 'Sign out',
      message:
        'You will be signed out and returned to the login screen. Any unsaved changes on this page will be lost.',
      icon: 'pi pi-sign-out',
      acceptLabel: 'Sign out',
      acceptClassName: 'p-button-danger',
      rejectLabel: 'Stay signed in',
      rejectClassName: 'p-button-text',
      accept: () => {
        void signOut({ callbackUrl: '/auth/login' });
      },
      reject: () => undefined
    });
  };

  return (
    <div className="layout-topbar">
      <div className="sw-topbar-left">
        {/* Menu toggle sits before the logo: on mobile it is the primary control,
            and putting it first means it is also the first tab stop. */}
        <button
          ref={menubuttonRef}
          type="button"
          className="sw-topbar-icon-btn layout-menu-button"
          onClick={onMenuToggle}
          aria-label="Toggle navigation"
        >
          <i className="pi pi-bars" />
        </button>

        <Link href="/" className="layout-topbar-logo" aria-label="Shewell Admin — dashboard">
          <img src="/layout/images/vyan-logo.png" width="132" height="32" alt="Shewell Admin" />
        </Link>

        <nav aria-label="Breadcrumb" className="sw-topbar-crumbs">
          {crumbs.map((crumb, index) => (
            <React.Fragment key={`${crumb}-${index}`}>
              {index > 0 ? (
                <i className="pi pi-angle-right sw-topbar-crumb-sep" aria-hidden="true" />
              ) : null}
              <span className={index === crumbs.length - 1 ? 'sw-topbar-crumb is-current' : 'sw-topbar-crumb'}>
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </nav>
      </div>

      <button
        ref={topbarmenubuttonRef}
        type="button"
        className="sw-topbar-icon-btn layout-topbar-menu-button"
        onClick={showProfileSidebar}
        aria-label="Account actions"
      >
        <i className="pi pi-ellipsis-v" />
      </button>

      <div
        ref={topbarmenuRef}
        className={classNames('layout-topbar-menu sw-topbar-actions', {
          'layout-topbar-menu-mobile-active': layoutState.profileSidebarVisible
        })}
      >
        <button
          onClick={onClickSignOut}
          type="button"
          className="sw-topbar-signout"
          aria-label="Sign out"
        >
          <i className="pi pi-sign-out" aria-hidden="true" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );
});

AppTopbar.displayName = 'AppTopbar';

export default AppTopbar;
