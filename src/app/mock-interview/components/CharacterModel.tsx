"use client";

import { useEffect, useRef, useMemo, useCallback } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useGraph, useFrame } from "@react-three/fiber";
import { SkeletonUtils } from "three-stdlib";
import * as THREE from "three";
import { CORRESPONDING_VISEME } from "../lib/constants";

interface CharacterModelProps {
  text?: string;
  speak?: boolean;
  onAudioStart?: () => void;
  onAudioEnd?: () => void;
  modelPosition?: [number, number, number];
  modelRotation?: [number, number, number];
  modelScale?: number;
}

export default function CharacterModel({
  text = "",
  speak = false,
  onAudioStart,
  onAudioEnd,
  modelPosition = [-2, -2, 0],
  modelRotation = [0.11, 0.8, 0],
  modelScale = 1.5,
}: CharacterModelProps) {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/69302784c833cf1a1d7a3014.glb");

  // Clone scene to avoid mutation issues
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes } = useGraph(clone);

  // Load animations
  const { animations: idleAnims } = useGLTF("/animations/idle-animation.glb");
  const { animations: talkingAnims } = useGLTF("/animations/talking-animation.glb");

  // Combine animations
  const allAnimations = useMemo(() => [...idleAnims, ...talkingAnims], [idleAnims, talkingAnims]);
  const { actions } = useAnimations(allAnimations, group);

  // Refs for audio and lip-sync
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentVisemeRef = useRef<string | null>(null);
  const lipSyncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTextRef = useRef<string>("");
  const abortControllerRef = useRef<AbortController | null>(null);
  const isSpeakingRef = useRef(false);

  // Lip-sync settings
  const MORPH_INTENSITY = 0.3;
  const LERP_SPEED = 0.3;

  // Get animation actions
  const idleAction = actions ? Object.values(actions)[0] : null;
  const talkingAction = actions ? Object.values(actions)[1] : null;

  // Play idle animation on mount
  useEffect(() => {
    if (idleAction) {
      idleAction.reset().fadeIn(0.3).play();
    }
  }, [idleAction]);

  // Switch between idle and talking animations
  useEffect(() => {
    if (!idleAction || !talkingAction) return;

    if (isSpeakingRef.current) {
      // Fade to talking animation
      idleAction.fadeOut(0.3);
      talkingAction.reset().fadeIn(0.3).play();
      talkingAction.setLoop(THREE.LoopRepeat, Infinity);
    } else {
      // Fade back to idle animation
      talkingAction.fadeOut(0.3);
      idleAction.reset().fadeIn(0.3).play();
    }
  }, [speak, idleAction, talkingAction]);

  // Reset all morph targets to zero
  const resetMorphTargets = useCallback(() => {
    const headMesh = nodes.Wolf3D_Head as THREE.SkinnedMesh | undefined;
    const teethMesh = nodes.Wolf3D_Teeth as THREE.SkinnedMesh | undefined;

    [headMesh, teethMesh].forEach((mesh) => {
      if (mesh?.morphTargetDictionary && mesh?.morphTargetInfluences) {
        Object.keys(mesh.morphTargetDictionary).forEach((key) => {
          const index = mesh.morphTargetDictionary![key];
          mesh.morphTargetInfluences![index] = 0;
        });
      }
    });
  }, [nodes]);

  // Stop audio and cleanup
  const stopAudio = useCallback(() => {
    // Abort any pending fetch
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (lipSyncIntervalRef.current) {
      clearInterval(lipSyncIntervalRef.current);
      lipSyncIntervalRef.current = null;
    }
    currentVisemeRef.current = null;
    isSpeakingRef.current = false;
    resetMorphTargets();
  }, [resetMorphTargets]);

  // Handle speak trigger
  useEffect(() => {
    // Only proceed if we should speak and text has changed
    if (!speak || !text || text === lastTextRef.current) {
      if (!speak) {
        lastTextRef.current = "";
        stopAudio();
      }
      return;
    }

    lastTextRef.current = text;

    // Abort any previous request
    stopAudio();

    // Create new abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const playAudio = async () => {
      try {
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
          signal: abortController.signal,
        });

        if (abortController.signal.aborted) return;
        if (!response.ok) throw new Error("TTS fetch failed");

        const blob = await response.blob();
        if (abortController.signal.aborted) return;

        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;

        const characters = text.toUpperCase().split("");

        audio.onloadedmetadata = () => {
          if (abortController.signal.aborted) {
            URL.revokeObjectURL(url);
            return;
          }

          const duration = audio.duration * 1000;

          audio.onplay = () => {
            isSpeakingRef.current = true;
            onAudioStart?.();

            // Switch to talking animation
            if (idleAction && talkingAction) {
              idleAction.fadeOut(0.3);
              talkingAction.reset().fadeIn(0.3).play();
              talkingAction.setLoop(THREE.LoopRepeat, Infinity);
            }

            const startTime = Date.now();
            lipSyncIntervalRef.current = setInterval(() => {
              const elapsed = Date.now() - startTime;
              const charIndex = Math.floor((elapsed / duration) * characters.length);

              if (charIndex < characters.length) {
                const char = characters[charIndex];
                currentVisemeRef.current = CORRESPONDING_VISEME[char] || null;
              } else {
                currentVisemeRef.current = null;
              }
            }, 50);
          };

          audio.onended = () => {
            URL.revokeObjectURL(url);

            // Switch back to idle animation
            if (idleAction && talkingAction) {
              talkingAction.fadeOut(0.3);
              idleAction.reset().fadeIn(0.3).play();
            }

            stopAudio();
            onAudioEnd?.();
          };

          audio.onerror = () => {
            URL.revokeObjectURL(url);
            stopAudio();
            onAudioEnd?.();
          };

          audio.play().catch(() => {
            URL.revokeObjectURL(url);
            stopAudio();
            onAudioEnd?.();
          });
        };
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        console.error("Audio playback error:", error);
        stopAudio();
        onAudioEnd?.();
      }
    };

    playAudio();

    return () => {
      abortController.abort();
    };
  }, [speak, text, onAudioStart, onAudioEnd, stopAudio, idleAction, talkingAction]);

  // Animate morph targets each frame
  useFrame(() => {
    const headMesh = nodes.Wolf3D_Head as THREE.SkinnedMesh | undefined;
    const teethMesh = nodes.Wolf3D_Teeth as THREE.SkinnedMesh | undefined;

    if (!headMesh?.morphTargetDictionary || !headMesh?.morphTargetInfluences) return;

    const visemeKeys = Object.keys(headMesh.morphTargetDictionary).filter((k) =>
      k.startsWith("viseme_")
    );
    const activeViseme = currentVisemeRef.current;

    visemeKeys.forEach((key) => {
      const targetValue = key === activeViseme ? MORPH_INTENSITY : 0;

      // Animate head mesh
      const headIndex = headMesh.morphTargetDictionary![key];
      headMesh.morphTargetInfluences![headIndex] = THREE.MathUtils.lerp(
        headMesh.morphTargetInfluences![headIndex],
        targetValue,
        LERP_SPEED
      );

      // Animate teeth mesh
      if (teethMesh?.morphTargetDictionary && teethMesh?.morphTargetInfluences) {
        const teethIndex = teethMesh.morphTargetDictionary[key];
        if (teethIndex !== undefined) {
          teethMesh.morphTargetInfluences[teethIndex] = THREE.MathUtils.lerp(
            teethMesh.morphTargetInfluences[teethIndex],
            targetValue,
            LERP_SPEED
          );
        }
      }
    });
  });

  return (
    <group ref={group}>
      <primitive
        object={clone}
        scale={modelScale}
        position={modelPosition}
        rotation={modelRotation}
      />
    </group>
  );
}

useGLTF.preload("/69302784c833cf1a1d7a3014.glb");
useGLTF.preload("/animations/idle-animation.glb");
useGLTF.preload("/animations/talking-animation.glb");
