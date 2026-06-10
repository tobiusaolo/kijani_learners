export function getModuleContentSections(module) {
  if (!module?.content_sections?.length) return [];
  return module.content_sections
    .map((section) => ({
      title: (section.title || '').trim(),
      subsections: (section.subsections || [])
        .map((sub) => ({
          title: (sub.title || '').trim(),
          paragraphs: (sub.paragraphs || [])
            .map((p) => (typeof p === 'string' ? p : '').trim())
            .filter(Boolean),
        }))
        .filter((sub) => sub.title || sub.paragraphs.length),
    }))
    .filter((section) => section.title || section.subsections.length);
}
