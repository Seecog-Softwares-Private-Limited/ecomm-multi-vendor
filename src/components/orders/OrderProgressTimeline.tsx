"use client";

import { memo } from "react";
import { Check, Home, MapPin, Package, Truck } from "lucide-react";

type TimelineEvent = {
  status: string;
  occurredAt: string;
};

type OrderProgressTimelineProps = {
  status: string;
  timeline?: TimelineEvent[];
};

const STATUS_RANK: Record<string, number> = {
  PENDING_PAYMENT: 0,
  PLACED: 0,
  PAYMENT_CONFIRMED: 1,
  PROCESSING: 2,
  SHIPPED: 3,
  OUT_FOR_DELIVERY: 4,
  DELIVERED: 5,
};

const STEPS = [
  { rank: 0, label: "Order Placed", icon: Package, emoji: "✔" },
  { rank: 1, label: "Confirmed", icon: Check, emoji: "✔" },
  { rank: 2, label: "Packed", icon: Package, emoji: "✔" },
  { rank: 3, label: "Shipped", icon: Truck, emoji: "🚚" },
  { rank: 4, label: "Out for Delivery", icon: MapPin, emoji: "📍" },
  { rank: 5, label: "Delivered", icon: Home, emoji: "🏠" },
] as const;

function resolveProgressRank(status: string, timeline?: TimelineEvent[]): number {
  let rank = STATUS_RANK[status] ?? 0;
  if (timeline) {
    for (const event of timeline) {
      rank = Math.max(rank, STATUS_RANK[event.status] ?? 0);
    }
  }
  return rank;
}

const STEP_STATUS_MAP: Record<number, string[]> = {
  0: ["PLACED", "PENDING_PAYMENT"],
  1: ["PAYMENT_CONFIRMED"],
  2: ["PROCESSING"],
  3: ["SHIPPED"],
  4: ["OUT_FOR_DELIVERY"],
  5: ["DELIVERED"],
};

function findEventDate(
  timeline: TimelineEvent[] | undefined,
  stepRank: number
): string | null {
  if (!timeline?.length) return null;
  const statuses = STEP_STATUS_MAP[stepRank] ?? [];
  for (let i = timeline.length - 1; i >= 0; i -= 1) {
    const event = timeline[i];
    if (event && statuses.includes(event.status)) {
      return event.occurredAt;
    }
  }
  return null;
}

export const OrderProgressTimeline = memo(function OrderProgressTimeline({
  status,
  timeline,
}: OrderProgressTimelineProps) {
  const isCancelled = status === "CANCELLED" || status === "RETURNED";
  const progressRank = resolveProgressRank(status, timeline);

  if (isCancelled) {
    return (
      <section aria-label="Order progress" className="mb-6">
        <h2 className="mb-4 text-lg font-bold text-slate-900">Order progress</h2>
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
          This order was cancelled.
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Order progress" className="mb-6">
      <h2 className="mb-4 text-lg font-bold text-slate-900">Order progress</h2>
      <ol className="space-y-0">
        {STEPS.map((step, index) => {
          const isComplete =
            status === "DELIVERED" ? true : progressRank > step.rank;
          const isActive = !isComplete && progressRank === step.rank;
          const isFuture = !isComplete && !isActive;
          const StepIcon = step.icon;
          const eventDate = findEventDate(timeline, step.rank);

          return (
            <li key={step.label} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
                    isComplete
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : isActive
                        ? "border-[#FF6A00] bg-[#FF6A00] text-white"
                        : "border-slate-200 bg-white text-slate-400"
                  }`}
                  aria-hidden="true"
                >
                  {isComplete ? (
                    <Check className="h-5 w-5" />
                  ) : isActive ? (
                    <span className="text-base leading-none">{step.emoji}</span>
                  ) : (
                    <StepIcon className="h-5 w-5" />
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`my-1 min-h-[24px] w-0.5 flex-1 ${
                      isComplete ? "bg-emerald-400" : "bg-slate-200"
                    }`}
                    aria-hidden="true"
                  />
                )}
              </div>
              <div className={`pb-6 ${isFuture ? "opacity-60" : ""}`}>
                <p
                  className={`font-semibold ${
                    isActive || isComplete ? "text-slate-900" : "text-slate-500"
                  }`}
                >
                  {step.label}
                  {isActive && (
                    <span className="sr-only"> — current step</span>
                  )}
                  {isComplete && !isActive && (
                    <span className="sr-only"> — completed</span>
                  )}
                </p>
                {eventDate && (isComplete || isActive) && (
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(eventDate).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
});
