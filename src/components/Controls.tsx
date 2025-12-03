type Props = {
  onSubmit: () => void;
  onNext: () => void;
  actionDisabled: boolean;
  levelSolved: boolean;
  level: number;
  maxLevel: number;
};

export default function Controls({ onSubmit, onNext, actionDisabled, levelSolved, level, maxLevel }: Props) {
  return (
    <div className="bottomControls">
      <button className="primary" onClick={onSubmit} disabled={actionDisabled || levelSolved}>Submit</button>
      <button onClick={onNext} disabled={actionDisabled || !levelSolved || level >= maxLevel}>Next Level</button>
    </div>
  );
}
