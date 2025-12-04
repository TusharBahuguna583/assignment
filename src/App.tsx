import { useEffect, useRef, useState } from "react"
import Navbar from "./components/Navbar"
import TopBar from "./components/TopBar"
import GameArea from "./components/GameArea"
import Controls from "./components/Controls"
import FinalModal from "./components/FinalModal"
import { rules } from "./rules"
import "./styles.css"
import AsideScores from "./components/AsideScores"


/* Confetti component (unchanged) */
function Confetti({ fire, onDone }: { fire: boolean; onDone?: () => void }) {
     const canvasRef = useRef<HTMLCanvasElement | null>(null)
     const rafRef = useRef<number | null>(null)
     useEffect(() => {
          if (!fire) return
          const canvas = document.createElement("canvas")
          canvasRef.current = canvas
          canvas.style.position = "fixed"
          canvas.style.left = "0"
          canvas.style.top = "0"
          canvas.style.width = "100vw"
          canvas.style.height = "100vh"
          canvas.style.pointerEvents = "none"
          canvas.style.zIndex = "2000"
          document.body.appendChild(canvas)
          const ctx = canvas.getContext("2d")
          if (!ctx) return
          const resize = () => {
               const dpr = window.devicePixelRatio || 1
               canvas.width = Math.floor(window.innerWidth * dpr)
               canvas.height = Math.floor(window.innerHeight * dpr)
               canvas.style.width = `${window.innerWidth}px`
               canvas.style.height = `${window.innerHeight}px`
               ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
          }
          resize()
          window.addEventListener("resize", resize)
          type P = { x: number; y: number; vx: number; vy: number; life: number; size: number; color: string; rot: number; vr: number }
          const colors = ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#B892FF"]
          const particles: P[] = []
          const cx = window.innerWidth / 2
          const count = 120
          for (let i = 0; i < count; i++) {
               const angle = Math.random() * Math.PI * 2
               const speed = 2 + Math.random() * 8
               particles.push({
                    x: cx,
                    y: 120 + Math.random() * 80,
                    vx: Math.cos(angle) * speed * (0.5 + Math.random()),
                    vy: Math.sin(angle) * speed * (0.7 + Math.random()),
                    life: 60 + Math.random() * 40,
                    size: 6 + Math.random() * 8,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    rot: Math.random() * Math.PI,
                    vr: (Math.random() - 0.5) * 0.3
               })
          }
          const gravity = 0.18
          const draw = () => {
               ctx.clearRect(0, 0, canvas.width, canvas.height)
               for (let i = particles.length - 1; i >= 0; i--) {
                    const p = particles[i]
                    p.x += p.vx
                    p.y += p.vy
                    p.vy += gravity * (0.6 + Math.random() * 0.8)
                    p.vx *= 0.995
                    p.vy *= 0.998
                    p.rot += p.vr
                    p.life -= 1
                    ctx.save()
                    ctx.translate(p.x, p.y)
                    ctx.rotate(p.rot)
                    ctx.fillStyle = p.color
                    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
                    ctx.restore()
                    if (p.life <= 0 || p.y > window.innerHeight + 50) particles.splice(i, 1)
               }
               if (particles.length > 0) rafRef.current = requestAnimationFrame(draw)
               else rafRef.current = null
          }
          rafRef.current = requestAnimationFrame(draw)
          const tidy = window.setTimeout(() => {
               if (rafRef.current) cancelAnimationFrame(rafRef.current)
               if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas)
               window.removeEventListener("resize", resize)
               if (onDone) onDone()
          }, 2500)
          return () => {
               if (rafRef.current) cancelAnimationFrame(rafRef.current)
               if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas)
               window.clearTimeout(tidy)
               window.removeEventListener("resize", resize)
          }
     }, [fire, onDone])
     return null
}

/* Audio helper (unchanged) */
function useAudio() {
     const ctxRef = useRef<AudioContext | null>(null)
     const startedRef = useRef(false)
     const ensureStarted = async () => {
          try {
               const C = (window as any).AudioContext || (window as any).webkitAudioContext
               if (!C) return
               if (!ctxRef.current) ctxRef.current = new C()
               if (!startedRef.current && ctxRef.current && ctxRef.current.state === "suspended") await ctxRef.current.resume()
               startedRef.current = true
          } catch (err) { console.error("Audio start error:", err) }
     }
     const play = async (freq: number, dur = 0.12) => {
          try {
               await ensureStarted()
               const ctx = ctxRef.current
               if (!ctx) return
               const o = ctx.createOscillator(), g = ctx.createGain()
               o.connect(g); g.connect(ctx.destination)
               o.type = "sine"; o.frequency.value = freq
               const now = ctx.currentTime
               g.gain.value = 0.0001
               g.gain.exponentialRampToValueAtTime(0.12, now + 0.01)
               o.start(now); g.gain.exponentialRampToValueAtTime(0.0001, now + dur); o.stop(now + dur + 0.02)
          } catch (err) { console.error("Audio play error:", err) }
     }
     return { play, ensureStarted }
}

