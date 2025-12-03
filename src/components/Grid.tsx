import Cell from "./Cell"

type Props = {
  flashingSet: Set<number>
  selectedSet: Set<number>
  results?: Map<number, "correct" | "wrong">
  onToggle: (i: number) => void
}

export default function Grid({ flashingSet, selectedSet, results, onToggle }: Props) {
  const cells = new Array(25).fill(0).map((_, i) => {
    const flashing = flashingSet.has(i)
    const selected = selectedSet.has(i)
    const result = results?.get(i) ?? null
    return <Cell key={i} index={i} flashing={flashing} selected={selected} result={result} onToggle={onToggle} />
  })
  return <div className="grid">{cells}</div>
}
