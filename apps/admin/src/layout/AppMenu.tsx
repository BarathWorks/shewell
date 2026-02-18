/* eslint-disable @next/next/no-img-element */

import React, { useContext } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import Link from 'next/link';
import { AppMenuItem } from '@/types';

const AppMenu = () => {
  const { layoutConfig } = useContext(LayoutContext);

  const model: AppMenuItem[] = [
    {
      label: 'Home',
      items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }]
    },
    {
      label: 'Manage Users',
      items: [
        {
          label: 'Admin Users',
          icon: 'pi pi-user',
          to: '/manage-users/admin-users'
        },
        {
          label: 'Users',
          icon: 'pi pi-user',
          to: '/manage-users/users'
        }
      ]
    },
    {
      label: 'Manage Sessions',
      items: [
        {
          label: 'Session Categories',
          icon: 'pi pi-tags',
          to: '/manage-session-categories/session-categories'
        },
        {
          label: 'Sessions',
          icon: 'pi pi-calendar',
          to: '/manage-sessions/sessions'
        },
        {
          label: 'Registrations',
          icon: 'pi pi-users',
          to: '/manage-sessions/registrations'
        }
      ]
    },
    {
      label: 'Professional Specializations and Languages',
      // icon: 'pi pi-location',
      items: [
        // {
        //   label: 'Countries',
        //   icon: 'pi pi-map',
        //   to: '/manage-locations/countries'
        // },
        {
          label: 'Specialization Category',
          icon: 'pi pi-user',
          to: '/manage-specialization-languages/specialization-parent-category'
        },
        {
          label: 'Specializations',
          icon: 'pi pi-briefcase',
          to: '/manage-specialization-languages/specializations'
        },
        {
          label: 'Languages',
          icon: 'pi pi-language',
          to: '/manage-specialization-languages/languages'
        }
      ]
    },
    {
      label: 'View Doctors And Appointments',
      // icon: 'pi pi-location',
      items: [
        // {
        //   label: 'Countries',
        //   icon: 'pi pi-map',
        //   to: '/manage-locations/countries'
        // },
        {
          label: 'Doctors',
          icon: 'pi pi-users',
          to: '/view-doctors/doctors'
        },
        {
          label: 'Appointments',
          icon: 'pi pi-book',
          to: '/view-doctors/appointments'
        }
      ]
    },
    {
      label: 'Manage Payouts',
      items: [
        {
          label: 'Payout Requests',
          icon: 'pi pi-wallet',
          to: '/manage-payouts'
        }
      ]
    },
    {
      label: 'Manage Product / Orders',
      items: [
        // {
        //   label: 'Brands',
        //   icon: 'pi pi-amazon',
        //   to: '/manage-products/brands'
        // },
        // {
        //   label: 'Currencies',
        //   icon: 'pi pi-dollar',
        //   to: '/manage-products/currencies'
        // },
        {
          label: 'Categories',
          icon: 'pi pi-user',
          to: '/manage-products/categories'
        },
        {
          label: 'Products',
          icon: 'pi pi-gift',
          to: '/manage-products/products'
        },
        {
          label: 'Media',
          icon: 'pi pi-image',
          to: '/manage-products/media'
        },
        {
          label: 'Coupons',
          icon: 'pi pi-ticket',
          to: '/manage-products/coupons'
        },
        {
          label: 'Orders',
          icon: 'pi pi-box',
          to: '/manage-products/orders'
        },
        {
          label: 'Inventory',
          icon: 'pi pi-box',
          to: '/manage-products/inventory'
        }
      ]
    },
    // {
    //   label: 'Manage Slots',
    //   items: [
    //     {
    //       label: 'Amenities',
    //       icon: 'pi pi-map-marker',
    //       to: '/manage-venues/amenities'
    //     },
    //     {
    //       label: 'Games / Sports',
    //       icon: 'pi pi-map-marker',
    //       to: '/manage-venues/games'
    //     },
    //     {
    //       label: 'Venues',
    //       icon: 'pi pi-map-marker',
    //       to: '/manage-venues/venues'
    //     },
    //     {
    //       label: 'Venue Bookings',
    //       icon: 'pi pi-map-marker',
    //       to: '/manage-venues/venue-bookings'
    //     }
    //   ]
    // },
    // {
    //   label: 'Manage Gym Memberships',
    //   items: [
    //     {
    //       label: 'Gym Memberships',
    //       icon: 'pi pi-map-marker',
    //       to: '/manage-gym-memberships/gym-memberships'
    //     },
    //     {
    //       label: 'Reports',
    //       icon: 'pi pi-chart-pie',
    //       to: '/manage-gym-memberships/reports'
    //     }
    //   ]
    // },
    {
      label: 'Manage Blogs ',
      items: [
        {
          label: 'Blog Categories',
          icon: 'pi pi-microsoft',
          to: '/manage-blogs/blog-categories'
        },
        {
          label: 'Blogs',
          icon: 'pi pi-book',
          to: '/manage-blogs/blogs'
        },
        // {
        //   label: 'Testimonials',
        //   icon: 'pi pi-star-fill',
        //   to: '/manage-blogs/testimonials'
        // },
        {
          label: 'Homepage Banners',
          icon: 'pi pi-image',
          to: '/manage-blogs/homepage-banners'
        }
      ]
    },
    {
      label: 'Manage Testimonials',
      items: [
        {
          label: 'Testimonials',
          icon: 'pi pi-book ',
          to: '/manage-testimonials/testimonials'
        }
      ]
    },
    
    // {
    //   label: 'Location Management',
    //   // icon: 'pi pi-location',
    //   items: [
    //     // {
    //     //   label: 'Countries',
    //     //   icon: 'pi pi-map',
    //     //   to: '/manage-locations/countries'
    //     // },
    //     {
    //       label: 'States',
    //       icon: 'pi pi-map',
    //       to: '/manage-locations/states'
    //     },
    //     // {
    //     //   label: 'Cities',
    //     //   icon: 'pi pi-map',
    //     //   to: '/manage-locations/cities'
    //     // },
    //     {
    //       label: 'Pincodes',
    //       icon: 'pi pi-map',
    //       to: '/manage-locations/pincodes'
    //     }
    //   ]
    // },
    
    // {
    // label: 'UI Components',
    // items: [
    //     { label: 'Form Layout', icon: 'pi pi-fw pi-id-card', to: '/uikit/formlayout' },
    //     { label: 'Input', icon: 'pi pi-fw pi-check-square', to: '/uikit/input' },
    //     { label: 'Float Label', icon: 'pi pi-fw pi-bookmark', to: '/uikit/floatlabel' },
    //     { label: 'Invalid State', icon: 'pi pi-fw pi-exclamation-circle', to: '/uikit/invalidstate' },
    //     { label: 'Button', icon: 'pi pi-fw pi-mobile', to: '/uikit/button', class: 'rotated-icon' },
    //     { label: 'Table', icon: 'pi pi-fw pi-table', to: '/uikit/table' },
    //     { label: 'List', icon: 'pi pi-fw pi-list', to: '/uikit/list' },
    //     { label: 'Tree', icon: 'pi pi-fw pi-share-alt', to: '/uikit/tree' },
    //     { label: 'Panel', icon: 'pi pi-fw pi-tablet', to: '/uikit/panel' },
    //     { label: 'Overlay', icon: 'pi pi-fw pi-clone', to: '/uikit/overlay' },
    //     { label: 'Media', icon: 'pi pi-fw pi-image', to: '/uikit/media' },
    //     { label: 'Menu', icon: 'pi pi-fw pi-bars', to: '/uikit/menu', preventExact: true },
    //     { label: 'Message', icon: 'pi pi-fw pi-comment', to: '/uikit/message' },
    //     { label: 'File', icon: 'pi pi-fw pi-file', to: '/uikit/file' },
    //     { label: 'Chart', icon: 'pi pi-fw pi-chart-bar', to: '/uikit/charts' },
    //     { label: 'Misc', icon: 'pi pi-fw pi-circle', to: '/uikit/misc' }
    // ]
    // },
    // {
    //     label: 'Prime Blocks',
    //     items: [
    //         { label: 'Free Blocks', icon: 'pi pi-fw pi-eye', to: '/blocks', badge: 'NEW' },
    //         { label: 'All Blocks', icon: 'pi pi-fw pi-globe', url: 'https://blocks.primereact.org', target: '_blank' }
    //     ]
    // },
    // {
    //     label: 'Utilities',
    //     items: [
    //         { label: 'PrimeIcons', icon: 'pi pi-fw pi-prime', to: '/utilities/icons' },
    //         { label: 'PrimeFlex', icon: 'pi pi-fw pi-desktop', url: 'https://primeflex.org/', target: '_blank' }
    //     ]
    // },
    // {
    //     label: 'Pages',
    //     icon: 'pi pi-fw pi-briefcase',
    //     to: '/pages',
    //     items: [
    //         {
    //             label: 'Landing',
    //             icon: 'pi pi-fw pi-globe',
    //             to: '/landing'
    //         },
    //         {
    //             label: 'Auth',
    //             icon: 'pi pi-fw pi-user',
    //             items: [
    //                 {
    //                     label: 'Login',
    //                     icon: 'pi pi-fw pi-sign-in',
    //                     to: '/auth/login'
    //                 },
    //                 {
    //                     label: 'Error',
    //                     icon: 'pi pi-fw pi-times-circle',
    //                     to: '/auth/error'
    //                 },
    //                 {
    //                     label: 'Access Denied',
    //                     icon: 'pi pi-fw pi-lock',
    //                     to: '/auth/access'
    //                 }
    //             ]
    //         },
    //         {
    //             label: 'Crud',
    //             icon: 'pi pi-fw pi-pencil',
    //             to: '/pages/crud'
    //         },
    //         {
    //             label: 'Timeline',
    //             icon: 'pi pi-fw pi-calendar',
    //             to: '/pages/timeline'
    //         },
    //         {
    //             label: 'Not Found',
    //             icon: 'pi pi-fw pi-exclamation-circle',
    //             to: '/pages/notfound'
    //         },
    //         {
    //             label: 'Empty',
    //             icon: 'pi pi-fw pi-circle-off',
    //             to: '/pages/empty'
    //         }
    //     ]
    // },
    // {
    //     label: 'Hierarchy',
    //     items: [
    //         {
    //             label: 'Submenu 1',
    //             icon: 'pi pi-fw pi-bookmark',
    //             items: [
    //                 {
    //                     label: 'Submenu 1.1',
    //                     icon: 'pi pi-fw pi-bookmark',
    //                     items: [
    //                         { label: 'Submenu 1.1.1', icon: 'pi pi-fw pi-bookmark' },
    //                         { label: 'Submenu 1.1.2', icon: 'pi pi-fw pi-bookmark' },
    //                         { label: 'Submenu 1.1.3', icon: 'pi pi-fw pi-bookmark' }
    //                     ]
    //                 },
    //                 {
    //                     label: 'Submenu 1.2',
    //                     icon: 'pi pi-fw pi-bookmark',
    //                     items: [{ label: 'Submenu 1.2.1', icon: 'pi pi-fw pi-bookmark' }]
    //                 }
    //             ]
    //         },
    //         {
    //             label: 'Submenu 2',
    //             icon: 'pi pi-fw pi-bookmark',
    //             items: [
    //                 {
    //                     label: 'Submenu 2.1',
    //                     icon: 'pi pi-fw pi-bookmark',
    //                     items: [
    //                         { label: 'Submenu 2.1.1', icon: 'pi pi-fw pi-bookmark' },
    //                         { label: 'Submenu 2.1.2', icon: 'pi pi-fw pi-bookmark' }
    //                     ]
    //                 },
    //                 {
    //                     label: 'Submenu 2.2',
    //                     icon: 'pi pi-fw pi-bookmark',
    //                     items: [{ label: 'Submenu 2.2.1', icon: 'pi pi-fw pi-bookmark' }]
    //                 }
    //             ]
    //         }
    //     ]
    // },
    // {
    //     label: 'Get Started',
    //     items: [
    //         {
    //             label: 'Documentation',
    //             icon: 'pi pi-fw pi-question',
    //             to: '/documentation'
    //         },
    //         {
    //             label: 'View Source',
    //             icon: 'pi pi-fw pi-search',
    //             url: 'https://github.com/primefaces/sakai-react',
    //             target: '_blank'
    //         }
    //     ]
    // }
  ];

  return (
    <MenuProvider>
      <ul className="layout-menu">
        {model.map((item, i) => {
          return !item?.seperator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>;
        })}
      </ul>
    </MenuProvider>
  );
};

export default AppMenu;
