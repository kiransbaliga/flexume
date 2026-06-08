// Thin client for the local Ollama server, reached through the Vite proxy
// (see vite.config.ts). All requests hit /ollama/* which forwards to :11434.

export const OLLAMA_MODEL = 'gemma4:e4b'

export interface AiPreset {
  id: string
  label: string
  hint: string
  instruction: string
}

/** One-click rewrite actions shown in the AI menu next to each text field. */
export const AI_PRESETS: AiPreset[] = [
  {
    id: 'improve',
    label: 'Improve',
    hint: 'Stronger, more professional phrasing',
    instruction:
      'Rewrite this résumé line to be more impactful and professional. Start with a strong past-tense action verb, keep it to one line, and remove filler words.',
  },
  {
    id: 'concise',
    label: 'Concise',
    hint: 'Trim to the essentials',
    instruction:
      'Make this résumé text more concise while preserving every concrete detail and number. Return a single tight line.',
  },
  {
    id: 'quantify',
    label: 'Quantify',
    hint: 'Emphasise measurable impact',
    instruction:
      'Rewrite this résumé bullet to foreground measurable impact and outcomes. If a metric is present keep it; if none exists, insert a clearly bracketed placeholder like [X%] or [N] where a number should go.',
  },
  {
    id: 'grammar',
    label: 'Fix grammar',
    hint: 'Spelling & grammar only',
    instruction:
      'Correct only the spelling, grammar, and punctuation of this text. Do not change the meaning, tone, or wording beyond what is necessary.',
  },
  {
    id: 'summarize',
    label: 'Summarise',
    hint: 'Condense into one sentence',
    instruction:
      'Summarise this into a single polished professional sentence suitable for a résumé summary.',
  },
]

interface GenerateResponse {
  response?: string
  error?: string
}

/** Low-level call to /api/generate (non-streaming). */
export async function generate(prompt: string, system?: string): Promise<string> {
  const res = await fetch('/ollama/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      system,
      stream: false,
      think: false, // suppress chain-of-thought for thinking-capable models
      options: { temperature: 0.4 },
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Ollama responded ${res.status}. ${text}`.trim())
  }

  const data = (await res.json()) as GenerateResponse
  if (data.error) throw new Error(data.error)
  return cleanOutput(data.response ?? '')
}

/**
 * Apply an editing instruction to a piece of text and return only the rewritten
 * text. Used by every preset and the custom-prompt box.
 */
export async function transformText(
  text: string,
  instruction: string,
): Promise<string> {
  const system =
    'You are an expert résumé editor. You output ONLY the rewritten text — no preamble, ' +
    'no surrounding quotes, no markdown, no bullet characters, no explanations, no notes. ' +
    'If given a single line, you return a single line.'
  const prompt = `${instruction}\n\nText:\n"""${text}"""\n\nRewritten text:`
  return generate(prompt, system)
}

/** Strip the wrapping the model tends to add despite instructions. */
function cleanOutput(raw: string): string {
  let out = raw.trim()
  // Drop a leading "Rewritten text:" / "Here is ...:" style preamble.
  out = out.replace(/^(rewritten text|here(?:'s| is)[^:\n]*|output)\s*:\s*/i, '')
  // Strip a single pair of wrapping quotes.
  if (
    (out.startsWith('"') && out.endsWith('"')) ||
    (out.startsWith('“') && out.endsWith('”')) ||
    (out.startsWith("'") && out.endsWith("'"))
  ) {
    out = out.slice(1, -1)
  }
  // Strip a leading markdown bullet / list marker.
  out = out.replace(/^\s*[-*•]\s+/, '')
  return out.trim()
}

export interface OllamaStatus {
  ok: boolean
  models: string[]
  hasModel: boolean
  error?: string
}

/** Ping the server for the model list (used by the status indicator). */
export async function checkOllama(): Promise<OllamaStatus> {
  try {
    const res = await fetch('/ollama/api/tags')
    if (!res.ok) return { ok: false, models: [], hasModel: false, error: `HTTP ${res.status}` }
    const data = (await res.json()) as { models?: Array<{ name: string }> }
    const models = (data.models ?? []).map((m) => m.name)
    return { ok: true, models, hasModel: models.includes(OLLAMA_MODEL) }
  } catch (e) {
    return {
      ok: false,
      models: [],
      hasModel: false,
      error: e instanceof Error ? e.message : 'unreachable',
    }
  }
}
