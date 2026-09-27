import AdminRouteGuard from "@/components/AdminRouteGuard";

export default function EditWritingLayout({ children }: { children: React.ReactNode }) {
  return <AdminRouteGuard>{children}</AdminRouteGuard>;
}
