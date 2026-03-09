export type ParsedItem = {
  text: string
  depth: number
  checked: boolean
}

/**
 * Parses a markdown string into a flat list of checklist items.
 * Supports:
 *   - `- [ ] item` / `- [x] item` (task list items)
 *   - `# heading` / `## heading` (become non-checkable section items)
 *   - Nested items via indentation (2 or 4 spaces)
 */
export function parseMarkdownChecklist(markdown: string): ParsedItem[] {
  const lines = markdown.split('\n')
  const items: ParsedItem[] = []

  for (const raw of lines) {
    const line = raw

    // Task list item: `  - [ ] text` or `  - [x] text`
    const taskMatch = line.match(/^(\s*)- \[([ xX])\] (.+)$/)
    if (taskMatch) {
      const [, indent, check, text] = taskMatch
      items.push({
        text: text.trim(),
        depth: Math.floor((indent?.length ?? 0) / 2),
        checked: check.toLowerCase() === 'x',
      })
      continue
    }

    // Plain list item: `  - text`
    const listMatch = line.match(/^(\s*)[-*] (.+)$/)
    if (listMatch) {
      const [, indent, text] = listMatch
      items.push({
        text: text.trim(),
        depth: Math.floor((indent?.length ?? 0) / 2),
        checked: false,
      })
      continue
    }

    // Heading: `# text` — becomes a section header (depth -1 is a special marker)
    const headingMatch = line.match(/^(#{1,3}) (.+)$/)
    if (headingMatch) {
      const [, hashes, text] = headingMatch
      items.push({
        text: text.trim(),
        depth: -(hashes?.length ?? 1), // negative depth = heading
        checked: false,
      })
      continue
    }
  }

  return items
}
