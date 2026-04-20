import { Geist, Geist_Mono } from "next/font/google";
import SessionProvider from "@/components/SessionProvider";
import Navbar from "@/components/Navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "বাসা লাগবে | To-Let Dhaka — Find Rentals in Dhaka",
  description:
    "The fastest way for students and bachelors to find rental housing in Dhaka. Browse hostels, shared rooms, and flats with Dhaka-specific filters — no more walking in the summer heat.",
  keywords: [
    "to-let",
    "dhaka",
    "rental",
    "bachelor",
    "student",
    "hostel",
    "shared room",
    "flat",
    "basa lagbe",
    "বাসা লাগবে",
  ],
  openGraph: {
    title: "বাসা লাগবে | To-Let Dhaka",
    description: "Find your next home in Dhaka — fast.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SessionProvider>
          <Navbar />
          <main className="flex-1">{children}</main>

          {/* Footer */}
          <footer
            className="py-6 px-4 text-center text-xs"
            style={{
              background: "var(--secondary-dark)",
              color: "var(--text-muted)",
            }}
          >
            <p>
              © {new Date().getFullYear()}{" "}
              <span style={{ color: "var(--primary-light)" }}>বাসা লাগবে</span>{" "}
              — Built for Dhaka&apos;s students & bachelors
            </p>
            <p className="mt-1 opacity-60">
              No more wandering in the গরম ☀️
            </p>
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
