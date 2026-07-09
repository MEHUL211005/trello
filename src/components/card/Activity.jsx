import { useState } from "react";

function Activity({ card }) {
  const [showDetails, setShowDetails] = useState(true);

  return (
    <div className="mt-8 border-t border-slate-300 pt-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Activity
        </h3>

        <button
          onClick={() => setShowDetails((prev) => !prev)}
          className="text-sm text-blue-600 hover:underline"
        >
          {showDetails ? "Hide details" : "Show details"}
        </button>
      </div>

      {!card.activity?.length ? (
        <p className="text-sm text-slate-500">
          No activity yet.
        </p>
      ) : (
        showDetails && (
          <div className="space-y-4">
            {card.activity.map((item) => (
              <div
                key={item.id}
                className="rounded-lg bg-white p-3 shadow-sm"
              >
                <p className="text-sm">
                  <span className="font-semibold">
                    {item.user}
                  </span>{" "}
                  {item.action}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

export default Activity;