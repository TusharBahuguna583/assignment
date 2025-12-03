import Grid from "./Grid";

type Props = {
  flashingSet: Set<number>;
  selectedSet: Set<number>;
  results?: Map<number, "correct" | "wrong">;
  onToggle: (i: number) => void;
  hintActive: boolean;

  // new props:
  playingPattern?: boolean; // true while pattern is playing back
  submitted?: boolean;      // true while waiting between submit/replay
  shakeAll?: boolean;       // trigger global shake animation
};

export default function GameArea({
  flashingSet,
  selectedSet,
  results,
  onToggle,
  hintActive,
  playingPattern = false,
  submitted = false,
  shakeAll = false,
}: Props) {
  // freeze interaction when pattern is playing or when submit/replay freeze is active
  const frozen = playingPattern || submitted;

  // no-op handler used while frozen (keeps Grid prop shape stable)
  const noop = () => {};

  return (
    <div className={`gameWrap ${hintActive ? "hint-active" : ""} ${shakeAll ? "shake" : ""}`}>
      <Grid
        flashingSet={flashingSet}
        selectedSet={selectedSet}
        results={results}
        // if frozen, pass a noop so clicks are ignored; otherwise pass the real handler
        onToggle={frozen ? noop : onToggle}
      />
    </div>
  );
}
