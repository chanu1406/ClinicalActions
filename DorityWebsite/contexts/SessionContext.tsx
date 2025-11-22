"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

// TypeScript interfaces
export interface PatientSummary {
  id: string;
  name: string;
  mrn: string;
  dob: string;
  keyProblems: string;
  currentMeds: string;
  allergies: string[];
  preferredPharmacy: string;
  insurance: string;
}

export interface SuggestedAction {
  id: string;
  type: "medication" | "imaging" | "lab" | "referral" | "followup" | "aftercare";
  status: "pending" | "approved" | "rejected";
  title: string;
  categoryLabel: string;
  details: string;
  doseInfo?: string;
  pharmacy?: string;
  safetyFlag?: "high" | "medium" | "low" | null;
  safetyMessage?: string;
  rationale: string;
  fhirPreview: {
    resourceType: string;
    status: string;
    [key: string]: unknown;
  };
}

interface SessionState {
  currentStep: 1 | 2 | 3 | 4;
  sessionId: string | null;
  patient: PatientSummary | null;
  historySummary: string;
  transcript: string;
  suggestedActions: SuggestedAction[];
  approvedActions: SuggestedAction[];
  aftercareSummary: string;
  isLoading: {
    startSession: boolean;
    analyze: boolean;
    apply: boolean;
    aftercare: boolean;
  };
  error: string | null;
}

interface SessionContextType extends SessionState {
  setCurrentStep: (step: 1 | 2 | 3 | 4) => void;
  setTranscript: (transcript: string) => void;
  setAftercareSummary: (summary: string) => void;
  startSession: (patientId: string) => Promise<void>;
  analyzeTranscript: () => Promise<void>;
  updateActionStatus: (actionId: string, status: "pending" | "approved" | "rejected") => void;
  applyApprovedActions: () => Promise<void>;
  generateAftercare: () => Promise<void>;
  sendAftercare: (email: string) => Promise<void>;
  clearError: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const initialState: SessionState = {
  currentStep: 1,
  sessionId: null,
  patient: null,
  historySummary: "",
  transcript: "",
  suggestedActions: [],
  approvedActions: [],
  aftercareSummary: "",
  isLoading: {
    startSession: false,
    analyze: false,
    apply: false,
    aftercare: false,
  },
  error: null,
};

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>(initialState);

  const setCurrentStep = useCallback((step: 1 | 2 | 3 | 4) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  }, []);

  const setTranscript = useCallback((transcript: string) => {
    setState((prev) => ({ ...prev, transcript }));
  }, []);

  const setAftercareSummary = useCallback((summary: string) => {
    setState((prev) => ({ ...prev, aftercareSummary: summary }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const startSession = useCallback(async (patientId: string) => {
    setState((prev) => ({
      ...prev,
      isLoading: { ...prev.isLoading, startSession: true },
      error: null,
    }));

    try {
      const response = await fetch("/api/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to start session: ${response.statusText}`);
      }

      const data = await response.json();

      setState((prev) => ({
        ...prev,
        sessionId: data.sessionId,
        patient: data.patient,
        historySummary: data.historySummary || "",
        currentStep: 2,
        isLoading: { ...prev.isLoading, startSession: false },
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to start session",
        isLoading: { ...prev.isLoading, startSession: false },
      }));
    }
  }, []);

  const analyzeTranscript = useCallback(async () => {
    if (!state.sessionId) {
      setState((prev) => ({ ...prev, error: "No active session" }));
      return;
    }

    setState((prev) => ({
      ...prev,
      isLoading: { ...prev.isLoading, analyze: true },
      error: null,
    }));

    try {
      const response = await fetch("/api/session/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: state.sessionId,
          transcript: state.transcript,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to analyze transcript: ${response.statusText}`);
      }

      const data = await response.json();

      setState((prev) => ({
        ...prev,
        suggestedActions: data.suggestedActions || [],
        currentStep: 3,
        isLoading: { ...prev.isLoading, analyze: false },
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to analyze transcript",
        isLoading: { ...prev.isLoading, analyze: false },
      }));
    }
  }, [state.sessionId, state.transcript]);

  const updateActionStatus = useCallback(
    (actionId: string, status: "pending" | "approved" | "rejected") => {
      setState((prev) => {
        const updatedActions = prev.suggestedActions.map((action) =>
          action.id === actionId ? { ...action, status } : action
        );

        const approvedActions = updatedActions.filter((a) => a.status === "approved");

        return {
          ...prev,
          suggestedActions: updatedActions,
          approvedActions,
        };
      });
    },
    []
  );

  const applyApprovedActions = useCallback(async () => {
    if (!state.sessionId) {
      setState((prev) => ({ ...prev, error: "No active session" }));
      return;
    }

    if (state.approvedActions.length === 0) {
      setState((prev) => ({ ...prev, error: "No approved actions to apply" }));
      return;
    }

    setState((prev) => ({
      ...prev,
      isLoading: { ...prev.isLoading, apply: true },
      error: null,
    }));

    try {
      const response = await fetch("/api/session/apply-actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: state.sessionId,
          actions: state.approvedActions,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to apply actions: ${response.statusText}`);
      }

      const data = await response.json();

      setState((prev) => ({
        ...prev,
        approvedActions: data.appliedActions || prev.approvedActions,
        currentStep: 4,
        isLoading: { ...prev.isLoading, apply: false },
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to apply actions",
        isLoading: { ...prev.isLoading, apply: false },
      }));
    }
  }, [state.sessionId, state.approvedActions]);

  const generateAftercare = useCallback(async () => {
    if (!state.sessionId) {
      setState((prev) => ({ ...prev, error: "No active session" }));
      return;
    }

    setState((prev) => ({
      ...prev,
      isLoading: { ...prev.isLoading, aftercare: true },
      error: null,
    }));

    try {
      const response = await fetch("/api/session/aftercare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: state.sessionId,
          approvedActions: state.approvedActions,
          historySummary: state.historySummary,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate aftercare: ${response.statusText}`);
      }

      const data = await response.json();

      setState((prev) => ({
        ...prev,
        aftercareSummary: data.aftercareSummary || "",
        isLoading: { ...prev.isLoading, aftercare: false },
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to generate aftercare",
        isLoading: { ...prev.isLoading, aftercare: false },
      }));
    }
  }, [state.sessionId, state.approvedActions, state.historySummary]);

  const sendAftercare = useCallback(
    async (email: string) => {
      if (!state.sessionId) {
        setState((prev) => ({ ...prev, error: "No active session" }));
        return;
      }

      setState((prev) => ({
        ...prev,
        isLoading: { ...prev.isLoading, aftercare: true },
        error: null,
      }));

      try {
        const response = await fetch("/api/session/send-aftercare", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: state.sessionId,
            email,
            summary: state.aftercareSummary,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to send aftercare email: ${response.statusText}`);
        }

        setState((prev) => ({
          ...prev,
          isLoading: { ...prev.isLoading, aftercare: false },
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "Failed to send aftercare email",
          isLoading: { ...prev.isLoading, aftercare: false },
        }));
      }
    },
    [state.sessionId, state.aftercareSummary]
  );

  const value: SessionContextType = {
    ...state,
    setCurrentStep,
    setTranscript,
    setAftercareSummary,
    startSession,
    analyzeTranscript,
    updateActionStatus,
    applyApprovedActions,
    generateAftercare,
    sendAftercare,
    clearError,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
