import { LayoutProvider } from '../layout/context/layoutcontext';
import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import '../../styles/layout/layout.scss';
// `styles/global.css` was never imported by any layout, so the file was inert —
// its PrimeReact datepicker contrast fixes had never applied. It now carries the
// admin design tokens as well, and must load after the theme and layout so its
// overrides win.
import '../../styles/global.css';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { ToastContextProvider } from '@/src/_hooks/useToast';
import { TRPCReactProvider } from '@/src/trpc/react';

export const metadata = {
  title: 'She Well Care',
  description: 'Admin Panel for She Well Care',
  robots: { index: false, follow: false }
};
interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link id="theme-css" href={`/themes/lara-light-teal/theme.css`} rel="stylesheet"></link>
      </head>
      <body>
        <TRPCReactProvider>
          <ToastContextProvider>
            <PrimeReactProvider>
              <LayoutProvider>{children}</LayoutProvider>
            </PrimeReactProvider>
          </ToastContextProvider>
          <ConfirmDialog />
        </TRPCReactProvider>
      </body>
    </html>
  );
}
