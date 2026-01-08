"use client";
import { Loading } from "@/components/loading";
import { Navbar } from "@/features/auth/components";
import { useAuth } from "@/features/auth/hooks";
import { useRouter } from "next/navigation";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  if (!isLoading && isAuthenticated) {
    router.push("/dashboard");
  }

  if (isLoading) {
    return <Loading text="Cargando..." />;
  }

  return (
    <>
      <Navbar />
      <main className="flex items-center justify-center p-4 pt-14">
        {children}
      </main>
    </>
  );
}
