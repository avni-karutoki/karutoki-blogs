import AdminRouteGuard from "@/components/AdminRouteGuard";

export default function NewWritingLayout({ children }: { children: React.ReactNode }) {
  return <AdminRouteGuard>{children}</AdminRouteGuard>;
}
