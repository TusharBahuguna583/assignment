type Props = {
  runStarted: boolean;
  gameOver: boolean;
  theme: string;
  onThemeToggle: () => void;
  onNavAction: () => void;
  onStop?: () => void;
  navActionLabel: string;
  isNavDisabled?: boolean;
};

export default function Navbar({
  runStarted,
  gameOver,
  theme,
  onThemeToggle,
  onNavAction,
  onStop,
  navActionLabel,
  isNavDisabled,
}: Props) {
  return (
    <nav className="nav">
      <div className="brand">Signal Decoder</div>

      <div className="navControls">
        {runStarted && !gameOver && onStop && (
          <button className="navStop" onClick={onStop} title="Stop and reset to basic">Reset</button>
        )}

        <button className="navAction" onClick={onNavAction} disabled={isNavDisabled}>
          {navActionLabel}
        </button>

        <button className="navTheme" onClick={onThemeToggle} aria-label="toggle theme">
          {theme === "dark" ? "🌙" : "☀️"}
        </button>
      </div>
    </nav>
  );
}
