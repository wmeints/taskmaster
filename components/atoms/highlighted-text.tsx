// Text with some parts marked, such as the words that matched a search. Ranges are [start, end) and must
// be in order and not overlap.
function HighlightedText({ text, ranges }: { text: string; ranges: [start: number, end: number][] }) {
  const parts: React.ReactNode[] = []
  let at = 0
  for (const [start, end] of ranges) {
    if (start > at) parts.push(text.slice(at, start))
    parts.push(
      <mark key={start} className="rounded-[3px] bg-yellow-200 text-inherit dark:bg-yellow-500/40">
        {text.slice(start, end)}
      </mark>
    )
    at = end
  }
  if (at < text.length) parts.push(text.slice(at))
  return <>{parts}</>
}

export { HighlightedText }
