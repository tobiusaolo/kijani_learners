export const REFLECTION_WORD_LIMIT = 500;

export function countWords(text) {
  if (!text?.trim()) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function getReflectionPromptSubsections(module) {
  const raw = module?.reflection_prompt;
  if (!raw?.subsections?.length) return [];

  return raw.subsections
    .map((sub) => ({
      title: (sub.title || '').trim(),
      paragraphs: (sub.paragraphs || [])
        .map((p) => (typeof p === 'string' ? p : '').trim())
        .filter(Boolean),
    }))
    .filter((sub) => sub.title || sub.paragraphs.length);
}
