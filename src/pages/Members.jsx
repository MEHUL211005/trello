import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { LayoutGrid, Search, UsersRound } from "lucide-react";

import PageShell, { PageHeader } from "../components/PageShell";
import RoleBadge from "../components/RoleBadge";
import { Avatar } from "../components/card/ui";
import { getPeople } from "../api/boardApi";
import { getErrorMessage } from "../lib/validation";

const MAX_CHIPS = 3;

function Members() {
  const [query, setQuery] = useState("");

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["people"],
    queryFn: getPeople,
    refetchOnMount: "always",
  });

  const people = useMemo(() => data?.people || [], [data]);

  const visible = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return people;

    return people.filter((person) =>
      `${person.name} ${person.email}`.toLowerCase().includes(text),
    );
  }, [people, query]);

  return (
    <PageShell>
      <PageHeader
        icon={UsersRound}
        title="Members"
        subtitle={
          people.length > 0
            ? `${people.length} ${people.length === 1 ? "person" : "people"} you collaborate with`
            : "The people you share boards with"
        }
      />

      {people.length > 0 && (
        <div className="relative mb-6 w-full sm:w-80">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email..."
            aria-label="Search members"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
          />
        </div>
      )}

      {isLoading && (
        <div className="grid gap-5 md:grid-cols-2">
          {[0, 1, 2, 3].map((n) => (
            <div key={n} className="h-36 animate-pulse rounded-2xl bg-slate-200/70" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-8 text-center">
          <p className="font-semibold text-rose-700">
            {getErrorMessage(error, "Could not load your members")}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-3 rounded-lg bg-white px-4 py-1.5 text-sm font-semibold text-rose-600 shadow-sm ring-1 ring-rose-200 hover:bg-rose-50"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !isError && people.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <UsersRound size={26} />
          </span>
          <p className="text-lg font-bold text-slate-800">No collaborators yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
            Open a board and press Share to invite teammates by email. They'll
            appear here.
          </p>
          <Link
            to="/boards"
            className="bg-brand-gradient mt-5 inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-600/25 transition hover:brightness-110"
          >
            <LayoutGrid size={16} />
            Go to my boards
          </Link>
        </div>
      )}

      {!isLoading && people.length > 0 && visible.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center">
          <p className="text-lg font-bold text-slate-800">Nobody matches that</p>
          <p className="mt-1 text-sm text-slate-500">Try a different name or email.</p>
        </div>
      )}

      {visible.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2">
          {visible.map((person) => (
            <article
              key={person.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-200 hover:shadow-md"
            >
              <div className="flex items-center gap-3.5">
                <Avatar id={person.id} name={person.name} size={46} />
                <div className="min-w-0">
                  <h2 className="truncate font-bold text-slate-900">{person.name}</h2>
                  <p className="truncate text-sm text-slate-500">{person.email}</p>
                </div>
                <span className="ml-auto shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
                  {person.boards.length}{" "}
                  {person.boards.length === 1 ? "board" : "boards"}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {person.boards.slice(0, MAX_CHIPS).map((board) => (
                  <Link
                    key={board.id}
                    to={`/workspace/${board.workspaceId}/board/${board.id}`}
                    className="flex max-w-full items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm font-medium text-slate-700 transition hover:border-brand-300 hover:bg-brand-50"
                  >
                    <span className="truncate">{board.name}</span>
                    <RoleBadge role={board.role} />
                  </Link>
                ))}

                {person.boards.length > MAX_CHIPS && (
                  <span className="flex items-center rounded-lg bg-slate-100 px-2.5 py-1.5 text-sm font-semibold text-slate-500">
                    +{person.boards.length - MAX_CHIPS} more
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </PageShell>
  );
}

export default Members;
