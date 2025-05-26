import './globals.css';
import Footer from '../components/Footer';

export const metadata = {
  title: 'Megan\'s Munchies',
  description: 'Order delicious food from your favorite food truck',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Footer />
      </body>
    </html>
  );
}
