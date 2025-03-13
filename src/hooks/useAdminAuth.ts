import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type UseAdminAuthOptions = {
  allowedRoles: string[];
  redirectTo?: string;
  loginPath?: string;
};

export function useAdminAuth({
  allowedRoles,
  redirectTo = "/admin/unauthorized",
  loginPath = "/admin"
}: UseAdminAuthOptions) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    // Handle unauthenticated users
    if (status === "unauthenticated") {
      router.push(loginPath);
      return;
    }

    // Handle authenticated users with incorrect role
    if (status === "authenticated") {
      const userRole = session?.user?.role as string;
      
      if (!allowedRoles.includes(userRole)) {
        router.push(redirectTo);
        toast?.error("You don't have permission to access this page");
        return;
      }
      
      setIsAuthorized(true);
    }
  }, [status, session, router, allowedRoles, redirectTo, loginPath]);

  return {
    isAuthorized,
    isLoading: status === "loading" || isAuthorized === null,
    session,
    status,
    userRole: session?.user?.role as string
  };
}