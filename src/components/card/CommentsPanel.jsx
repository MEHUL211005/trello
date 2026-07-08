function CommentsPanel() {
  return (
    <div className="h-full p-6">
      <h2 className="text-lg font-semibold text-slate-800">
        Comments
      </h2>

      <textarea
        placeholder="Write a comment..."
        className="
          mt-4
          min-h-[120px]
          w-full
          resize-none
          rounded-lg
          border
          border-slate-300
          bg-white
          p-3
          outline-none
          focus:border-sky-500
        "
      />

      <button
        className="
          mt-3
          rounded-md
          bg-blue-600
          px-4
          py-2
          text-white
          hover:bg-blue-700
        "
      >
        Save
      </button>
    </div>
  );
}

export default CommentsPanel;