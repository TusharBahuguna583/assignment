type Props = {
  score: number;
  best: number;
  newBestThisRun: boolean;
  currentGuesses: number;
};

export default function AsideScores({ score, best, newBestThisRun, currentGuesses }: Props) {
  return (
    <aside className="aside">
      <div className="scoreCard">
        <div className="scoreCardTitle">Current Score</div>
        <div className="scoreCardValue">{score}</div>
        <div className="scoreSmall">Level attempts: {currentGuesses}</div>
      </div>

      <div className="scoreCard">
        <div className="scoreCardTitle">Best Score</div>
        <div className={`scoreCardValue ${newBestThisRun ? "best-beat" : ""}`}>{best}</div>
      </div>
    </aside>
  );
}
