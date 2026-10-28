import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import AmbientBackground from '@/components/ui/AmbientBackground';
import ProjectModal from '@/components/ui/ProjectModal';
import AdminDrawer from '@/components/ui/AdminDrawer';
import { getSeoSettings } from '@/lib/db';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();
  const defaultUrl = 'https://alexmiller.dev';
  const siteUrl = seo.canonicalUrl?.startsWith('http') ? seo.canonicalUrl : defaultUrl;

  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    keywords: seo.keywords ? seo.keywords.split(',').map((k) => k.trim()) : undefined,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: '/',
    },
    robots: seo.robots || 'index, follow',
    openGraph: {
      title: seo.metaTitle,
      description: seo.metaDescription,
      url: siteUrl,
      siteName: 'Liquid Glass Portfolio',
      images: [
        {
          url: seo.ogImageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
          width: 1200,
          height: 630,
          alt: seo.metaTitle,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.metaTitle,
      description: seo.metaDescription,
      creator: seo.twitterHandle || '@alexmiller',
      images: [seo.ogImageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop'],
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased selection:bg-indigo-500 selection:text-white">
        <AmbientBackground />
        <Navbar />
        <main className="relative z-10">{children}</main>
        <Footer />
        <ProjectModal />
        <AdminDrawer />
      </body>
    </html>
  );
}
