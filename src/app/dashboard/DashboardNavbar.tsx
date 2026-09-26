"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import ProfileMenu from "./components/ProfileMenu";
import OnlineUsers from "./components/OnlineUsers";

type DashboardNavbarProps = {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string | null;
  };
};

export default function DashboardNavbar({
  user,
}: DashboardNavbarProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    try {
      setLoading(true);

      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Logout gagal");
      }

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("LOGOUT_ERROR:", error);

      setLoading(false);
    }
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div 
        className="
          mx-auto 
          flex 
          min-h-16 
          max-w-7xl 
          items-center 
          justify-between 
          gap-3 
          px-3 
          sm:gap-4 
          sm:px-6
        "
      >

          <div className="shrink-0">
            <ProfileMenu user={user} />
          </div>

          <div className="shrink-0">
            <OnlineUsers currentUserId={user.id} />
          </div>  

          <div className="min-w-0 flex-1"></div>

        <div className="shrink-0">
          <button
            type="button"
            onClick={handleLogout}
            disabled={loading}
            className="
              rounded-xl 
              border 
              border-blue-950 
              px-3 
              py-2 
              text-sm
              bg-blue-800 
              font-medium 
              text-white 
              transition 
              hover:bg-blue-700 
              disabled:cursor-not-allowed 
              disabled:opacity-50
            "
          >
            {loading ? "Logout..." : "Logout"}
          </button>
        </div>
      </div>
    </header>
  );
}