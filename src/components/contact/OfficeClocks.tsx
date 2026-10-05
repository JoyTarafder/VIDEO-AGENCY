"use client";

import { useEffect, useState } from "react";
import { site } from "@/content/site";

/** Live local time for one studio — the "worldwide, always on" signal. */
export function OfficeClock({ city, tz, className }: { city: string; tz: string; className?: string }) {
  const [time, setTime] = useState("--:--");

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: tz,
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, [tz]);

  return (
    <span className={className}>
      <span className="text-paper">{city}</span> <span className="font-mono tabular-nums text-fog">{time}</span>
    </span>
  );
}

/** All three studios, e.g. for the contact page. */
export function OfficeClocks({ className }: { className?: string }) {
  return (
    <ul className={className}>
      {site.offices.map((o) => (
        <li key={o.city} className="flex items-baseline justify-between gap-6 border-b border-line py-3 text-sm last:border-b-0">
          <OfficeClock city={o.city} tz={o.tz} />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-fog">{o.detail}</span>
        </li>
      ))}
    </ul>
  );
}
