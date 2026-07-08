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
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-[92vh] w-full max-w-[1100px] flex-col overflow-hidden rounded-xl bg-[#F1F2F4] shadow-2xl"
      >
        <ModalHeader
          card={card}
          list={list}
          title={title}
          setTitle={setTitle}
          onClose={onClose}
        />

        <div className="flex flex-1 overflow-hidden">
          <ModalLeft
            card={card}
            cardContext={cardContext}
            title={title}
            setTitle={setTitle}
          />

          <ModalRight card={card} />
        </div>
      </div>
    </div>
  );
}

export default CardModal;