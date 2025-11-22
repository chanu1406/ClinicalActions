"use client";

import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";

// Mock patient data for search - TODO: Replace with Medplum Patient search
const MOCK_PATIENTS = [
  {
    id: "patient-001",
    name: "John Smith",
    mrn: "MRN-10234",
    dob: "1965-03-15",
    keyInfo: "T2DM, HTN",
    email: "john.smith@email.com",
  },
  {
    id: "patient-002",
    name: "Sarah Johnson",
    mrn: "MRN-10567",
    dob: "1978-07-22",
    keyInfo: "Asthma, GERD",
    email: "sarah.j@email.com",
  },
  {
    id: "patient-003",
    name: "Michael Chen",
    mrn: "MRN-10891",
    dob: "1952-11-08",
    keyInfo: "CHF, CKD Stage 3",
    email: "m.chen@email.com",
  },
  {
    id: "patient-004",
    name: "Emily Rodriguez",
    mrn: "MRN-11024",
    dob: "1990-02-14",
    keyInfo: "Hypothyroidism, migraines",
    email: "emily.r90@email.com",
  },
];

export default function PatientSearchPanel() {
  const { patient, startSession, isLoading, error, clearError } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof MOCK_PATIENTS>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      const query = searchQuery.toLowerCase();
      const results = MOCK_PATIENTS.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.mrn.toLowerCase().includes(query) ||
          p.id.toLowerCase().includes(query)
      );

      setSearchResults(results);
      setIsSearching(false);
      setHasSearched(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectPatient = async (patientId: string) => {
    clearError();
    await startSession(patientId);
  };

  return (
    <div className="bg-white border border-zinc-200/70 rounded-2xl shadow-sm p-6 flex flex-col min-h-[500px]">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-zinc-900 mb-1">Patient Search</h2>
        <p className="text-xs text-zinc-600">Find and select a patient from the EMR</p>
      </div>

      {/* Search Input */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search for a patient…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-zinc-200/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C2D3E]/20 focus:border-[#7C2D3E]/30 transition-all placeholder:text-zinc-400"
          />
          {isSearching && (
            <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 animate-spin" />
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {!hasSearched && (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <Search className="w-12 h-12 mx-auto mb-3 text-zinc-300" />
              <p className="text-sm font-medium text-zinc-500">Start typing to search</p>
              <p className="text-xs text-zinc-400 mt-1">
                Search by name, MRN, or patient ID
              </p>
            </div>
          </div>
        )}

        {hasSearched && searchResults.length === 0 && (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <Search className="w-12 h-12 mx-auto mb-3 text-zinc-300" />
              <p className="text-sm font-medium text-zinc-500">No patients found</p>
              <p className="text-xs text-zinc-400 mt-1">
                Try a different search term
              </p>
            </div>
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="space-y-2">
            {searchResults.map((p) => {
              const isSelected = patient?.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectPatient(p.id)}
                  disabled={isLoading.startSession}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    isSelected
                      ? "bg-[#F9F3EE] border-[#7C2D3E] shadow-sm"
                      : "bg-white border-zinc-200/70 hover:bg-[#F9F3EE]/50 hover:border-zinc-300"
                  }`}
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <h3 className="font-semibold text-sm text-zinc-900">
                      {p.name}
                    </h3>
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-[#7C2D3E] flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-600">
                    <span className="font-mono">{p.mrn}</span>
                    <span>•</span>
                    <span>DOB: {p.dob}</span>
                  </div>
                  {p.keyInfo && (
                    <p className="text-xs text-zinc-500 mt-1.5 truncate">
                      {p.keyInfo}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading.startSession && (
        <div className="mt-4 bg-blue-50/50 border border-blue-200/50 rounded-xl p-3 flex items-center gap-2.5">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <p className="text-sm text-blue-900">Starting session...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200/50 rounded-xl p-3 text-sm text-red-900">
          {error}
        </div>
      )}

      {/* Selected Patient Info */}
      {patient && (
        <div className="mt-4 pt-4 border-t border-zinc-200/70">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-500">Selected Patient</p>
              <p className="text-sm font-semibold text-zinc-900 mt-0.5">
                {patient.name}
              </p>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
          </div>
        </div>
      )}
    </div>
  );
}
