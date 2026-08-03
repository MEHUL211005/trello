// import { useState } from "react";
// import { useQueryClient } from "@tanstack/react-query";
// import { updateDueDate } from "../../api/cardApi";

// function ModalDueDate({ dueDate, card, cardContext }) {
//   const queryClient = useQueryClient();

//   const [selectedDate, setSelectedDate] = useState(
//     dueDate
//       ? new Date(dueDate).toISOString().split("T")[0]
//       : ""
//   );

//   const handleChange = async (value) => {
//     setSelectedDate(value);

//     try {
//       await updateDueDate(card.id, value);

//       queryClient.invalidateQueries({
//         queryKey: ["board", cardContext.boardId],
//       });

//     } catch (error) {
//       console.error("Update due date error:", error);
//     }
//   };

//   return (
//     <div className="mb-6">

//       <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
//         Due Date
//       </h3>

//       <div className="flex items-center gap-3">

//         <input
//           type="date"
//           value={selectedDate}
//           onChange={(e) => handleChange(e.target.value)}
//           className="
//             rounded-lg
//             border
//             border-slate-300
//             bg-white
//             px-3
//             py-2
//             text-sm
//             text-slate-700
//             outline-none
//             focus:border-blue-500
//           "
//         />

//         {selectedDate && (
//           <div className="
//             inline-flex
//             items-center
//             gap-2
//             rounded-lg
//             border
//             border-slate-200
//             bg-white
//             px-4
//             py-2.5
//             text-sm
//             font-medium
//             text-slate-700
//             shadow-sm
//           ">
//             <span>📅</span>
//             {new Date(selectedDate).toLocaleDateString("en-US", {
//               day: "numeric",
//               month: "short",
//               year: "numeric",
//             })}
//           </div>
//         )}

//       </div>

//     </div>
//   );
// }

// export default ModalDueDate;