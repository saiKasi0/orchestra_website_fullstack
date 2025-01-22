"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItemProps = {
  href: string;
  current: boolean;
  children: React.ReactNode;
};

const NavItem = ({ href, current, children }: NavItemProps) => (
  <Link
    href={href}
    className={`text-sm transition-colors duration-200 ${
      current ? "text-amber-500" : "text-gray-600 hover:text-amber-500"
    }`}
  >
    {children}
  </Link>
);

const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-600 hover:text-amber-500 transition-colors duration-200"
        title="Menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="fixed inset-0 bg-white z-50">
          <div className="p-4">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-amber-500"
              title="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <nav className="mt-12">
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/"
                    className="block text-gray-700 hover:text-amber-500 text-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/concerts"
                    className="block text-gray-700 hover:text-amber-500 text-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    Concerts
                  </Link>
                </li>
                <li>
                  <Link
                    href="/competitions"
                    className="block text-gray-700 hover:text-amber-500 text-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    Competitions
                  </Link>
                </li>
                <li>
                  <Link
                    href="/trips"
                    className="block text-gray-700 hover:text-amber-500 text-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    Trips
                  </Link>
                </li>
                <li>
                  <Link
                    href="/awards"
                    className="block text-gray-700 hover:text-amber-500 text-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    Awards
                  </Link>
                </li>
                <li>
                  <Link
                    href="/resources"
                    className="block text-gray-700 hover:text-amber-500 text-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    Resources
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="w-full flex items-center justify-between px-4 py-4 bg-white border-b border-gray-200">
      <Link href="/" className="flex items-center space-x-3">
        <Image
          src="/CRHSLogo.png"
          alt="CRHS Logo"
          width={50}
          height={50}
          className="object-contain"
        />
        <span className="text-lg font-semibold text-gray-800">
          Cypress Ranch Orchestra
        </span>
      </Link>
      <MobileNav />
      <div className="hidden lg:flex items-center space-x-8">
        <NavItem href="/" current={pathname === "/"}>
          Home
        </NavItem>
        <NavItem href="/concerts" current={pathname === "/concerts"}>
          Concerts
        </NavItem>
        <NavItem href="/competitions" current={pathname === "/competitions"}>
          Competitions
        </NavItem>
        <NavItem href="/trips" current={pathname === "/trips"}>
          Trips
        </NavItem>
        <NavItem href="/awards" current={pathname === "/awards"}>
          Awards
        </NavItem>
        <NavItem href="/resources" current={pathname === "/resources"}>
          Resources
        </NavItem>
      </div>
    </nav>
  );
}