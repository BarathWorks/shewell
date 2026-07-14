import { LayoutProvider } from '../layout/context/layoutcontext';
import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import '../../styles/layout/layout.scss';
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Hanken+Grotesk:wght@600;700&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block" rel="stylesheet" />
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
