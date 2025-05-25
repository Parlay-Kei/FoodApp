import './globals.css';

export const metadata = {
  title: 'Megan\'s Munchies',
  description: 'Order delicious food from your favorite food truck',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
