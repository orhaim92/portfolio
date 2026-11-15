import { randomBytes } from "node:crypto";
import { person } from "@/content/profile";

// ---- Input side ----------------------------------------------------------

export const MAX_QUESTION_CHARS = 400;

/**
 * Clean visitor text before it gets near a model.
 * - NFKC folds look-alike characters, so "ｉｇｎｏｒｅ" becomes "ignore".
 * - Control, zero-width and bidi-override characters are removed: they are
 *   the usual way to hide instructions from a human reader.
 * - Angle brackets are removed, so the text cannot close the data tag it is
 *   wrapped in and pretend to be something else.
 */
export function sanitize(input: unknown, max = MAX_QUESTION_CHARS): string {
  if (typeof input !== "string") return "";
  return input
    .normalize("NFKC")
    .replace(/[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁠-⁩﻿]/g, " ")
    .replace(/[<>]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

const INJECTION_PATTERNS: RegExp[] = [
  /ignore (all |any |the )?(previous|prior|above|earlier) (instructions|prompts|rules)/i,
  /disregard (all |any |the )?(previous|prior|above|your) /i,
  /(reveal|show|print|repeat|output) (me )?(your |the )?(system |hidden |initial )?(prompt|instructions|rules)/i,
  /you are now\b/i,
  /\b(developer|dan|jailbreak|god) mode\b/i,
  /pretend (to be|you are)/i,
  /act as (if you|an?|the) /i,
  /\bsystem\s*:/i,
  /new instructions/i,
  /\bbase64\b|\brot13\b/i,
];

/**
 * A cheap signal, not the defence. Pattern lists are easy to get around, so
 * nothing depends on this catching an attack. It only raises a flag that the
 * planner and the UI can see.
 */
export function looksLikeInjection(text: string): boolean {
  return INJECTION_PATTERNS.some((re) => re.test(text));
}

// ---- Output side ---------------------------------------------------------

/**
 * A random marker placed in every system prompt. It means nothing to the
 * model. If it ever shows up in an answer, the model is leaking its
 * instructions, and the answer is stopped.
 */
export const CANARY = `cn-${randomBytes(6).toString("hex")}`;

const ALLOWED_URLS = [person.linkedin, person.dentai];
const URL_RE = /\bhttps?:\/\/[^\s)\]}>"']+/gi;

export class BlockedOutput extends Error {}

function scrub(text: string): string {
  return text.replace(URL_RE, (url) => {
    const clean = url.replace(/[.,;:!?]+$/, "");
    return ALLOWED_URLS.some((ok) => clean.startsWith(ok.replace(/\/$/, ""))) ? url : "[link removed]";
  });
}

/**
 * Checks the answer while it streams. It holds back a short tail so that a
 * URL or the canary cannot slip through split across two chunks.
 */
export class OutputFilter {
  private pending = "";
  private total = 0;
  constructor(
    private readonly maxChars = 1600,
    private readonly holdback = 120,
  ) {}

  push(delta: string): string {
    this.pending += delta;
    if (this.pending.includes(CANARY)) throw new BlockedOutput("canary");
    if (this.pending.length <= this.holdback) return "";
    // Release up to the last whitespace before the held-back tail.
    let cut = this.pending.length - this.holdback;
    const ws = this.pending.lastIndexOf(" ", cut);
    if (ws > 0) cut = ws + 1;
    return this.release(cut);
  }

  flush(): string {
    if (this.pending.includes(CANARY)) throw new BlockedOutput("canary");
    return this.release(this.pending.length);
  }

  private release(cut: number): string {
    let out = scrub(this.pending.slice(0, cut));
    this.pending = this.pending.slice(cut);
    const room = this.maxChars - this.total;
    if (room <= 0) return "";
    if (out.length > room) out = out.slice(0, room);
    this.total += out.length;
    return out;
  }
}
