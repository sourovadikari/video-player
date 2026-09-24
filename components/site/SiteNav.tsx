"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/videos", label: "Videos" },
  { href: "/playground", label: "Playground" },
  { href: "/examples", label: "Examples" },
  { href: "/docs", label: "Docs" },
];

export function SiteNav({ hero = false }: { hero?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <nav className={`site-nav ${hero ? "" : "inner-nav"}`} aria-label="Main navigation">
      <Link className="brand" href="/" onClick={() => setOpen(false)}>signal<span>play</span></Link>
      <button className="nav-toggle" type="button" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} onClick={() => setOpen((value) => !value)}>{open ? <X size={20} /> : <Menu size={20} />}</button>
      <div className={`nav-links ${open ? "is-open" : ""}`}>
        {LINKS.map((link) => {
          const active = link.href === "/videos" ? pathname.startsWith("/videos") : pathname === link.href;
          return <Link key={link.href} href={link.href} className={active ? "is-active" : undefined} aria-current={active ? "page" : undefined} onClick={() => setOpen(false)}>{link.label}</Link>;
        })}
      </div>
      <Link className="nav-cta" href="/playground" onClick={() => setOpen(false)}>Try it live <span>↗</span></Link>
    </nav>
  );
}
