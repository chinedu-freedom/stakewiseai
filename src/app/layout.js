import "./globals.css";
import ConfigLayout from "./config-layout";


export const metadata = {
  title: "SatrixNow",
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
