function ModalDueDate({ dueDate }) {
  if (!dueDate) {
    return null;
  }

  const formattedDate = new Date(dueDate).toLocaleDateString(
    "en-US",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );

  return (
    <div className="mb-6">

      <h3 className="
        mb-3
        text-xs
        font-semibold
        uppercase
        tracking-wide
        text-slate-500
      ">
        Due Date
      </h3>


      <div className="
        inline-flex
        items-center
        gap-2
        rounded-lg
        border
        border-slate-200
        bg-white
        px-4
        py-2.5
        text-sm
        font-medium
        text-slate-700
        shadow-sm
      ">
        <span>
          📅
        </span>

        {formattedDate}
      </div>

    </div>
  );
}

export default ModalDueDate;