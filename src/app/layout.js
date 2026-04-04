import "./globals.css";
import ConfigLayout from "./config-layout";
// import Providers from "./providers";


export const metadata = {
  title: "Premium Invest",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* <Providers> */}
        <ConfigLayout>{children}</ConfigLayout>
        {/* </Providers> */}
      </body>
    </html>
  );
}
