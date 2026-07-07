import React from 'react'

const CardModal = ({card,onClose}) => {
return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >

      <div
        className="w-[850px] rounded-xl bg-white p-6"
        onClick={(e)=>e.stopPropagation()}
      >

        <div className="flex justify-between">
          <h2 className="text-xl font-semibold">
            {card.title}
          </h2>

          <button onClick={onClose}>
            ✕
          </button>
        </div>


        <div className="mt-5">
          Content will come here
        </div>


      </div>

    </div>
  );
}

export default CardModal;