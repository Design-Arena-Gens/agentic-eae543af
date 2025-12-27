"use client";

import clsx from "clsx";
import type { AppointmentDraft } from "../lib/agentFlow";

interface SummaryCardProps {
  draft: AppointmentDraft;
  isComplete: boolean;
}

const SummaryCard = ({ draft, isComplete }: SummaryCardProps) => {
  const items = [
    { label: "Prospect", value: draft.prospectName || "Pending" },
    { label: "Property", value: draft.propertyType || "Pending" },
    { label: "Location", value: draft.location || "Pending" },
    { label: "Budget", value: draft.budget || "Pending" },
    { label: "Date", value: draft.preferredDate || "Pending" },
    { label: "Time", value: draft.preferredTime || "Pending" },
    { label: "Contact", value: draft.contactChannel || "Pending" }
  ];

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-white/0 p-6 shadow-xl">
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-300">Appointment Card</p>
        <span
          className={clsx(
            "rounded-full px-3 py-1 text-xs font-semibold uppercase",
            isComplete ? "bg-emerald-500/20 text-emerald-200" : "bg-orange-500/20 text-orange-100"
          )}
        >
          {isComplete ? "Ready" : "Draft"}
        </span>
      </div>

      <dl className="space-y-3 text-sm text-slate-100">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-4 rounded-2xl bg-white/5 px-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-300">{item.label}</dt>
            <dd className="text-right text-sm font-medium text-white">
              {item.value.length === 0 ? <span className="text-slate-500">Pending</span> : item.value}
            </dd>
          </div>
        ))}
      </dl>

      {draft.additionalNotes.length > 0 && (
        <div className="mt-5 rounded-2xl bg-white/5 p-4 text-xs text-slate-200">
          <p className="mb-2 font-semibold uppercase tracking-wide text-slate-300">Additional Notes</p>
          <ul className="space-y-2">
            {draft.additionalNotes.map((note, index) => (
              <li key={`${note}-${index}`} className="rounded-xl bg-black/30 px-3 py-2">
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SummaryCard;
