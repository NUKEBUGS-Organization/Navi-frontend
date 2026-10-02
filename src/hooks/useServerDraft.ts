import { useCallback, useEffect, useRef, useState } from "react";

export type DraftSaveStatus = "idle" | "saving" | "saved" | "error";

type Options<T> = {
  /** Only auto-save while the form is open. */
  enabled: boolean;
  /** Snapshots for which nothing is saved (avoids creating empty drafts). */
  isEmpty: (value: T) => boolean;
  /**
   * Persist the snapshot. Called with `null` the first time (create the draft) and with the
   * draft id afterwards (update it). Must resolve to the draft's id.
   */
  save: (value: T, draftId: string | null) => Promise<string>;
  delayMs?: number;
};

/**
 * Auto-saves a form to the database as the user types (debounced), so drafts follow the user
 * across devices and survive closing the form, a refresh or a crash.
 *
 * Saves are chained: a second save waits for the first, so the initial "create" always finishes
 * before any "update" and only one draft is created.
 */
export function useServerDraft<T>(value: T, { enabled, isEmpty, save, delayMs = 1200 }: Options<T>) {
  const [draftId, setDraftIdState] = useState<string | null>(null);
  const [status, setStatus] = useState<DraftSaveStatus>("idle");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const draftIdRef = useRef<string | null>(null);
  const lastSavedRef = useRef<string | null>(null);
  const chainRef = useRef<Promise<string | null>>(Promise.resolve(null));
  /** Bumped by reset(); a save that started before a reset must not touch the new state. */
  const generationRef = useRef(0);
  const saveRef = useRef(save);
  const isEmptyRef = useRef(isEmpty);
  saveRef.current = save;
  isEmptyRef.current = isEmpty;

  const serialized = JSON.stringify(value);
  const serializedRef = useRef(serialized);
  serializedRef.current = serialized;

  const runSave = useCallback((snapshot: string): Promise<string | null> => {
    const next = chainRef.current.then(async () => {
      if (snapshot === lastSavedRef.current) return draftIdRef.current;
      const parsed = JSON.parse(snapshot) as T;
      if (isEmptyRef.current(parsed)) return draftIdRef.current;
      const generation = generationRef.current;
      setStatus("saving");
      setError(null);
      try {
        const id = await saveRef.current(parsed, draftIdRef.current);
        if (generation !== generationRef.current) return draftIdRef.current;
        draftIdRef.current = id;
        setDraftIdState(id);
        lastSavedRef.current = snapshot;
        setStatus("saved");
        setSavedAt(Date.now());
        return id;
      } catch (e) {
        if (generation !== generationRef.current) return draftIdRef.current;
        const raw = (e as { message?: string | string[] })?.message;
        setError(Array.isArray(raw) ? raw.join(", ") : raw || "Could not save draft.");
        setStatus("error");
        return draftIdRef.current;
      }
    });
    chainRef.current = next;
    return next;
  }, []);

  useEffect(() => {
    if (!enabled || serialized === lastSavedRef.current) return;
    const t = window.setTimeout(() => void runSave(serialized), delayMs);
    return () => window.clearTimeout(t);
  }, [serialized, enabled, delayMs, runSave]);

  /** Save the current values immediately (e.g. "Save draft" button). Resolves to the draft id. */
  const flush = useCallback(() => runSave(serializedRef.current), [runSave]);

  /**
   * Point the hook at a draft (or none) without saving. Pass the loaded values as `baseline`
   * so opening an existing draft doesn't immediately re-save it.
   */
  const reset = useCallback((id: string | null, baseline?: T) => {
    generationRef.current += 1;
    draftIdRef.current = id;
    setDraftIdState(id);
    lastSavedRef.current = baseline === undefined ? null : JSON.stringify(baseline);
    setStatus("idle");
    setSavedAt(null);
    setError(null);
  }, []);

  /** Wait for any in-flight save (call before publishing so the draft id is final). */
  const settle = useCallback(
    () => chainRef.current.then(() => draftIdRef.current),
    [],
  );

  return { draftId, status, savedAt, error, flush, reset, settle };
}

export function formatDraftTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
