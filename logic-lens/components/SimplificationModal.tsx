"use client";
import React, { useEffect } from "react";
import { FiX, FiArrowRight, FiZap } from "react-icons/fi";
import type { SimplificationSteps } from "@/utils/BooleanSimplifier";

// A monospace chip for a binary pattern (e.g. "1-0"). Dashes are dimmed.
function PatternChip({
  pattern,
  tone = "slate",
}: {
  pattern: string;
  tone?: "slate" | "purple" | "blue";
}) {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    purple: "bg-purple-50 text-purple-700",
    blue: "bg-blue-50 text-blue-700",
  } as const;
  return (
    <span
      className={`inline-flex font-mono text-sm font-bold px-2 py-0.5 rounded ${tones[tone]}`}
    >
      {pattern.split("").map((c, i) => (
        <span key={i} className={c === "-" ? "text-slate-300" : ""}>
          {c}
        </span>
      ))}
    </span>
  );
}

function StepHeader({ index, title }: { index: number; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-7 h-7 shrink-0 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-black">
        {index}
      </div>
      <h3 className="text-sm font-black uppercase tracking-wider text-slate-700">
        {title}
      </h3>
    </div>
  );
}

export default function SimplificationModal({
  steps,
  onClose,
}: {
  steps: SimplificationSteps;
  onClose: () => void;
}) {
  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  let stepNum = 0;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3 text-purple-600">
            <FiZap className="text-xl" />
            <div>
              <h2 className="text-base font-black tracking-tight text-slate-900">
                How it was computed
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Quine-McCluskey Reduction
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Close"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* BODY */}
        <div className="overflow-y-auto px-6 py-6 space-y-8">
          {steps.trivial ? (
            <div className="text-center py-6">
              <div className="text-5xl font-black text-slate-900 mb-3">
                Q = {steps.trivial.value}
              </div>
              <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                {steps.trivial.reason}
              </p>
            </div>
          ) : (
            <>
              {/* STEP: Minterms */}
              <section>
                <StepHeader index={++stepNum} title="Identify Minterms" />
                <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                  Every row of the truth table whose output is{" "}
                  <strong>1</strong> becomes a minterm, written in binary.
                </p>
                <div className="flex flex-wrap gap-2">
                  {steps.minterms.map((m) => (
                    <div
                      key={m.decimal}
                      className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-lg px-2 py-1"
                    >
                      <span className="text-[10px] font-bold text-slate-400">
                        m{m.decimal}
                      </span>
                      <PatternChip pattern={m.binary} />
                      <span className="text-[10px] font-bold text-blue-600">
                        {m.term}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* STEP: Combining rounds */}
              <section>
                <StepHeader index={++stepNum} title="Combine & Reduce" />
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  Terms that differ by exactly one bit are merged, replacing the
                  differing bit with a dash (<span className="font-mono">-</span>
                  ). This repeats until nothing else can combine.
                </p>
                <div className="space-y-4">
                  {steps.rounds.map((round) => (
                    <div
                      key={round.index}
                      className="bg-slate-50 rounded-xl p-4 border border-slate-100"
                    >
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                        Pass {round.index + 1}
                      </div>
                      {round.merges.length > 0 ? (
                        <div className="space-y-1.5">
                          {round.merges.map((mg, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2 flex-wrap"
                            >
                              <PatternChip pattern={mg.left} />
                              <span className="text-slate-300 font-bold">+</span>
                              <PatternChip pattern={mg.right} />
                              <FiArrowRight className="text-slate-300" />
                              <PatternChip pattern={mg.combined} tone="purple" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">
                          Nothing left to combine.
                        </p>
                      )}
                      {round.carriedPrime.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                            Can&apos;t combine →
                          </span>
                          {round.carriedPrime.map((p) => (
                            <PatternChip key={p} pattern={p} tone="blue" />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* STEP: Prime implicants */}
              <section>
                <StepHeader index={++stepNum} title="Prime Implicants" />
                <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                  The patterns that survived form the prime implicants — the
                  candidate terms for the final equation.
                </p>
                <div className="flex flex-wrap gap-2">
                  {steps.primeImplicants.map((pi) => (
                    <div
                      key={pi.binary}
                      className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1.5"
                    >
                      <PatternChip pattern={pi.binary} tone="blue" />
                      <span className="text-sm font-black text-blue-700">
                        {pi.term}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* STEP: Essential prime implicants */}
              {steps.essential.length > 0 && (
                <section>
                  <StepHeader
                    index={++stepNum}
                    title="Essential Prime Implicants"
                  />
                  <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                    A prime implicant is <strong>essential</strong> when it is the
                    only one covering some minterm — so it must be in the answer.
                  </p>
                  <div className="space-y-2">
                    {steps.essential.map((e) => (
                      <div
                        key={e.pi.binary}
                        className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2"
                      >
                        <span className="text-sm font-black text-emerald-700">
                          {e.pi.term}
                        </span>
                        <span className="text-[11px] text-emerald-600">
                          uniquely covers
                        </span>
                        <PatternChip pattern={e.forcedBy} />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* RESULT */}
              <section className="bg-slate-900 rounded-2xl p-6 text-center">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  Simplified Result
                </div>
                <div className="text-3xl font-black text-white tracking-tight">
                  Q = {steps.finalEquation}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
