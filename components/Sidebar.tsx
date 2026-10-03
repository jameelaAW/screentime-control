"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/", label: "Today's Dashboard" },
  { href: "/sessions/new", label: "Log Session" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
        <span className="font-semibold text-slate-900">Screen Time Control</span>
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        >
          {open ? "Close" : "Menu"}
        </button>
      </header>

      <aside
        className={`${open ? "block" : "hidden"} border-b border-slate-200 bg-white md:fixed md:inset-y-0 md:left-0 md:block md:w-60 md:border-b-0 md:border-r`}
      >
        <div className="hidden px-5 py-5 text-lg font-bold text-slate-900 md:block">Screen Time Control</div>
        <nav className="flex flex-col gap-1 p-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                isActive(item.href) ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
