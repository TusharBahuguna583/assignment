type Props = {
  index: number
  flashing: boolean
  selected: boolean
  result?: "correct" | "wrong" | null
  onToggle: (i: number) => void
}

export default function Cell({ index, flashing, selected, result, onToggle }: Props) {
  const cls = [
    "cell",
    flashing ? "flashing" : "",
    selected ? "selected" : "",
    result === "correct" ? "correct pop" : result === "wrong" ? "wrong shake" : ""
  ].join(" ")
  return <div className={cls} onClick={() => onToggle(index)} data-index={index} />
}
