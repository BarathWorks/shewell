import React, { useContext } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import { AppMenuItem } from '@/types';

const AppMenu = () => {
  const { layoutConfig } = useContext(LayoutContext);

  const model: AppMenuItem[] = [
    {
      label: 'Home',
      items: [
        { 
          label: 'Dashboard', 
          icon: 'pi pi-fw pi-home', 
          to: '/' 
        }
      ]
    },
    {
      label: 'Management',
      items: [
        {
          label: 'Users',
          icon: 'pi pi-fw pi-users',
          items: [
            { label: 'Admin Users', icon: 'pi pi-fw pi-id-card', to: '/manage-users/admin-users' },
            { label: 'Users', icon: 'pi pi-fw pi-user', to: '/manage-users/users' }
          ]
        },
        {
          label: 'Sessions',
          icon: 'pi pi-fw pi-calendar-times',
          items: [
            { label: 'Session Categories', icon: 'pi pi-fw pi-tags', to: '/manage-session-categories/session-categories' },
            { label: 'Sessions', icon: 'pi pi-fw pi-calendar', to: '/manage-sessions/sessions' },
            { label: 'Registrations', icon: 'pi pi-fw pi-users', to: '/manage-sessions/registrations' }
          ]
        },
        {
          label: 'Specializations',
          icon: 'pi pi-fw pi-briefcase',
          items: [
            { label: 'Specialization Category', icon: 'pi pi-fw pi-folder', to: '/manage-specialization-languages/specialization-parent-category' },
            { label: 'Specializations', icon: 'pi pi-fw pi-briefcase', to: '/manage-specialization-languages/specializations' },
            { label: 'Languages', icon: 'pi pi-fw pi-language', to: '/manage-specialization-languages/languages' }
          ]
        },
        {
          label: 'Doctors',
          svgIcon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
              <path d="M8 15a6 6 0 0 0 6 6h0a6 6 0 0 0 6-6v-3" />
              <circle cx="20" cy="10" r="2" />
            </svg>
          ),
          items: [
            { label: 'Doctors', icon: 'pi pi-fw pi-users', to: '/view-doctors/doctors' },
            { label: 'Appointments', icon: 'pi pi-fw pi-book', to: '/view-doctors/appointments' }
          ]
        }
      ]
    },
    {
      label: 'Commerce',
      items: [
        {
          label: 'Payouts',
          icon: 'pi pi-fw pi-credit-card',
          to: '/manage-payouts'
        },
        {
          label: 'Products',
          icon: 'pi pi-fw pi-shopping-bag',
          items: [
            { label: 'Categories', icon: 'pi pi-fw pi-folder', to: '/manage-products/categories' },
            { label: 'Products', icon: 'pi pi-fw pi-gift', to: '/manage-products/products' },
            { label: 'Media', icon: 'pi pi-fw pi-image', to: '/manage-products/media' },
            { label: 'Coupons', icon: 'pi pi-fw pi-ticket', to: '/manage-products/coupons' },
            { label: 'Orders', icon: 'pi pi-fw pi-box', to: '/manage-products/orders' },
            { label: 'Inventory', icon: 'pi pi-fw pi-database', to: '/manage-products/inventory' }
          ]
        }
      ]
    },
    {
      label: 'Content',
      items: [
        {
          label: 'Blogs',
          icon: 'pi pi-fw pi-pencil',
          items: [
            { label: 'Blog Categories', icon: 'pi pi-fw pi-folder', to: '/manage-blogs/blog-categories' },
            { label: 'Blogs', icon: 'pi pi-fw pi-book', to: '/manage-blogs/blogs' },
            { label: 'Homepage Banners', icon: 'pi pi-fw pi-images', to: '/manage-blogs/homepage-banners' }
          ]
        },
        {
          label: 'Testimonials',
          icon: 'pi pi-fw pi-star',
          to: '/manage-testimonials/testimonials'
        }
      ]
    }
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
