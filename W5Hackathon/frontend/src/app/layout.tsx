import type { Metadata } from 'next';
import { Lato, Josefin_Sans } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const lato = Lato({ subsets: ['latin'], weight: ['400', '700', '900'] });
const josefin = Josefin_Sans({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-josefin' });

export const metadata: Metadata = {
  title: 'BidCars - Live Car Auctions',
  description: 'Bid on your dream car in real-time',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${lato.className} ${josefin.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
