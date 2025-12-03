type Props = {
  level: number;
  phase: "idle" | "flashing" | "guess";
  timeLeft: number;
  totalTime: number;
};

export default function TopBar({ level, phase, timeLeft, totalTime }: Props) {
  const statusEmoji = phase === "flashing" ? "⏳" : phase === "guess" ? "🤔" : "😴";
  const statusText = phase === "flashing" ? "Flashing" : phase === "guess" ? "Guessing" : "Idle";
  const pct = phase === "flashing" ? (timeLeft / Math.max(1, totalTime)) * 100 : 0;

  return (
    <div className="topControls">
      <div className="progressLarge">
        <div className="progressTop">
          <div className="levelBlock">
            <div className="levelBig">Level {level}</div>
            <div className="statusLine">{statusEmoji} <span className="statusText">{statusText}</span></div>
          </div>
          <div className="timerBlock">
            <div className="timeDisplay">{phase === "flashing" ? `${timeLeft}s` : " "}</div>
          </div>
        </div>

        <div className="progressBar">
          <div className="bar" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}
