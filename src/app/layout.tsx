import "./globals.css";
import Header from "@/components/ui/Header";
import ScrollToTop from "@/components/ui/ScrollToTop";
import BottomTabNavigation from "@/components/ui/BottomTabNavigation";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

export const metadata = {
  title: "Bizengo",
  description:
    "Leading software, product, and web/mobile app development services.",
  icons: {
    icon: "/images/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="flex flex-col min-h-screen ">
        <ErrorBoundary>
          <ScrollToTop />
            <main>
                <Header />
                <div className="w-full min-h-screen overflow-x-hidden md:pb-16">
                    {children}
                </div>
            </main>
          <BottomTabNavigation />
        </ErrorBoundary>
      </body>
    </html>
  );
}
