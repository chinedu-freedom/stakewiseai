import SidebarLayout from "@/components/layout/SidebarLayout";
import AuthGuard from "@/components/AuthGuard";

export const metadata = {
  title: "",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthGuard>
          <SidebarLayout>{children}</SidebarLayout>
        </AuthGuard>
      </body>
    </html>
  );
}
