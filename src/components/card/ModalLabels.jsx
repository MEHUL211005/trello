function ModalLabels({ labels }) {
  if (!labels || labels.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="mb-2 text-sm font-semibold text-slate-700">
        Labels
      </h3>

      <div className="flex flex-wrap gap-2">
        {labels.map((label) => (
          <div
            key={label.id}
            className="rounded-md px-4 py-1 text-sm font-medium text-white"
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