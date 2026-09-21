import type { ReactNode } from "react";
import Link from "next/link";
import { auth } from "@/auth";
import { Logo } from "@/components/logo";
import { SidebarNav, MobileNav } from "@/components/sidebar-nav";
import { LogoutButton } from "@/components/logout-button";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-1 flex-col md:flex-row">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-64 shrink-0 flex-col bg-brand-bg md:flex">
        <div className="border-b border-brand-border px-4 py-5">
          <Logo />
        </div>
        <SidebarNav />
        <div className="border-t border-brand-border p-3">
          <p className="truncate px-3 pb-1 text-xs text-brand-text-muted">
            {session?.user?.name}
          </p>
          <Link
            href="/conta"
            className="block rounded-lg px-3 py-2 text-left text-sm font-medium text-brand-text-muted transition-colors hover:bg-brand-bg-elevated hover:text-brand-text"
          >
            Minha conta
          </Link>
          <LogoutButton />
        </div>
      </aside>

      {/* Top bar (mobile) */}
      <header className="flex flex-col bg-brand-bg md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Logo />
          <div className="flex items-center gap-3">
            <Link
              href="/conta"
              className="text-sm font-medium text-brand-text-muted hover:text-brand-text"
            >
              Minha conta
            </Link>
            <LogoutButton />
          </div>
        </div>
        <MobileNav />
      </header>

      <main className="flex-1 bg-background p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
