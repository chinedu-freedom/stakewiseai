import "../globals.css";
import SidebarLayout from "@/components/layout/SidebarLayout";

export const metadata = {
  title: "",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SidebarLayout>{children}</SidebarLayout>
      </body>
    </html>
  );
}
