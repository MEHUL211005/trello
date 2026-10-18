import { ConfirmPopover } from "./ui";

function DeleteCommentPopover({ onDelete, onClose }) {
  return (
    <ConfirmPopover
      title="Delete comment?"
      message="This comment will be removed for everyone on the card."
      onConfirm={onDelete}
      onClose={onClose}
      className="right-0 top-7"
    />
  );
}

export default DeleteCommentPopover;
