import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevForge AI - Workspace",
  description: "AI-Powered React Component Builder with Google Gemini AI",
  icons: {
    icon: "/favicon-theme.svg",
    shortcut: "/favicon-theme.svg",
    apple: "/favicon-theme.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon-theme.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/favicon-theme.svg" type="image/svg+xml" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.tailwind = {
                theme: {
                  extend: {
                    colors: {
                      warmIvory: '#F0E8E0',
                      softCream: '#F8F8F0',
                      offWhite: '#F0F0E8',
                      lightBeige: '#E8E0D0',
                      terracotta: {
                        DEFAULT: '#C87858',
                        hover: '#D98A68',
                      },
                      softTerracotta: '#D98A68',
                      warmGray: '#D8D8D0',
                      lightGray: '#E8E8E8',
                      charcoal: '#282824',
                      mutedGray: '#88857D',
                      softGreen: '#75A86B',
                    },
                  },
                },
              };
            `,
          }}
        />
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-[#F8F8F0] text-[#282824] antialiased font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
