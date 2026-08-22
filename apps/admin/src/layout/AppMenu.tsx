import React, { useContext } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import { AppMenuItem } from '@/types';

/**
 * Admin navigation.
 *
 * Rebuilt around the routes this app actually has.
 *
 * The previous model listed 55 destinations, of which **37 were 404s**: the whole
 * of the Sakai starter's demo navigation — UI Kit (Input, Table, Tree, Overlay,
 * Menu, Charts, Misc and eight more), Pages (Crud, Timeline, Empty, Not Found),
 * Utilities, Blocks, Documentation, Landing — plus product sections that no
 * longer exist here: gym memberships and reports, venues, amenities, games,
 * venue bookings, cities and pincodes. An admin exploring the sidebar hit a dead
 * end roughly two clicks in three.
 *
 * The 18 that resolve are grouped by what an operator is actually doing —
 * people, practice, scheduling, money, content — rather than by the database
 * table each screen happens to edit.
 */
const AppMenu = () => {
  const { layoutConfig } = useContext(LayoutContext);

  const model: AppMenuItem[] = [
    {
      label: 'Overview',
      items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-chart-bar', to: '/' }]
    },
    {
      label: 'People',
      items: [
        { label: 'Patients', icon: 'pi pi-fw pi-users', to: '/manage-users/users' },
        { label: 'Admin users', icon: 'pi pi-fw pi-id-card', to: '/manage-users/admin-users' }
      ]
    },
    {
      label: 'Practitioners',
      items: [
        { label: 'Directory', icon: 'pi pi-fw pi-briefcase', to: '/view-doctors/doctors' },
        { label: 'Appointments', icon: 'pi pi-fw pi-calendar-clock', to: '/view-doctors/appointments' },
        {
          label: 'Speciality categories',
          icon: 'pi pi-fw pi-folder',
          to: '/manage-specialization-languages/specialization-parent-category'
        },
        {
          label: 'Specialities',
          icon: 'pi pi-fw pi-tag',
          to: '/manage-specialization-languages/specializations'
        },
        {
          label: 'Languages',
          icon: 'pi pi-fw pi-language',
          to: '/manage-specialization-languages/languages'
        }
      ]
    },
    {
      label: 'Sessions',
      items: [
        {
          label: 'Categories',
          icon: 'pi pi-fw pi-tags',
          to: '/manage-session-categories/session-categories'
        },
        { label: 'Sessions', icon: 'pi pi-fw pi-calendar', to: '/manage-sessions/sessions' },
        { label: 'Registrations', icon: 'pi pi-fw pi-check-square', to: '/manage-sessions/registrations' }
      ]
    },
    {
      label: 'Finance',
      items: [{ label: 'Payouts', icon: 'pi pi-fw pi-wallet', to: '/manage-payouts' }]
    },
    {
      label: 'Content',
      items: [
        { label: 'Blog categories', icon: 'pi pi-fw pi-folder-open', to: '/manage-blogs/blog-categories' },
        { label: 'Blogs', icon: 'pi pi-fw pi-book', to: '/manage-blogs/blogs' },
        { label: 'Homepage banners', icon: 'pi pi-fw pi-images', to: '/manage-blogs/homepage-banners' },
        { label: 'Testimonials', icon: 'pi pi-fw pi-star', to: '/manage-testimonials/testimonials' },
        { label: 'Media library', icon: 'pi pi-fw pi-image', to: '/manage-products/media' }
      ]
    },
    {
      label: 'Reference data',
      items: [
        { label: 'Countries', icon: 'pi pi-fw pi-globe', to: '/manage-locations/countries' },
        { label: 'States', icon: 'pi pi-fw pi-map', to: '/manage-locations/states' }
      ]
    }
  ];

  return (
    <MenuProvider>
      <ul className="layout-menu">
        {model.map((item, i) => {
          return !item?.seperator ? (
            <AppMenuitem item={item} root={true} index={i} key={item.label} />
          ) : (
            <li className="menu-separator" key={`sep-${i}`}></li>
          );
        })}
      </ul>
    </MenuProvider>
  );
};

export default AppMenu;
