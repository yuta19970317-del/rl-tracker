"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/players", label: "プレイヤー・個人成績" },
  { href: "/matches/new", label: "試合入力" },
  { href: "/matches", label: "試合一覧" },
  { href: "/pairs", label: "ペア成績" },
  { href: "/rankings", label: "ランキング" },
  { href: "/updates", label: "更新履歴" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-1 overflow-x-auto">
          <span className="text-orange-400 font-bold py-4 pr-4 whitespace-nowrap">
            RL Tracker
          </span>
          {links.map((link) => {
            const active =
              link.href === "/matches"
                ? pathname === "/matches"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-4 text-sm whitespace-nowrap transition-colors ${
                  active
                    ? "text-orange-400 border-b-2 border-orange-400"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
