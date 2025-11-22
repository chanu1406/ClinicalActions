"use client";

import { Pill, Stethoscope, Image, FlaskConical, UserPlus, Calendar, FileText, AlertTriangle, CheckCircle2, Check, X } from "lucide-react";
import { useSession, type SuggestedAction } from "@/contexts/SessionContext";

interface ActionCardProps {
  action: SuggestedAction;
}

const TYPE_ICONS = {
  medication: Pill,
  imaging: Image,
  lab: FlaskConical,
  referral: UserPlus,
  followup: Calendar,
  aftercare: FileText,
};

const TYPE_COLORS = {
  medication: "bg-blue-100 text-blue-600",
  imaging: "bg-purple-100 text-purple-600",
  lab: "bg-green-100 text-green-600",
  referral: "bg-orange-100 text-orange-600",
  followup: "bg-cyan-100 text-cyan-600",
  aftercare: "bg-pink-100 text-pink-600",
};

const SAFETY_COLORS = {
  high: "bg-red-100 text-red-700 border-red-200/50",
  medium: "bg-amber-100 text-amber-700 border-amber-200/50",
  low: "bg-emerald-100 text-emerald-700 border-emerald-200/50",
};

export default function ActionCard({ action }: ActionCardProps) {
  const { updateActionStatus } = useSession();

  const handleApprove = () => {
    updateActionStatus(action.id, "approved");
  };

  const handleReject = () => {
    updateActionStatus(action.id, "rejected");
  };

  const Icon = TYPE_ICONS[action.type] || FileText;
  const isApproved = action.status === "approved";
  const isRejected = action.status === "rejected";

  if (isRejected) {
    return (
      <div className="bg-zinc-50 border border-zinc-200/70 rounded-2xl shadow-sm opacity-60">
        <div className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-zinc-200 text-zinc-400">
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-zinc-500 line-through truncate">
                {action.title}
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-zinc-200 text-zinc-600 text-xs font-semibold rounded-full">
                <X className="w-3 h-3" />
                Rejected
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group bg-white border border-zinc-200/70 rounded-2xl shadow-sm transition-all hover:shadow-md ${
        isApproved ? "bg-gradient-to-r from-emerald-50/30 to-white border-emerald-300" : "hover:-translate-y-0.5"
      }`}
    >
      <div className="p-4 flex items-start gap-4">
        {/* Left: Icon */}
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
            isApproved ? "bg-emerald-100 text-emerald-600" : TYPE_COLORS[action.type]
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>

        {/* Middle: Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold text-zinc-900">
                  {action.title}
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200/50 capitalize">
                  {action.type}
                </span>
                {isApproved && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200/50">
                    <Check className="w-3 h-3" />
                    Approved
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-600">
                {action.details}
              </p>
              {action.doseInfo && (
                <p className="text-xs text-zinc-500 mt-1">
                  <span className="font-semibold">Dose:</span> {action.doseInfo}
                </p>
              )}
              {action.pharmacy && (
                <p className="text-xs text-zinc-500 mt-1">
                  <span className="font-semibold">Pharmacy:</span> {action.pharmacy}
                </p>
              )}
            </div>
          </div>

          {/* Rationale */}
          {action.rationale && (
            <div className="text-xs text-zinc-500 italic mt-2 pl-3 border-l-2 border-zinc-200">
              "{action.rationale}"
            </div>
          )}

          {/* Safety Flag */}
          {action.safetyFlag && action.safetyMessage && (
            <div className={`mt-3 px-3 py-2 rounded-lg text-xs flex items-start gap-2 ${SAFETY_COLORS[action.safetyFlag]}`}>
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span className="font-medium">{action.safetyMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-4">
            {!isApproved && (
              <>
                <button
                  onClick={handleReject}
                  className="px-3 py-1.5 text-xs font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100/80 rounded-lg transition-all border border-zinc-200/70"
                >
                  Reject
                </button>
                <button
                  onClick={handleApprove}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#7C2D3E] hover:bg-[#5A1F2D] rounded-full shadow-sm transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Approve & Sign
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

