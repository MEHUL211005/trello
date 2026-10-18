import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Clock,
  LogOut,
  Mail,
  RefreshCw,
  Send,
  Share2,
  UserPlus,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import RoleBadge from "./RoleBadge";
import { Avatar, ConfirmPopover } from "./card/ui";
import {
  getBoardSharing,
  inviteToBoard,
  updateBoardMemberRole,
  removeBoardMember,
  revokeBoardInvitation,
} from "../api/boardApi";
import { EMAIL_REGEX, getErrorMessage } from "../lib/validation";
import { timeAgo } from "../lib/time";

const ROLE_OPTIONS = [
  { value: "EDITOR", label: "Editor", hint: "Can add, edit, move and delete lists and cards" },
  { value: "VIEWER", label: "Viewer", hint: "Can view the board but not change anything" },
];

const RoleSelect = ({ value, onChange, disabled, label }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    disabled={disabled}
    aria-label={label}
    className="cursor-pointer rounded-lg border border-slate-200 bg-white py-1.5 pl-2.5 pr-7 text-sm font-semibold text-slate-700 outline-none transition hover:border-brand-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:opacity-60"
  >
    {ROLE_OPTIONS.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

function ShareBoardModal({ board, onClose }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("EDITOR");
  const [emailError, setEmailError] = useState("");
  const [confirmId, setConfirmId] = useState(null);
  const errorTimer = useRef(null);

  // Esc closes, and the page behind does not scroll
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      clearTimeout(errorTimer.current);
    };
  }, [onClose]);

  const sharingKey = ["boardSharing", String(board.id)];

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: sharingKey,
    queryFn: () => getBoardSharing(board.id),
  });

  const members = data?.members || [];
  const invitations = data?.invitations || [];
  const canManage = !!data?.canManage;

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: sharingKey });
    queryClient.invalidateQueries({ queryKey: ["board", String(board.id)] });
  };

  const showEmailError = (message) => {
    clearTimeout(errorTimer.current);
    setEmailError(message);
    errorTimer.current = setTimeout(() => setEmailError(""), 4000);
  };

  const inviteMutation = useMutation({
    mutationFn: () => inviteToBoard(board.id, { email: email.trim(), role }),
    onSuccess: (response) => {
      toast.success(response.message);
      setEmail("");
      refresh();
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, "Could not share the board"));
    },
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, nextRole }) =>
      updateBoardMemberRole(board.id, userId, nextRole),
    onSuccess: (response) => {
      toast.success(response.message);
      refresh();
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, "Could not change the role"));
      refresh();
    },
  });

  const removeMutation = useMutation({
    mutationFn: (userId) => removeBoardMember(board.id, userId),
    onSuccess: (response, userId) => {
      toast.success(response.message);
      setConfirmId(null);

      if (userId === user.id) {
        // Leaving: the board is no longer ours to look at
        queryClient.removeQueries({ queryKey: ["board", String(board.id)] });
        queryClient.invalidateQueries({ queryKey: ["sharedBoards"] });
        onClose();
        navigate("/dashboard", { replace: true });
        return;
      }

      refresh();
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, "Could not remove the person"));
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (invitationId) => revokeBoardInvitation(board.id, invitationId),
    onSuccess: (response) => {
      toast.success(response.message);
      setConfirmId(null);
      refresh();
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, "Could not revoke the invitation"));
    },
  });

  const handleInvite = (e) => {
    e.preventDefault();

    const value = email.trim().toLowerCase();

    if (!value) {
      showEmailError("Enter the email address of the person to invite");
      return;
    }

    if (!EMAIL_REGEX.test(value)) {
      showEmailError("Enter a valid email address (e.g. name@example.com)");
      return;
    }

    if (value === user.email.toLowerCase()) {
      showEmailError("You already own this board");
      return;
    }

    if (members.some((member) => member.email.toLowerCase() === value)) {
      showEmailError("That person is already on this board");
      return;
    }

    if (invitations.some((invitation) => invitation.email.toLowerCase() === value)) {
      showEmailError("An invitation has already been sent to that email");
      return;
    }

    setEmailError("");
    inviteMutation.mutate();
  };

  const roleHint = ROLE_OPTIONS.find((option) => option.value === role)?.hint;
  const onlyOwner = members.length <= 1 && invitations.length === 0;

  return createPortal(
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      className="fixed inset-0 z-[1000] flex items-start justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:items-center sm:p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Share board"
        className="animate-fade-up flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-white text-slate-800 shadow-2xl shadow-black/40"
      >
        {/* Header */}
        <div className="bg-brand-gradient relative shrink-0 px-6 py-5 text-white">
          <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/10" />
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 rounded-lg p-1.5 text-white/80 transition hover:bg-white/15 hover:text-white"
          >
            <X size={20} />
          </button>

          <div className="relative flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/30">
              <Share2 size={20} />
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-extrabold leading-tight">
                Share board
              </h2>
              <p className="truncate text-sm text-white/80">{board.name}</p>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* Invite form (owner only) */}
          {canManage && (
            <form onSubmit={handleInvite} noValidate className="border-b border-slate-100 px-6 py-5">
              <label
                htmlFor="share-email"
                className="mb-1.5 block text-sm font-semibold text-slate-700"
              >
                Invite by email
              </label>

              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Mail
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="share-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="teammate@company.com"
                    autoComplete="off"
                    aria-invalid={!!emailError || undefined}
                    className={`w-full rounded-xl border bg-slate-50/60 py-2.5 pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 ${
                      emailError
                        ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                        : "border-slate-200 focus:border-brand-500 focus:ring-brand-100"
                    }`}
                  />
                </div>

                <RoleSelect
                  value={role}
                  onChange={setRole}
                  label="Role for the invited person"
                />

                <button
                  type="submit"
                  disabled={inviteMutation.isPending}
                  className="bg-brand-gradient flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-600/25 transition hover:brightness-110 disabled:opacity-70"
                >
                  {inviteMutation.isPending ? (
                    <RefreshCw size={15} className="animate-spin" />
                  ) : (
                    <Send size={15} />
                  )}
                  {inviteMutation.isPending ? "Sending" : "Invite"}
                </button>
              </div>

              {emailError ? (
                <p role="alert" className="mt-1.5 text-sm text-red-500">
                  {emailError}
                </p>
              ) : (
                <p className="mt-1.5 text-xs text-slate-400">{roleHint}</p>
              )}
            </form>
          )}

          {/* Body */}
          <div className="px-6 py-5">
            {isLoading && (
              <div className="space-y-3">
                {[0, 1, 2].map((n) => (
                  <div key={n} className="flex items-center gap-3">
                    <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200" />
                      <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {isError && (
              <div className="rounded-2xl bg-rose-50 p-5 text-center">
                <p className="text-sm font-semibold text-rose-700">
                  {getErrorMessage(error, "Could not load who has access")}
                </p>
                <button
                  onClick={() => refetch()}
                  className="mt-3 rounded-lg bg-white px-4 py-1.5 text-sm font-semibold text-rose-600 shadow-sm ring-1 ring-rose-200 hover:bg-rose-50"
                >
                  Try again
                </button>
              </div>
            )}

            {!isLoading && !isError && (
              <>
                <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-slate-400">
                  People with access
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
                    {members.length}
                  </span>
                </h3>

                <ul className="space-y-1">
                  {members.map((member) => {
                    const isMe = member.userId === user.id;
                    const isPending =
                      (roleMutation.isPending &&
                        roleMutation.variables?.userId === member.userId) ||
                      (removeMutation.isPending &&
                        removeMutation.variables === member.userId);

                    return (
                      <li
                        key={member.userId}
                        className="relative flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-slate-50"
                      >
                        <Avatar id={member.userId} name={member.name} size={40} />

                        <div className="min-w-0 flex-1">
                          <p className="flex items-center gap-1.5 truncate text-sm font-bold text-slate-900">
                            {member.name}
                            {isMe && (
                              <span className="rounded-full bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold text-brand-600">
                                You
                              </span>
                            )}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {member.email}
                          </p>
                        </div>

                        {member.isOwner ? (
                          <RoleBadge role="OWNER" />
                        ) : canManage ? (
                          <div className="flex items-center gap-1.5">
                            <RoleSelect
                              value={member.role}
                              disabled={isPending}
                              label={`Role for ${member.name}`}
                              onChange={(nextRole) =>
                                roleMutation.mutate({
                                  userId: member.userId,
                                  nextRole,
                                })
                              }
                            />
                            <button
                              onClick={() =>
                                setConfirmId(
                                  confirmId === `m${member.userId}`
                                    ? null
                                    : `m${member.userId}`,
                                )
                              }
                              aria-label={`Remove ${member.name}`}
                              disabled={isPending}
                              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                            >
                              <X size={17} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <RoleBadge role={member.role} />
                            {isMe && (
                              <button
                                onClick={() =>
                                  setConfirmId(
                                    confirmId === `m${member.userId}`
                                      ? null
                                      : `m${member.userId}`,
                                  )
                                }
                                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                              >
                                <LogOut size={13} />
                                Leave
                              </button>
                            )}
                          </div>
                        )}

                        {confirmId === `m${member.userId}` && (
                          <ConfirmPopover
                            title={isMe ? "Leave this board?" : `Remove ${member.name}?`}
                            message={
                              isMe
                                ? "You'll lose access until the owner shares it with you again."
                                : "They'll lose access to this board straight away."
                            }
                            confirmLabel={isMe ? "Leave" : "Remove"}
                            onConfirm={() => removeMutation.mutate(member.userId)}
                            onClose={() => setConfirmId(null)}
                            className="right-2 top-full mt-1"
                          />
                        )}
                      </li>
                    );
                  })}
                </ul>

                {/* Pending invitations */}
                {invitations.length > 0 && (
                  <div className="mt-6">
                    <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-slate-400">
                      Pending invitations
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] text-amber-700">
                        {invitations.length}
                      </span>
                    </h3>

                    <ul className="space-y-1">
                      {invitations.map((invitation) => (
                        <li
                          key={invitation.id}
                          className="relative flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-slate-50"
                        >
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600 ring-1 ring-amber-200">
                            <Clock size={18} />
                          </span>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-slate-900">
                              {invitation.email}
                            </p>
                            <p className="text-xs text-slate-500">
                              Invited {timeAgo(invitation.createdAt)}
                              {invitation.invitedBy ? ` by ${invitation.invitedBy}` : ""}
                              {" · waiting for them to sign up"}
                            </p>
                          </div>

                          <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
                            Pending
                          </span>
                          <RoleBadge role={invitation.role} />

                          <button
                            onClick={() =>
                              setConfirmId(
                                confirmId === `i${invitation.id}`
                                  ? null
                                  : `i${invitation.id}`,
                              )
                            }
                            aria-label={`Revoke invitation for ${invitation.email}`}
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                          >
                            <X size={17} />
                          </button>

                          {confirmId === `i${invitation.id}` && (
                            <ConfirmPopover
                              title="Revoke invitation?"
                              message="They won't get access when they sign up."
                              confirmLabel="Revoke"
                              onConfirm={() => revokeMutation.mutate(invitation.id)}
                              onClose={() => setConfirmId(null)}
                              className="right-2 top-full mt-1"
                            />
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Empty state */}
                {onlyOwner && (
                  <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-5 py-7 text-center">
                    <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                      <UserPlus size={22} />
                    </span>
                    <p className="text-sm font-bold text-slate-800">
                      {canManage
                        ? "This board is private to you"
                        : "No one else is on this board"}
                    </p>
                    {canManage && (
                      <p className="mt-1 text-sm text-slate-500">
                        Invite teammates by email to plan and track work together.
                      </p>
                    )}
                  </div>
                )}

                {!canManage && (
                  <p className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
                    Only the board owner can invite people or change roles.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default ShareBoardModal;
