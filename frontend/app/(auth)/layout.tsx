import Navbar from "./components/navbar";
import { AuthGuard } from "./components/auth-guard";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <Navbar />
      <main className="pt-14 flex items-center justify-center p-4">
        {children}
      </main>
    </AuthGuard>
  );
}


