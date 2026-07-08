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
      <h3 className="mb-2 text-sm font-semibold text-slate-700">
        Due Date
      </h3>

      <div className="inline-flex items-center rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700">
        📅 {formattedDate}
      </div>
    </div>
  );
}

export default ModalDueDate;