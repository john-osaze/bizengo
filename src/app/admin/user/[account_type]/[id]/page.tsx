// app/admin/user/[account_type]/[id]/page.tsx
import UserProfileClient from "./UserProfileClient";
export async function generateStaticParams() {
  const accountTypes = ["vendor", "customer", "admin"];
  const staticParams = [];

  for (const accountType of accountTypes) {
    for (let i = 1; i <= 100; i++) {
      staticParams.push({
        account_type: accountType,
        id: i.toString(),
      });
    }
  }

  return staticParams;
}

// Props interface for Next.js 15+ (params is now a Promise)
interface PageProps {
  params: Promise<{
    account_type: string;
    id: string;
  }>;
}

// Server component
export default async function UserProfilePage({ params }: PageProps) {
  // Await the params Promise in Next.js 15+
  const resolvedParams = await params;

  return <UserProfileClient params={resolvedParams} />;
}
