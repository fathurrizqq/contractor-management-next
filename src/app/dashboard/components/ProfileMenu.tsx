"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type ProfileMenuProps = {
  user: {
    name: string;
    email: string;
    role: string;
    avatar?: string | null;
  };
};

const roleLabels: Record<string, string> = {
  ADMIN: "Administrator",
  PIC: "PIC",
  SPV: "Supervisor",
  LOGISTIC: "Logistik",
};

export default function ProfileMenu({ user }: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  const roleLabel = roleLabels[user.role] ?? user.role;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  function handleToggle() {
    setIsOpen((current) => !current);
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="
          flex 
          items-center 
          gap-3 
          rounded-xl 
          px-2 
          py-1.5 
          text-left 
          transition 
          hover:bg-slate-100 
          focus:outline-none 
          focus:ring-2 
          focus:ring-slate-300
        "
      >
        <div 
          className="
            relative 
            h-10 
            w-10 
            shrink-0 
            overflow-hidden 
            rounded-full 
            border 
            border-slate-200 
            bg-slate-100
          "
          >
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={`Foto profil ${user.name}`}
              fill
              sizes="40px"
              className="object-cover"
            />
          ) : (
            <div 
              className="
                flex 
                h-full 
                w-full 
                items-center 
                justify-center 
                text-sm 
                font-semibold 
                text-slate-600
              "
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="hidden min-w-0 sm:block">
          <p 
            className="
              truncate 
              text-sm 
              font-semibold 
              text-slate-900
              select-none
            "
          >
            {user.name}
          </p>

          <p 
            className="
              truncate 
              text-xs 
              text-slate-500
              select-none 
            "
          >
            {roleLabel}
          </p>
        </div>

        <svg
          className={`hidden h-4 w-4 text-slate-400 transition-transform sm:block ${
            isOpen ? "rotate-180" : ""
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="false"
          className="
            absolute 
            top-[calc(100%+12px)] 
            z-50 
            w-[calc(100vw-32px)] 
            max-w-sm 
            rounded-2xl 
            border 
            border-slate-200 
            bg-white 
            p-5 
            shadow-xl
          "
        >
          <div className="flex flex-col items-center text-center">
            <div 
              className="
                relative 
                h-20 
                w-20 
                overflow-hidden 
                rounded-full 
                border-2 
                border-slate-200 
                bg-slate-100
              "
            >
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={`Foto profil ${user.name}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              ) : (
                <div 
                  className="
                    flex 
                    h-full 
                    w-full 
                    items-center 
                    justify-center 
                    text-2xl 
                    font-bold 
                    text-slate-600
                  "
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <h2 
              className="
                mt-4 
                text-lg 
                font-semibold 
                text-slate-900
                select-none
              "
            >
              {user.name}
            </h2>

            <p 
              className="
                mt-1 
                text-sm 
                text-slate-500
                select-none
              "
            >
              {roleLabel}
            </p>

            <p 
              className="
                mt-1 
                max-w-full 
                truncate 
                text-xs 
                text-slate-400
                select-none
              "
            >
              {user.email}
            </p>
          </div>

          <div className="my-5 h-px bg-slate-100" />

          <div className="space-y-2">
            <button
              type="button"
              className="
                w-full 
                rounded-xl 
                border 
                border-slate-200 
                px-4 py-3 
                text-left 
                text-sm 
                font-medium 
                text-slate-700 
                transition 
                hover:bg-slate-50
              "
            >
              Edit Profile
            </button>

            <button
              type="button"
              className="
                w-full 
                rounded-xl 
                border 
                border-slate-200 
                px-4 
                py-3 
                text-left 
                text-sm 
                font-medium 
                text-slate-700 
                transition 
                hover:bg-slate-50
              "
            >
              Change Password
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="
              mt-4 
              w-full 
              rounded-xl
              border-blue-950 
              bg-blue-800 
              px-4 
              py-3 
              text-sm 
              font-semibold 
              text-white transition 
              hover:bg-blue-700
            "
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}