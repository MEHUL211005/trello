import { useState } from "react";
import { useDispatch } from "react-redux";
import { updateCard } from "../../redux/workspaceSlice";

function DatePicker({cardContext,onClose}) {
  const [date, setDate] = useState("");
  const handleSave = () => {
  if (!date) return;

  dispatch(
    updateCard({
      ...cardContext,
      updates: {
        dueDate: date,
      },
    })
  );

  onClose();
};


const handleRemove = () => {
  dispatch(
    updateCard({
      ...cardContext,
      updates: {
        dueDate: null,
      },
    })
  );

  onClose();
};
  const dispatch = useDispatch();
  return (
    <div className="absolute left-0 top-full z-50 mt-2 w-80 rounded-lg border border-slate-200 bg-white p-4 shadow-xl">

      <h3 className="mb-4 text-center text-sm font-semibold text-slate-800">
        Due Date
      </h3>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none"
      />

      <div className="mt-4 flex gap-2">
        <button onClick={handleSave}
          className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-500"
        >
          Save
        </button>

        <button onClick={handleRemove}
          className="flex-1 rounded-md bg-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-300"
        >
          Remove
        </button>
      </div>

    </div>
  );
}

export default DatePicker;