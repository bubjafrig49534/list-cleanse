import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MCAE List Cleansing Tool',
  description: 'Validate and cleanse contact lists for Salesforce Marketing Cloud Account Engagement',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}
