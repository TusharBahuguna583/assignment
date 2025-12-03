type Props = {
  open: boolean;
  score: number;
  best: number;
  newBestThisRun: boolean;
  guessesLog: number[];
  onClose: () => void;
};

export default function FinalModal({ open, score, best, newBestThisRun, guessesLog, onClose }: Props) {
  if (!open) return null;
  return (
    <div className="overlay">
      <div className="modal">
        <h2>Final Score</h2>
        <p className="big">{score}</p>
        <div className="small">Best: {best} {newBestThisRun ? <span className="newBest">— New Best!</span> : null}</div>

        <div style={{ textAlign: "left", marginTop: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Guesses per level</div>
          <div style={{ fontSize: 14 }}>
            {guessesLog.map((g, i) => <div key={i}>Level {i + 1}: {g === 0 ? "-" : g}</div>)}
          </div>
        </div>

        <div className="modalBtns">
          <button className="primary" onClick={onClose}>Close</button>
        </div>
        <div className="small">Levels completed: {guessesLog.filter(Boolean).length} </div>
      </div>
    </div>
  );
}
