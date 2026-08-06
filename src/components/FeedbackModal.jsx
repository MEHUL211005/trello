import { useState } from "react";
import { X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { sendFeedback } from "../api/feedbackApi";

const FeedbackModal = ({ onClose }) => {
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: sendFeedback,

    onSuccess: () => {
      setSuccess(true);

      setTimeout(() => {
        onClose();
      }, 1800);
    },

    onError: (err) => {
      setError(
        err.response?.data?.message || "Failed to send feedback"
      );
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    setError("");

    if (!message.trim()) {
      setError("Please write your feedback");
      return;
    }

    mutation.mutate({
      message: message.trim(),
    });
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-800">
            Share your thoughts on Trello experience
          </h2>

          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <span className="text-2xl text-green-600">✓</span>
            </div>

            <h3 className="text-lg font-semibold text-slate-800">
              Your feedback has been sent
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Thank you for helping improve the Trello experience.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-5 py-4">
            <p className="text-sm font-medium text-slate-700">
              What's on your mind?
            </p>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what you like, what could be improved, or any idea you'd love to see in Trello..."
              className="mt-3 h-40 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />

            {error && (
              <p className="mt-2 text-sm text-red-500">{error}</p>
            )}

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={mutation.isPending}
                className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
              >
                {mutation.isPending ? "Sending..." : "Send Feedback"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;