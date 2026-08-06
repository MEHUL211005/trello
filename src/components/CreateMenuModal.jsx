import { X } from "lucide-react";

const CreateMenuModal = ({ onClose, onCreateBoard }) => {
  return (
    <div
      className="absolute top-full mt-2 right-0 w-72 rounded-xl bg-white border border-slate-200 shadow-xl z-[9999]"
    >

      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h2 className="font-semibold text-slate-800">
          Create
        </h2>

        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-800"
        >
          <X size={18}/>
        </button>
      </div>


      <button
        onClick={onCreateBoard}
        className="w-full text-left px-4 py-3 hover:bg-slate-100"
      >

        <p className="font-medium text-slate-800">
          Create Board
        </p>

        <p className="text-sm text-slate-500">
          Create a new board
        </p>

      </button>


    </div>
  );
};


export default CreateMenuModal;