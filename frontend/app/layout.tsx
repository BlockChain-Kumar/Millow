import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

// Load premium fonts
const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({ 
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Millow 2.0 | Decentralized Real Estate Platform",
  description: "Buy and sell real estate as NFTs with blockchain-powered escrow. Secure, transparent, and decentralized property transactions on Ethereum.",
  keywords: ["blockchain", "real estate", "NFT", "Ethereum", "DeFi", "property", "escrow", "smart contracts"],
  authors: [{ name: "Millow Team" }],
  creator: "Millow",
  publisher: "Millow",
  
  // Open Graph (for social sharing)
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://millow.app",
    title: "Millow 2.0 | Decentralized Real Estate",
    description: "Revolutionary blockchain-powered real estate platform. Buy, sell, and own property as NFTs.",
    siteName: "Millow",
    images: [
      {
        url: "/og-image.png", // You'll need to create this
        width: 1200,
        height: 630,
        alt: "Millow - Decentralized Real Estate",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Millow 2.0 | Decentralized Real Estate",
    description: "Buy and sell real estate as NFTs with blockchain-powered escrow",
    images: ["/og-image.png"],
    creator: "@millow_dapp",
  },

  // Additional metadata
  robots: {
    index: true,
    follow: true,
  },
  
  // Theme color for mobile browsers
  themeColor: "#6366f1",
  
  // Manifest for PWA support
  manifest: "/manifest.json",
  
  // Icons
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${poppins.variable}`}>
      <head>
        {/* Additional meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#6366f1" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={`${poppins.className} antialiased bg-gray-50 text-gray-900`}>
        {/* Main Content */}
        {children}
        
        {/* Web3 Provider Warning for non-web3 browsers */}
        <noscript>
          <div style={{ 
            padding: "20px", 
            background: "#ef4444", 
            color: "white", 
            textAlign: "center",
            fontWeight: "bold"
          }}>
            JavaScript is required to use Millow. Please enable JavaScript in your browser.
          </div>
        </noscript>
      </body>
    </html>
  );
}