export default function App() {
     const MAX_LEVEL = 5
     const FLASH_SECONDS = 10
     // timing tuning (tweak these numbers in ms)
     const RESULT_SHOW = 500         // ms to show the shake before replay starts
     const REPLAY_START_DELAY = 800   // small gap before replay begins
     const PLAY_ON = 480             // length of each flash during replay
     const GAP = 220                 // gap between flashes



     // state
     const [level, setLevel] = useState(1)
     const [phase, setPhase] = useState<"idle" | "flashing" | "guess">("idle")
     const phaseRef = useRef<typeof phase>("idle")
     const [runStarted, setRunStarted] = useState(false)
     const [submitted, setSubmitted] = useState<boolean>(false)
     // pattern sequence (ordered) for the current level
     const [pattern, setPattern] = useState<number[]>([])
     // true while the app is playing the pattern back (freeze selections)
     const [playingPattern, setPlayingPattern] = useState<boolean>(false)
     // user's selected sequence (ordered)
     const [selectedSeq, setSelectedSeq] = useState<number[]>([])


     const [flashingSet, setFlashingSet] = useState<Set<number>>(new Set())
     const [selectedSet, setSelectedSet] = useState<Set<number>>(new Set())
     const [results, setResults] = useState<Map<number, "correct" | "wrong"> | undefined>()
     const [levelSolved, setLevelSolved] = useState<boolean>(false)

     const [score, setScore] = useState<number>(0) // always start fresh on load
     const [best, setBest] = useState<number>(() => Number(localStorage.getItem("sd:best") || "0"))
     const [theme, setTheme] = useState<string>(() => localStorage.getItem("sd:theme") || "dark")

     const [guessesLog, setGuessesLog] = useState<number[]>(() => {
          const val = localStorage.getItem("sd:guesses")
          if (!val) return new Array(MAX_LEVEL).fill(0)
          try { const parsed = JSON.parse(val); return Array.isArray(parsed) ? parsed.slice(0, MAX_LEVEL).concat(new Array(MAX_LEVEL - parsed.length).fill(0)).slice(0, MAX_LEVEL) : new Array(MAX_LEVEL).fill(0) } catch { return new Array(MAX_LEVEL).fill(0) }
     })

     const [currentGuesses, setCurrentGuesses] = useState<number>(0)
     const [hint, setHint] = useState<string | null>(null)
     const [gameOver, setGameOver] = useState(false)
     const [newBestThisRun, setNewBestThisRun] = useState(false)
     const [confettiFire, setConfettiFire] = useState(false)

     // timers / refs
     const intervalRef = useRef<number | null>(null)
     const elapsedRef = useRef<number>(0)
     const submitTimeoutRef = useRef<number | null>(null)
     const hintTimeoutRef = useRef<number | null>(null)
     const { play, ensureStarted } = useAudio()
     const [timeLeft, setTimeLeft] = useState<number>(FLASH_SECONDS)
     const [totalTime, setTotalTime] = useState<number>(FLASH_SECONDS)

     useEffect(() => { phaseRef.current = phase }, [phase])
     useEffect(() => { document.documentElement.setAttribute("data-theme", theme); localStorage.setItem("sd:theme", theme) }, [theme])
     useEffect(() => { localStorage.setItem("sd:best", String(best)) }, [best])
     useEffect(() => { localStorage.setItem("sd:guesses", JSON.stringify(guessesLog)) }, [guessesLog])

     useEffect(() => {
          return () => {
               if (intervalRef.current) window.clearInterval(intervalRef.current)
               if (submitTimeoutRef.current) window.clearTimeout(submitTimeoutRef.current)
               if (hintTimeoutRef.current) window.clearTimeout(hintTimeoutRef.current)
          }
     }, [])

     const clearAllTimers = () => {
          if (intervalRef.current) { window.clearInterval(intervalRef.current); intervalRef.current = null }
          if (submitTimeoutRef.current) { window.clearTimeout(submitTimeoutRef.current); submitTimeoutRef.current = null }
          if (hintTimeoutRef.current) { window.clearTimeout(hintTimeoutRef.current); hintTimeoutRef.current = null }
     }

     const resetCurrentLevelState = () => {
          setSelectedSet(new Set())     // keep for backward compatibility if grid shows selection visuals
          setSelectedSeq([])            // clear ordered selections
          setResults(undefined)
          setHint(null)
          setLevelSolved(false)
          setCurrentGuesses(0)
          setSubmitted(false)
          setPlayingPattern(false)
          setPattern([])
          clearAllTimers()
     }


     const startLevel = async (lvl = level) => {
          if (gameOver) return
          await ensureStarted()
          setRunStarted(true)
          // clear any previous intervals/timeouts
          clearAllTimers()
          resetCurrentLevelState()

          setPhase("flashing"); phaseRef.current = "flashing"// start fixed countdown for flashing phase
          setTotalTime(FLASH_SECONDS)
          setTimeLeft(FLASH_SECONDS)
          elapsedRef.current = 0
          if (intervalRef.current) { window.clearInterval(intervalRef.current); intervalRef.current = null }
          intervalRef.current = window.setInterval(() => {
               elapsedRef.current += 1
               const left = Math.max(0, FLASH_SECONDS - elapsedRef.current)
               setTimeLeft(left)
               if (elapsedRef.current >= FLASH_SECONDS) {
                    if (intervalRef.current) { window.clearInterval(intervalRef.current); intervalRef.current = null }
                    // If timer naturally reaches 0 before pattern finished, move to guess as fallback
                    // but normally we rely on pattern playback to transition to guess.
                    setPhase("guess"); phaseRef.current = "guess"
                    setPlayingPattern(false)
                    setFlashingSet(new Set())
               }
          }, 1000)


          // Build list of candidate cells that satisfy the rule
          const rule = rules[lvl]
          const candidates: number[] = []
          for (let i = 0; i < 25; i++) {
               if (rule(i, Math.floor(i / 5), i % 5)) candidates.push(i)
          }

          // If no candidates (defensive), fall back to all cells
          const pool = candidates.length > 0 ? candidates : Array.from({ length: 25 }, (_, i) => i)

          // pattern length: choose something meaningful: level + 2, clamp to pool length * 2
          const patternLength = Math.min(Math.max(5, lvl + 4), 12)

          const newPattern: number[] = []
          for (let i = 0; i < patternLength; i++) {
               // pick random from pool — allow repeats for difficulty
               const idx = pool[Math.floor(Math.random() * pool.length)]
               newPattern.push(idx)
          }
          setPattern(newPattern)

          // Play the pattern one cell at a time
          const PLAY_ON = 600   // ms for cell visible
          const GAP = 300       // ms between flashes
          setPlayingPattern(true)
          setFlashingSet(new Set())  // clear any flash

          // schedule the flashes sequentially with timeouts
          let t = 0
          for (let p = 0; p < newPattern.length; p++) {
               const cellIndex = newPattern[p]
               // show cell
               window.setTimeout(() => {
                    setFlashingSet(new Set([cellIndex]))
                    play(660 + (p % 3) * 80, 0.08)
               }, t)
               t += PLAY_ON
               // clear cell
               window.setTimeout(() => {
                    setFlashingSet(new Set())
               }, t)
               t += GAP
          }

          // After sequence playback finish, move to guess phase
          window.setTimeout(() => {
               setPlayingPattern(false)
               setPhase("guess"); phaseRef.current = "guess"
               setFlashingSet(new Set())
               // ensure timers tracked so clearAllTimers can cancel them (we used window.setTimeout w/o refs for brevity)
          }, t)
     }


     const toggleSelect = (i: number) => {
          // only allow selection during guess phase, not while level solved, not while hint or pattern playing or submitted
          if (phaseRef.current !== "guess" || levelSolved) return
          if (hint) return
          if (playingPattern) return
          if (submitted) return

          // Append to ordered sequence (prevent extra beyond pattern length)
          // also prevent rapid duplicate clicks if you don't want immediate duplicates:
          setSelectedSeq((prev) => {
               // allow unlimited (or up to 25) entries — extra length will be treated as wrong by submitGuess()
               if (prev.length >= 25) return prev // safety cap
               return [...prev, i]
          })

          // For visual feedback you might still want selectedSet to mark clicked cells:
          setSelectedSet((prev) => {
               const s = new Set(prev)
               s.add(i)
               return s
          })
     }



     const submitGuess = () => {
          if (phaseRef.current !== "guess" || levelSolved) return
          // freeze submit to prevent double-submits
          setSubmitted(true)

          const lvl = level
          const expectedPattern = pattern.slice() // ordered

          const attempts = currentGuesses + 1
          setCurrentGuesses(attempts)

          // Compare ordered sequences: exact match length and each index
          const userSeq = selectedSeq.slice()
          console.log(userSeq, expectedPattern);
          let isExact = false;
          if (userSeq.length === expectedPattern.length) {
               isExact = userSeq.every((v, i) => v === expectedPattern[i])
          }
          else {
               isExact = false;
          }
          // Build results map so UI can color correct/wrong cells (optional)
          const res = new Map<number, "correct" | "wrong">()
          // mark items that were correct in position as correct else wrong
          for (let i = 0; i < expectedPattern.length; i++) {
               const exp = expectedPattern[i]
               const usr = userSeq[i]
               if (usr === exp) {
                    res.set(exp, "correct")
               } else {
                    // mark expected cell as wrong so user sees which were expected
                    res.set(expectedPattern[i], "wrong")
                    if (usr !== undefined) res.set(usr, "wrong")
               }
          }

          setResults(res)
          // clear selection visuals (user's clicks) so cells are unselected
          setSelectedSeq([])
          setSelectedSet(new Set())

          if (isExact) {
               const newScore = score + 2
               setScore(newScore)
               play(880, 0.18)

               // keep submitted true and show success; set level solved after short delay
               if (submitTimeoutRef.current) { window.clearTimeout(submitTimeoutRef.current); submitTimeoutRef.current = null }
               submitTimeoutRef.current = window.setTimeout(() => {
                    submitTimeoutRef.current = null
                    setLevelSolved(true)
                    setPhase("idle"); phaseRef.current = "idle"
                    setGuessesLog((prev) => {
                         const copy = prev.slice()
                         copy[lvl - 1] = attempts
                         return copy
                    })
                    setResults(undefined)

                    if (lvl >= MAX_LEVEL) {
                         if (newScore > best) {
                              setBest(newScore)
                              try { localStorage.setItem("sd:best", String(newScore)) } catch (err) { console.error(err) }
                              setNewBestThisRun(true)
                              setConfettiFire(true)
                              setTimeout(() => setConfettiFire(false), 2600)
                         } else {
                              setNewBestThisRun(false)
                         }
                         setGameOver(true)
                    }
                    // remain submitted=true until Next or restart triggers new level
               }, 1200)
          } else {
               // WRONG sequence: show per-cell markers, shake, then clear markers and replay pattern
               const newScore = score - 1
               setScore(newScore)
               play(220, 0.12) // buzzer

               // clear any pending timeouts
               if (submitTimeoutRef.current) { window.clearTimeout(submitTimeoutRef.current); submitTimeoutRef.current = null }
               if (hintTimeoutRef.current) { window.clearTimeout(hintTimeoutRef.current); hintTimeoutRef.current = null }

               // show per-cell correct/wrong markers immediately
               setResults(res)

               // clear user's visible selections immediately
               setSelectedSeq([]) // ordered seq cleared
               setSelectedSet(new Set())

               // freeze input while shaking + replay
               setSubmitted(true)
               setPlayingPattern(true)

               // After the *shake* finishes, remove per-cell markers and start the replay.
               // (This makes the red/green marks visible only during the shake.)
               submitTimeoutRef.current = window.setTimeout(() => {
                    submitTimeoutRef.current = null

                    setResults(undefined)
                    // now start the replay of the pattern (no per-cell markers shown during replay)
                    const expectedPattern = pattern.slice()
                    let t = REPLAY_START_DELAY

                    for (let p = 0; p < expectedPattern.length; p++) {
                         const cellIndex = expectedPattern[p]

                         // show cell
                         window.setTimeout(() => {
                              setFlashingSet(new Set([cellIndex]))
                              play(660 + (p % 3) * 80, 0.08)
                         }, t)

                         t += PLAY_ON

                         // clear cell
                         window.setTimeout(() => {
                              setFlashingSet(new Set())
                         }, t)

                         t += GAP
                    }

                    // after replay completes, clear flashing and unfreeze input
                    const totalReplay = t + 50
                    submitTimeoutRef.current = window.setTimeout(() => {
                         submitTimeoutRef.current = null
                         setFlashingSet(new Set())
                         setPlayingPattern(false)
                         setSubmitted(false)
                         // NOTE: results already cleared right after shake; nothing to clear here
                    }, totalReplay)
               }, RESULT_SHOW)
          }

     }


     const nextLevel = () => {
          if (!levelSolved) return
          if (level >= MAX_LEVEL) return
          const nl = level + 1
          setLevel(nl)
          setSubmitted(false)
          setTimeout(() => startLevel(nl), 160)
     }



     const toggleTheme = async () => { await ensureStarted(); setTheme((t) => (t === "dark" ? "light" : "dark")); play(520, 0.06) }

     // restart and start fresh immediately
     const restartAndStart = async () => {
          clearAllTimers()
          setScore(0)
          setLevel(1)
          setGameOver(false)
          setPhase("idle")
          setResults(undefined)
          setSelectedSet(new Set())
          setFlashingSet(new Set())
          setLevelSolved(false)
          setCurrentGuesses(0)
          setGuessesLog(new Array(MAX_LEVEL).fill(0))
          setHint(null)
          setNewBestThisRun(false)
          setTimeLeft(FLASH_SECONDS)
          setTotalTime(FLASH_SECONDS)
          setRunStarted(true)
          setTimeout(() => startLevel(1), 120)
     }

     // stop button: visible only while run is active and not finished — resets everything to basic initial state and hides Stop
     const stopAndResetToBasic = () => {
          // clear all timers
          clearAllTimers()
          // reset everything to base (idle, not started)
          setScore(0)
          setLevel(1)
          setGameOver(false)
          setPhase("idle")
          setResults(undefined)
          setSelectedSet(new Set())
          setFlashingSet(new Set())
          setLevelSolved(false)
          setCurrentGuesses(0)
          setGuessesLog(new Array(MAX_LEVEL).fill(0))
          setHint(null)
          setNewBestThisRun(false)
          setTimeLeft(FLASH_SECONDS)
          setTotalTime(FLASH_SECONDS)
          // set runStarted false so Stop button disappears and navAction shows Start
          setRunStarted(false)
     }

     // close modal: reset to idle and score 0 and show Start
     const closeModal = () => {
          clearAllTimers()
          setGameOver(false)
          setPhase("idle"); phaseRef.current = "idle"
          setLevel(1)
          setScore(0)
          setResults(undefined)
          setSelectedSet(new Set())
          setFlashingSet(new Set())
          setLevelSolved(false)
          setCurrentGuesses(0)
          setHint(null)
          setRunStarted(false)
     }

     // navbar labels & handlers
     const navActionLabel = runStarted ? "Restart" : "Start"
     const navActionHandler = () => {
          if (!runStarted) {
               setRunStarted(true)
               startLevel(1)
          } else {
               restartAndStart()
          }
     }

     // disable rule used for Submit/Next: disabled while flashing OR when modal/gameOver is true
     const actionDisabled = phase === "flashing" || gameOver

     return (
          <div className="app page">
               <Confetti fire={confettiFire} onDone={() => setConfettiFire(false)} />

               <Navbar
                    runStarted={runStarted}
                    gameOver={gameOver}
                    theme={theme}
                    onThemeToggle={toggleTheme}
                    onNavAction={navActionHandler}
                    onStop={stopAndResetToBasic}
                    navActionLabel={navActionLabel}
                    isNavDisabled={phase === "flashing"}
               />

               <div className="content">
                    <main className="main">
                         <TopBar level={level} phase={phase} timeLeft={timeLeft} totalTime={totalTime} />

                         <GameArea
                              flashingSet={flashingSet}
                              selectedSet={selectedSet}
                              results={results}
                              onToggle={toggleSelect}
                              hintActive={!!hint}
                         />

                         <div className="hintRow">
                              {hint ? (
                                   <div className="hint">{hint}</div>
                              ) : (
                                   <div className="hint placeholder">Submit to check — if wrong you'll get a hint and can try again.</div>
                              )}
                         </div>
                    </main>
                    <aside>
                         <AsideScores score={score} best={best} newBestThisRun={newBestThisRun} currentGuesses={currentGuesses} />

                         {/* Controls live here in the aside */}
                         <div style={{ marginTop: 8 }}>
                              <Controls
                                   onSubmit={submitGuess}
                                   onNext={() => { if (levelSolved && level < MAX_LEVEL) nextLevel() }}
                                   actionDisabled={actionDisabled}
                                   levelSolved={levelSolved}
                                   level={level}
                                   maxLevel={MAX_LEVEL}
                              />
                         </div>
                    </aside>
               </div>

               <FinalModal open={gameOver} score={score} best={best} newBestThisRun={newBestThisRun} guessesLog={guessesLog} onClose={closeModal} />
          </div>
     )



}
