import { useDispatch } from "react-redux";
import { toggleMember } from "../../redux/workspaceSlice";

function MembersPopover({ cardContext, onClose }) {
  const dispatch = useDispatch();

  const availableMembers = [
    {
      id: "mehul",
      name: "Mehul",
      avatar: "M",
    },
    {
      id: "alex",
      name: "Alex",
      avatar: "A",
    },
    {
      id: "sarah",
      name: "Sarah",
      avatar: "S",
    },
  ];

  return (
    <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-lg border border-slate-200 bg-white p-4 shadow-xl">
      <h3 className="mb-3 text-center text-sm font-semibold">
        Members
      </h3>

      <div className="max-h-64 space-y-2 overflow-y-auto pr-1 light-scrollbar">
        {availableMembers.map((member) => (
          <div
  key={member.id}
  onClick={() => {
    dispatch(
      toggleMember({
        ...cardContext,
        member,
      })
    );
  }}
  className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-slate-100"
>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-semibold text-white">
              {member.avatar}
            </div>

            <span className="text-sm">
              {member.name}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}

export default MembersPopover;