function DeleteAttachmentPopover({
  onDelete,
  onClose,
}) {
  return (
    <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-lg border border-slate-200 bg-white p-4 shadow-xl">
      <h3 className="text-center text-sm font-semibold">
        Delete Attachment?
      </h3>

      <p className="mt-3 text-sm text-slate-600">
        Deleting an attachment is permanent and there is no way to get it back.
      </p>

      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-md bg-slate-200 px-3 py-2 text-sm hover:bg-slate-300"
        >
          Cancel
        </button>

        <button
          onClick={onDelete}
          className="rounded-md bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-500"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default DeleteAttachmentPopover;