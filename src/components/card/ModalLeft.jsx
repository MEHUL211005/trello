import ModalActions from "./ModalActions";
import ModalDescription from "./ModalDescription";
import Checklist from "./Checklist";
import ModalAttachments from "./ModalAttachments";
import { useQuery } from "@tanstack/react-query";
import { getCardLabels } from "../../api/labelApi";
// import Activity from "./Activity";
import ModalLabels from "./ModalLabels";
// import ModalDueDate from "./ModalDueDate";

function ModalLeft({card,title,setTitle, cardContext}) {
  const {
  data: labelsData,
} = useQuery({

  queryKey:["cardLabels", card.id],

  queryFn:()=>getCardLabels(card.id),

  enabled:!!card.id,

});


const labels = labelsData?.labels || [];
      const {
    userId,
    workspaceId,
    boardId,
    listId,
  } = cardContext;
  return (
    <div className="flex-1 overflow-y-auto px-8 py-6">
   <ModalLabels labels={labels} />
    {/* <ModalDueDate dueDate={card.dueDate} card={card} cardContext={cardContext} /> */}
      <ModalActions
        userId={userId}
        workspaceId={workspaceId}
        boardId={boardId}
        listId={listId}
        cardId={card.id}
        />
        {card.members?.length > 0 && (
  <div className="mb-6">
    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
      Members
    </h4>

    <div className="flex items-center gap-2">
      {card.members.map((member) => (
  <div
    key={member.id}
    className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 text-sm font-semibold text-white"
    title={member.name}
  >
    {member.name?.charAt(0).toUpperCase()}
  </div>
))}
    </div>
  </div>
)}

      <ModalDescription card={card} cardContext={cardContext} />

      <Checklist
      card={card}
      cardContext={{
      ...cardContext,
      cardId: card.id,
      }}
      />

     <ModalAttachments
      card={card}
      cardContext={{
    ...cardContext,
      cardId: card.id,
    }}
    />

      {/* <Activity /> */}
    </div>
  );
}

export default ModalLeft;