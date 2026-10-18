import { ConfirmPopover } from "./ui";

function DeleteAttachmentPopover({ onDelete, onClose }) {
  return (
    <ConfirmPopover
      title="Delete attachment?"
      message="Deleting an attachment is permanent and can't be undone."
      onConfirm={onDelete}
      onClose={onClose}
    />
  );
}

export default DeleteAttachmentPopover;
