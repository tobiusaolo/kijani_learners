export function getTopicReadingSections(topic) {
  if (topic?.sections?.length) {
    return topic.sections
      .map((s) => ({
        title: (s.title || '').trim(),
        body: (s.body || s.description || '').trim(),
      }))
      .filter((s) => s.title || s.body);
  }
  return null;
}

export function splitParagraphs(text) {
  if (!text?.trim()) return [];
  return text.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
}
