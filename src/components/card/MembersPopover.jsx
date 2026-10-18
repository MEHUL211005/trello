import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Search } from "lucide-react";
import toast from "react-hot-toast";

import { getBoardMembers, toggleMember } from "../../api/membersApi";
import { getErrorMessage } from "../../lib/validation";
import { Avatar, inputCls } from "./ui";

function MembersPopover({ cardContext, assignedIds = [] }) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("");

  const { data: membersData, isLoading } = useQuery({
    queryKey: ["boardMembers", cardContext.boardId],
    queryFn: () => getBoardMembers(cardContext.boardId),
  });

  const availableMembers = (membersData?.members || []).filter((member) =>
    `${member.name} ${member.email}`
      .toLowerCase()
      .includes(filter.trim().toLowerCase()),
  );

  const toggleMutation = useMutation({
    mutationFn: toggleMember,

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["board", cardContext.boardId],
      });
      toast.success(data?.assigned ? "Member assigned" : "Member removed");
    },

    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not update members"));
    },
  });

  return (
    <div>
      <div className="relative mb-3">
        <Search
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search members"
          className={`${inputCls} pl-9`}
        />
      </div>

      <div className="max-h-60 space-y-1 overflow-y-auto">
        {isLoading && (
          <p className="py-4 text-center text-xs text-slate-400">Loading...</p>
        )}

        {!isLoading && availableMembers.length === 0 && (
          <p className="rounded-lg bg-slate-50 py-4 text-center text-xs text-slate-400">
            {filter ? "No one matches that search" : "No members on this board"}
          </p>
        )}

        {availableMembers.map((member) => {
          const assigned = assignedIds.includes(member.id);

          return (
            <button
              key={member.id}
              onClick={() =>
                toggleMutation.mutate({
                  cardId: cardContext.cardId,
                  userId: member.id,
                })
              }
              className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-slate-50"
            >
              <Avatar id={member.id} name={member.name} size={34} />

              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-slate-800">
                  {member.name}
                </span>
                <span className="block truncate text-xs text-slate-400">
                  {member.email}
                </span>
              </span>

              {assigned && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white">
                  <Check size={12} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default MembersPopover;
