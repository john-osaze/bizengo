import FindProducts from "./tools/page";

export const metadata = {
  title: "Bizengo",
  description: "Welcome to Bizengo.",
  icons: {
    icon: "/images/logo.png",
  },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <FindProducts />
    </div>
  );
};

