import "./globals.css";
import ConfigLayout from "./config-layout";


export const metadata = {
  title: "Blockvextrade Admin",
  description: "Blockvextrade Intelligent Staking & Investment Management Console",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.png", type: "image/png" }
    ],
    shortcut: "/favicon.ico",
    apple: "/favicon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ConfigLayout>{children}</ConfigLayout>
      </body>
    </html>
  );
}
