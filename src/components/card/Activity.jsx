import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { History } from "lucide-react";

import { getCardActivities } from "../../api/activityApi";
import { formatFullDate, timeAgo } from "../../lib/time";
import { Avatar, SectionTitle } from "./ui";

function Activity({ cardContext }) {
  const queryClient = useQueryClient();
  const [showDetails, setShowDetails] = useState(true);

  const { data: activityData } = useQuery({
    queryKey: ["activities", cardContext.cardId],
    queryFn: () => getCardActivities(cardContext.cardId),
  });

  const activities = activityData?.activities || [];

  // Anything that changes the card (labels, members, files, moves...) also
  // refreshes the board, so reload the history whenever the board reloads
  useEffect(() => {
    const cache = queryClient.getQueryCache();

    return cache.subscribe((event) => {
      if (
        event.type === "updated" &&
        event.action?.type === "success" &&
        event.query.queryKey[0] === "board"
      ) {
        queryClient.invalidateQueries({
          queryKey: ["activities", cardContext.cardId],
        });
      }
    });
  }, [queryClient, cardContext.cardId]);

  return (
    <section>
      <SectionTitle
        icon={History}
        title="Activity"
        action={
          activities.length > 0 && (
            <button
              onClick={() => setShowDetails((prev) => !prev)}
              className="rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-500 transition hover:bg-white hover:text-brand-700"
            >
              {showDetails ? "Hide details" : "Show details"}
            </button>
          )
        }
      />

      {!activities.length ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white/60 py-6 text-center text-sm text-slate-400">
          Nothing has happened on this card yet.
        </p>
      ) : (
        showDetails && (
          <ol className="relative space-y-4 before:absolute before:bottom-2 before:left-[16px] before:top-2 before:w-px before:bg-slate-200">
            {activities.map((item) => (
              <li key={item.id} className="relative flex gap-3">
                <Avatar
                  id={item.User?.id}
                  name={item.User?.name || "User"}
                  size={32}
                  className="relative z-10"
                />

                <div className="min-w-0 pt-0.5">
                  <p className="text-sm leading-snug text-slate-600">
                    <span className="font-bold text-slate-900">
                      {item.User?.name || "User"}
                    </span>{" "}
                    {item.action}
                  </p>
                  <p
                    className="mt-0.5 text-xs text-slate-400"
                    title={formatFullDate(item.createdAt)}
                  >
                    {timeAgo(item.createdAt)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )
      )}
    </section>
  );
}

export default Activity;
