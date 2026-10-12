// Structured product content (Giới thiệu, Điểm nổi bật, Thông số, Cách dùng, Lưu ý & bảo quản).
// When a product has `content.intro`, its page is built from these fields instead of the
// free-text description, so every product follows the same outline.
const cleanLine = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();

const toList = (value) => (Array.isArray(value) ? value : String(value ?? '').split('\n'))
  .map((line) => cleanLine(String(line).replace(/^\s*(?:[-*•]|\d+[.)])\s+/, '')))
  .filter(Boolean);

const toSpecs = (value) => {
  const rows = Array.isArray(value) ? value : String(value ?? '').split('\n');
  return rows.map((row) => {
    if (row && typeof row === 'object' && !Array.isArray(row)) return { label: cleanLine(row.label), value: cleanLine(row.value) };
    const text = cleanLine(row);
    const at = text.indexOf(':');
    return at > 0 ? { label: cleanLine(text.slice(0, at)), value: cleanLine(text.slice(at + 1)) } : { label: '', value: '' };
  }).filter((row) => row.label && row.value);
};

const normalizeProductContent = (content) => {
  if (!content || typeof content !== 'object' || Array.isArray(content)) return null;
  const intro = cleanLine(content.intro);
  if (!intro) return null;
  return {
    intro,
    highlights: toList(content.highlights),
    specs: toSpecs(content.specs),
    steps: toList(content.steps),
    care: toList(content.care),
  };
};

// Plain-text version kept in `description` for search, feeds and meta fallbacks.
const composeDescription = (content) => {
  const c = normalizeProductContent(content);
  if (!c) return '';
  return [
    c.intro,
    c.highlights.length ? `Điểm nổi bật:\n${c.highlights.map((line) => `- ${line}`).join('\n')}` : '',
    c.specs.length ? `Thông số:\n${c.specs.map((row) => `- ${row.label}: ${row.value}`).join('\n')}` : '',
    c.steps.length ? `Cách dùng:\n${c.steps.map((line, index) => `${index + 1}. ${line}`).join('\n')}` : '',
    c.care.length ? `Lưu ý & bảo quản:\n${c.care.map((line) => `- ${line}`).join('\n')}` : '',
  ].filter(Boolean).join('\n\n');
};

module.exports = { normalizeProductContent, composeDescription, toList, toSpecs };
