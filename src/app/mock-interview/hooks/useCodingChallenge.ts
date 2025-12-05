"use client";

import { useState, useCallback } from "react";
import { CodingChallenge, CodingState, EvaluationResult, CodeOutput } from "../lib/codingTypes";

const initialState: CodingState = {
  isActive: false,
  challenge: null,
  userCode: "",
  isSubmitting: false,
  isRunning: false,
  attempts: 0,
  feedback: null,
  output: null,
};

export function useCodingChallenge() {
  const [codingState, setCodingState] = useState<CodingState>(initialState);

  const startChallenge = useCallback((challenge: CodingChallenge) => {
    setCodingState({
      isActive: true,
      challenge,
      userCode: "",
      isSubmitting: false,
      isRunning: false,
      attempts: 0,
      feedback: null,
      output: null,
    });
  }, []);

  const submitCode = useCallback(
    async (code: string): Promise<EvaluationResult> => {
      if (!codingState.challenge) {
        throw new Error("No active challenge");
      }

      setCodingState((prev) => ({ ...prev, isSubmitting: true, feedback: null }));

      try {
        const response = await fetch("/api/evaluate-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, challenge: codingState.challenge }),
        });

        if (!response.ok) {
          throw new Error("Evaluation failed");
        }

        const result: EvaluationResult = await response.json();

        setCodingState((prev) => ({
          ...prev,
          isSubmitting: false,
          attempts: prev.attempts + 1,
          feedback: result,
          userCode: code,
        }));

        return result;
      } catch (error) {
        setCodingState((prev) => ({ ...prev, isSubmitting: false }));
        throw error;
      }
    },
    [codingState.challenge]
  );

  const endChallenge = useCallback(() => {
    setCodingState(initialState);
  }, []);

  const clearFeedback = useCallback(() => {
    setCodingState((prev) => ({ ...prev, feedback: null }));
  }, []);

  const setOutput = useCallback((output: CodeOutput | null) => {
    setCodingState((prev) => ({ ...prev, output }));
  }, []);

  const setIsRunning = useCallback((isRunning: boolean) => {
    setCodingState((prev) => ({ ...prev, isRunning }));
  }, []);

  return {
    codingState,
    startChallenge,
    submitCode,
    endChallenge,
    clearFeedback,
    setOutput,
    setIsRunning,
  };
}
