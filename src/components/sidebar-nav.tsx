"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/financeiro", label: "Financeiro" },
  { href: "/estoque", label: "Estoque" },
  { href: "/pedidos", label: "Pedidos / Obras" },
  { href: "/clientes", label: "Clientes" },
  { href: "/agenda", label: "Agenda" },
  { href: "/documentos", label: "Documentos" },
];

function useIsActive(href: string) {
  const pathname = usePathname();
  return pathname === href || pathname.startsWith(href + "/");
}

export function SidebarNav() {
  return (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {navLinks.map((link) => (
        <NavLink key={link.href} href={link.href} className="px-3 py-2">
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}

export function MobileNav() {
  return (
    <nav className="flex gap-1 overflow-x-auto px-3 pb-2">
      {navLinks.map((link) => (
        <NavLink key={link.href} href={link.href} className="whitespace-nowrap px-3 py-1.5">
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}

function NavLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: ReactNode;
}) {
  const isActive = useIsActive(href);
  return (
    <Link
      href={href}
      className={`rounded-lg text-sm font-medium transition-colors ${className} ${
        isActive
          ? "bg-brand-orange text-white"
          : "text-brand-text-muted hover:bg-brand-bg-elevated hover:text-brand-text"
      }`}
    >
      {children}
    </Link>
  );
}
