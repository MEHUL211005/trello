import { ConfirmPopover } from "./ui";

function DeleteChecklistPopover({ onDelete, onClose }) {
  return (
    <ConfirmPopover
      title="Delete checklist?"
      message="The checklist and all of its items will be removed permanently."
      onConfirm={onDelete}
      onClose={onClose}
    />
  );
}

export default DeleteChecklistPopover;
