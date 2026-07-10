import { useEffect, useState } from "react";
import ModalHeader from "./card/ModalHeader";
import ModalLeft from "./card/ModalLeft";
import ModalRight from "./card/ModalRight";

function CardModal({ card, list, cardContext, onClose }) {
  const [title, setTitle] = useState(card.title);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
  <div
    onClick={onClose}
    className="
      fixed inset-0 
      z-[999]
      flex 
      items-center 
      justify-center 
      bg-black/60
      p-6
    "
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="
        flex
        max-h-[90vh]
        min-h-[300px]
        w-full
        max-w-[1100px]
        flex-col
        overflow-hidden
        rounded-2xl
        bg-slate-50
        shadow-2xl
        "
    >

      <ModalHeader
        card={card}
        list={list}
        title={title}
        setTitle={setTitle}
        onClose={onClose}
        cardContext={cardContext}
      />

      <div className="flex flex-1 overflow-hidden">

       <div className="
          w-[60%]
          overflow-y-auto
          p-6
        ">
          <ModalLeft
            card={card}
            cardContext={cardContext}
            title={title}
            setTitle={setTitle}
          />
        </div>


        <div className="
          w-[40%]
          border-l
          border-slate-200
          bg-white
          overflow-y-auto
          p-5
        ">
          <ModalRight
            card={card}
            cardContext={cardContext}
          />
        </div>

      </div>

    </div>
  </div>
);
}

export default CardModal;