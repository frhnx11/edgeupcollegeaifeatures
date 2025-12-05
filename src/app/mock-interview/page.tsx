"use client";

import { Suspense, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import CharacterModel from "./components/CharacterModel";
import SpeechBubble from "./components/SpeechBubble";
import CodingPanel from "./components/CodingPanel";
import LanguageButtons from "./components/LanguageButtons";
import { useCodingChallenge } from "./hooks/useCodingChallenge";
import { CodingChallenge, SupportedLanguage, CodeOutput } from "./lib/codingTypes";
import { LANGUAGE_CONFIG } from "./lib/languageConfig";

// Scene configuration
const CAMERA_POSITION: [number, number, number] = [0.3, 0, 3.2];
const CAMERA_FOV = 50;
const MODEL_POSITION: [number, number, number] = [-2, -2, 0];
const MODEL_ROTATION: [number, number, number] = [0.11, 0.8, 0];
const MODEL_SCALE = 1.5;
const BUBBLE_X = 1050;
const BUBBLE_Y = 5;

// Conversation state types
type State = "idle" | "loading" | "speaking" | "listening" | "processing" | "coding";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// API response structure with tool calling
interface ChatAPIResponse {
  content: string;
  tool_call: {
    name: string;
    challenge?: CodingChallenge;
  } | null;
}

export default function MockInterviewPage() {
  // Core state
  const [state, setState] = useState<State>("idle");
  const [bubbleText, setBubbleText] = useState("");
  const [showBubble, setShowBubble] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [textInput, setTextInput] = useState("");
  const [isRequestingHint, setIsRequestingHint] = useState(false);
  const [showLanguageButtons, setShowLanguageButtons] = useState(false);

  // Refs to track current state in callbacks
  const messagesRef = useRef<Message[]>([]);
  const pendingChallengeRef = useRef<CodingChallenge | null>(null);
  const pendingLanguagePromptRef = useRef(false);
  const audioEndHandledRef = useRef(false);

  // Coding challenge hook
  const { codingState, startChallenge, endChallenge, setOutput, setIsRunning } = useCodingChallenge();

  // Fetch AI response from OpenAI
  const fetchAIResponse = useCallback(async (chatMessages: Message[], disableTools = false): Promise<ChatAPIResponse> => {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: chatMessages, disableTools }),
    });

    if (!response.ok) throw new Error("Failed to get AI response");

    return await response.json();
  }, []);

  // Handle user input (from text)
  // disableTools: prevents AI from calling tools (e.g., after completing a challenge)
  const handleUserInput = useCallback(async (input: string, disableTools = false) => {
    if (!input.trim()) {
      setState("listening");
      return;
    }

    setState("processing");

    // Add user message
    const userMessage: Message = { role: "user", content: input };
    const updatedMessages = [...messagesRef.current, userMessage];
    messagesRef.current = updatedMessages;
    setMessages(updatedMessages);

    try {
      // Get AI response (disable tools if specified to prevent immediate new challenge)
      const response = await fetchAIResponse(updatedMessages, disableTools);

      console.log("=== FRONTEND: API Response ===");
      console.log("Content:", response.content);
      console.log("Tool call:", response.tool_call);

      // Add AI message (store only the spoken content)
      const aiMessage: Message = { role: "assistant", content: response.content };
      const finalMessages = [...updatedMessages, aiMessage];
      messagesRef.current = finalMessages;
      setMessages(finalMessages);

      // Check if AI called the coding challenge tool
      if (response.tool_call && response.tool_call.name === "show_coding_challenge" && response.tool_call.challenge) {
        console.log("=== FRONTEND: Storing pending challenge ===");
        console.log("Challenge:", response.tool_call.challenge);
        pendingChallengeRef.current = response.tool_call.challenge;
      }

      // Speak the response
      audioEndHandledRef.current = false; // Reset for new audio
      setBubbleText(response.content);
      setState("speaking");
    } catch (error) {
      console.error("Error getting AI response:", error);
      setState("listening");
    }
  }, [fetchAIResponse]);

  // Handle text input submit
  const handleTextSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || state === "processing" || state === "speaking" || state === "coding") return;

    const input = textInput.trim();
    setTextInput("");
    handleUserInput(input);
  }, [textInput, state, handleUserInput]);

  // Start interview - OpenAI takes full control
  const handleStartInterview = useCallback(async () => {
    if (state !== "idle") return;

    setState("loading");

    try {
      // Empty messages array - OpenAI will start the interview
      const response = await fetchAIResponse([]);

      console.log("=== FRONTEND: Start Interview Response ===");
      console.log("Content:", response.content);
      console.log("Tool call:", response.tool_call);

      // Store the opening
      const openingMessage: Message = { role: "assistant", content: response.content };
      messagesRef.current = [openingMessage];
      setMessages([openingMessage]);

      // Check if AI called a tool
      if (response.tool_call) {
        if (response.tool_call.name === "ask_language_preference") {
          pendingLanguagePromptRef.current = true;
        } else if (response.tool_call.name === "show_coding_challenge" && response.tool_call.challenge) {
          pendingChallengeRef.current = response.tool_call.challenge;
        }
      }

      // Speak the response
      audioEndHandledRef.current = false; // Reset for new audio
      setBubbleText(response.content);
      setState("speaking");
    } catch (error) {
      console.error("Error starting interview:", error);
      setState("idle");
    }
  }, [state, fetchAIResponse]);

  // Called when audio starts playing
  const handleAudioStart = useCallback(() => {
    setShowBubble(true);
  }, []);

  // Called when audio ends - check for pending actions
  const handleAudioEnd = useCallback(() => {
    // Prevent double execution
    if (audioEndHandledRef.current) {
      console.log("=== FRONTEND: Audio ended (duplicate, ignoring) ===");
      return;
    }
    audioEndHandledRef.current = true;

    console.log("=== FRONTEND: Audio ended ===");
    console.log("Pending language prompt:", pendingLanguagePromptRef.current);
    console.log("Pending challenge:", pendingChallengeRef.current);
    setShowBubble(false);

    // Check if we need to show language selection
    if (pendingLanguagePromptRef.current) {
      console.log("=== FRONTEND: Showing language buttons ===");
      pendingLanguagePromptRef.current = false;
      setShowLanguageButtons(true);
      setState("listening"); // Keep in listening state while showing buttons
    } else if (pendingChallengeRef.current) {
      // Check if we have a pending coding challenge
      console.log("=== FRONTEND: Starting coding challenge ===");
      startChallenge(pendingChallengeRef.current);
      pendingChallengeRef.current = null;
      setState("coding");
    } else if (codingState.isActive) {
      // If we're in a coding challenge (e.g., after a hint), return to coding state
      setState("coding");
    } else {
      setState("listening");
    }
  }, [startChallenge, codingState.isActive]);

  // Handle language selection from buttons
  const handleLanguageSelect = useCallback((language: SupportedLanguage) => {
    console.log("=== FRONTEND: Language selected ===", language);
    setShowLanguageButtons(false);

    const langName = LANGUAGE_CONFIG[language]?.name || language;
    handleUserInput(`[User selected ${langName} as their preferred programming language]`);
  }, [handleUserInput]);

  // Handle code run (execute with Judge0 API)
  const handleRunCode = useCallback(async (code: string, language: SupportedLanguage) => {
    if (!codingState.challenge) return;

    setIsRunning(true);
    setOutput(null);

    try {
      // Call Judge0 API for code execution
      const response = await fetch("/api/execute-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
          functionSignature: codingState.challenge.functionSignature,
          testCases: codingState.challenge.testCases,
        }),
      });

      if (!response.ok) {
        throw new Error("Code execution failed");
      }

      const result: CodeOutput = await response.json();
      setOutput(result);

      // Auto-detect success: if all tests passed, close challenge and continue
      if (result.testResults && result.testResults.length > 0) {
        const allPassed = result.testResults.every((t) => t.passed);
        if (allPassed) {
          // Wait briefly to show success, then continue interview
          setTimeout(() => {
            endChallenge();
            // Disable tools so AI moves to next question instead of another coding challenge
            handleUserInput("[User completed the coding challenge successfully - all tests passed]", true);
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Code execution error:", error);
      setOutput({
        stdout: "",
        stderr: "",
        returnValue: null,
        error: error instanceof Error ? error.message : "Execution failed",
      });
    } finally {
      setIsRunning(false);
    }
  }, [codingState.challenge, setOutput, setIsRunning, endChallenge, handleUserInput]);

  // Handle hint request - send code to AI for analysis
  const handleHintRequest = useCallback(async (code: string, language: SupportedLanguage) => {
    if (!codingState.challenge) return;

    setIsRequestingHint(true);

    const langName = LANGUAGE_CONFIG[language]?.name || language;

    try {
      // Build a hint request message with the challenge and user's code
      const hintMessage = `[User is stuck and asking for a hint on the coding challenge]
Challenge: ${codingState.challenge.title}
Description: ${codingState.challenge.description}
Language: ${langName}

User's current code:
\`\`\`${language}
${code}
\`\`\`

Give a clever, indirect hint. DO NOT give the solution directly.
Keep it to 1-2 sentences max.`;

      const userMessage: Message = { role: "user", content: hintMessage };
      const hintMessages = [...messagesRef.current, userMessage];

      // Get AI response with tools disabled (so AI gives text hint, not tool call)
      const response = await fetchAIResponse(hintMessages, true);

      // Add to conversation history
      const aiMessage: Message = { role: "assistant", content: response.content };
      messagesRef.current = [...hintMessages, aiMessage];
      setMessages(messagesRef.current);

      // Set the text but don't show bubble yet - wait for audio to start
      audioEndHandledRef.current = false;
      setBubbleText(response.content);
      // Note: setShowBubble(true) is called by handleAudioStart when TTS plays

      // Start speaking animation
      setState("speaking");
    } catch (error) {
      console.error("Hint request error:", error);
    } finally {
      setIsRequestingHint(false);
    }
  }, [codingState.challenge, fetchAIResponse]);

  // Determine if character should speak
  const shouldSpeak = state === "speaking";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="shadow-lg sticky top-0 z-50" style={{ backgroundColor: "#1E90FF" }}>
        <div className="px-6 py-4">
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Mock Interview</h1>
              <p className="text-xs text-white/80">AI-Powered Interview Practice</p>
            </div>
          </Link>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="flex-1 relative">
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, #dbeafe, #eff6ff, #ffffff)" }}
        >
          <Canvas
            gl={{ antialias: true }}
            camera={{ position: CAMERA_POSITION, fov: CAMERA_FOV }}
            style={{ width: "100%", height: "100%" }}
          >
            <ambientLight intensity={1.2} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            <directionalLight position={[-5, 5, -5]} intensity={0.5} />

            <Suspense fallback={null}>
              <CharacterModel
                modelPosition={MODEL_POSITION}
                modelRotation={MODEL_ROTATION}
                modelScale={MODEL_SCALE}
                text={bubbleText}
                speak={shouldSpeak}
                onAudioStart={handleAudioStart}
                onAudioEnd={handleAudioEnd}
              />
              <Environment preset="apartment" />
            </Suspense>
          </Canvas>
        </div>

        {/* Start Interview Button */}
        {state === "idle" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-30">
            <button
              className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white text-xl font-semibold rounded-xl shadow-lg transition-all hover:scale-105"
              onClick={handleStartInterview}
            >
              Start Interview
            </button>
          </div>
        )}

        {/* Loading Indicator */}
        {state === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-30">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
              <p className="text-white font-medium">Starting interview...</p>
            </div>
          </div>
        )}

        {/* Processing Indicator */}
        {state === "processing" && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20">
            <div className="flex items-center gap-2 bg-white/90 px-4 py-2 rounded-full shadow-md">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-slate-700">Thinking...</span>
            </div>
          </div>
        )}

        {/* Speech Bubble */}
        <SpeechBubble
          text={bubbleText}
          visible={showBubble}
          positionX={BUBBLE_X}
          positionY={BUBBLE_Y}
        />

        {/* Coding Panel - shown when in coding mode */}
        {codingState.isActive && codingState.challenge && (
          <CodingPanel
            challenge={codingState.challenge}
            visible={state === "coding" || state === "speaking"}
            onHint={handleHintRequest}
            onRun={handleRunCode}
            isRequestingHint={isRequestingHint}
            isRunning={codingState.isRunning}
            feedback={codingState.feedback}
            output={codingState.output}
          />
        )}

        {/* Language Selection Buttons */}
        <LanguageButtons
          visible={showLanguageButtons}
          onSelect={handleLanguageSelect}
        />

        {/* Text Input Box - hidden during coding mode and language selection */}
        {state !== "idle" && state !== "loading" && state !== "coding" && !showLanguageButtons && (
          <form
            onSubmit={handleTextSubmit}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-30"
          >
            <div className="flex gap-2 bg-white rounded-xl shadow-lg p-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={state === "speaking" ? "Wait for James to finish..." : "Type your response..."}
                disabled={state === "processing" || state === "speaking"}
                className="flex-1 px-4 py-3 rounded-lg bg-slate-100 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!textInput.trim() || state === "processing" || state === "speaking"}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white font-medium rounded-lg transition-colors"
              >
                Send
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
