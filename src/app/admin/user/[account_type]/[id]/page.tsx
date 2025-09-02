// app/admin/user/[...params]/page.tsx
import UserProfileClient from "../UserProfileClient";
export async function generateStaticParams() {
  const accountTypes = ["vendor", "customer", "admin"];
  const staticParams = [];

  for (const accountType of accountTypes) {
    for (let i = 1; i <= 100; i++) {
      staticParams.push({
        params: [accountType, i.toString()],
      });
    }
  }

  return staticParams;
}

// Props interface for catch-all routes
interface PageProps {
  params: {
    params: string[];
  };
}

// Server component
export default function UserProfilePage({ params }: PageProps) {
  const [accountType, id] = params.params;

  // Validate params
  if (!accountType || !id) {
    return <div>Invalid URL parameters</div>;
  }

  return (
    <UserProfileClient
      params={{
        account_type: accountType,
        id: id,
      }}
    />
  );
}
