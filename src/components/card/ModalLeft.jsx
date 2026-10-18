import { useQuery } from "@tanstack/react-query";

import { useBoardPermissions } from "../../context/boardPermissions";
import { getCardLabels } from "../../api/labelApi";
import ModalActions from "./ModalActions";
import ModalDescription from "./ModalDescription";
import Checklist from "./Checklist";
import ModalAttachments from "./ModalAttachments";
import ModalLabels from "./ModalLabels";
import ModalDueDate from "./ModalDueDate";
import { Avatar, MetaLabel } from "./ui";

function ModalLeft({ card, cardContext }) {
  const { canEdit } = useBoardPermissions();

  const { data: labelsData } = useQuery({
    queryKey: ["cardLabels", card.id],
    queryFn: () => getCardLabels(card.id),
    enabled: !!card.id,
  });

  const labels = labelsData?.labels || [];
  const members = card.members || [];

  const hasMeta = labels.length > 0 || card.dueDate || members.length > 0;

  return (
    <div className="space-y-7 px-6 py-6 sm:px-8">
      {/* Quick facts: who, what, when */}
      {hasMeta && (
        <div className="flex flex-wrap gap-x-10 gap-y-5">
          {members.length > 0 && (
            <div>
              <MetaLabel>Members</MetaLabel>
              <div className="flex -space-x-2">
                {members.map((member) => (
                  <Avatar
                    key={member.id}
                    id={member.id}
                    name={member.name}
                    size={34}
                  />
                ))}
              </div>
            </div>
          )}

          <ModalLabels labels={labels} />

          <ModalDueDate dueDate={card.dueDate} isCompleted={card.isCompleted} />
        </div>
      )}

      {canEdit && (
      <ModalActions
        userId={cardContext.userId}
        workspaceId={cardContext.workspaceId}
        boardId={cardContext.boardId}
        listId={cardContext.listId}
        cardId={card.id}
        dueDate={card.dueDate}
        assignedIds={members.map((member) => member.id)}
      />
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
    </div>
  );
}

export default ModalLeft;
