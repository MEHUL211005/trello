function ModalLabels({ labels }) {
  if (!labels || labels.length === 0) {
    return null;
  }

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
        Labels
      </h3>


      <div className="flex flex-wrap gap-2">

        {labels.map((label) => (

          <div
            key={label.id}
            className="
              rounded-md
              px-4
              py-1.5
              text-sm
              font-semibold
              text- bg-slate-600
              shadow-sm
            "
            style={{
              backgroundColor: label.color,
            }}
          >
            {label.name}
          </div>

        ))}

      </div>

    </div>
  );
}

export default ModalLabels;