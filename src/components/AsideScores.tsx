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

               <div className="scoreCard" style={{height:"auto"}}>
                    <div className="scoreCardTitle">Best Score</div>
                    <div className={`scoreCardValue ${newBestThisRun ? "best-beat" : ""}`}>{best}</div>
               </div>
               <div className="scoreCard" style={{ padding: "10px", height: "auto" }}>
                    <div className="scoreCardTitle" style={{ marginBottom: "10px" }}>
                         Point System
                    </div>

                    <div style={{
                         display: "flex",
                         justifyContent: "space-between",
                         marginBottom: "6px"
                    }}>
                         <span style={{ color: "var(--muted)", fontWeight: 600 }}>Correct Pattern</span>
                         <span style={{ fontWeight: 900, color: "var(--ok)" }}>+2</span>
                    </div>

                    <div style={{
                         display: "flex",
                         justifyContent: "space-between"
                    }}>
                         <span style={{ color: "var(--muted)", fontWeight: 600 }}>Wrong Pattern</span>
                         <span style={{ fontWeight: 900, color: "var(--bad)" }}>–1</span>
                    </div>
               </div>
          </aside>
     );
}
