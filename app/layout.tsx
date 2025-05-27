import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';
import ProfileInitializer from '../components/ProfileInitializer';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Food Truck App',
  description: 'Order delicious food from your favorite food truck',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ProfileInitializer />
        <Toaster position="top-center" />
        {children}
      </body>
    </html>
  );
}