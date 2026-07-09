function DeleteCommentPopover({ onDelete, onClose }) {
  return (
    <div className="absolute right-0 top-8 z-50 w-64 rounded-lg border border-slate-200 bg-white p-4 shadow-xl">
      <p className="text-sm text-slate-700">
        Delete this comment?
      </p>

      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-md bg-slate-200 px-3 py-1.5 text-sm hover:bg-slate-300"
        >
          Cancel
        </button>

        <button
          onClick={onDelete}
          className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-500"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default DeleteCommentPopover;