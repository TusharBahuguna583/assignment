export type RuleFn = (index: number, row: number, col: number) => boolean

const isPrime = (n: number) => {
     if (n < 2) return false
     for (let i = 2; i * i <= n; i++) if (n % i === 0) return false
     return true
}

export const rules: Record<number, RuleFn> = {
     1: (i) => i % 2 === 0,
     2: (_, r, c) => r === c || r + c === 4,
     3: (i) => isPrime(i),
     4: (_, r, c) => {
          const center = 12
          const cr = Math.floor(center / 5)
          const cc = center % 5
          return (r === cr && c === cc) || (Math.abs(r - cr) + Math.abs(c - cc) === 1)
     },
     5: (_, r, c) => ((r + c) % 3) === 0
}
