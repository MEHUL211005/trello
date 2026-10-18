import { MetaLabel } from "./ui";

function ModalLabels({ labels }) {
  if (!labels || labels.length === 0) {
    return null;
  }

  return (
    <div>
      <MetaLabel>Labels</MetaLabel>

      <div className="flex flex-wrap gap-2">
        {labels.map((label) => (
          <span
            key={label.id}
            className="inline-flex min-h-8 min-w-12 items-center rounded-lg px-3 text-sm font-bold text-white shadow-sm [text-shadow:0_1px_1px_rgba(0,0,0,0.25)]"
            style={{ backgroundColor: label.color }}
          >
            {label.name || <span className="h-2 w-6" />}
          </span>
        ))}
      </div>
    </div>
  );
}

export default ModalLabels;
