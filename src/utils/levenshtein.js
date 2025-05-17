// Calculate Levenshtein distance between two Braille words with early termination
export function levenshteinDistance(a, b) {
  const m = a.length
  const n = b.length

  // Early termination for empty inputs
  if (m === 0) return n
  if (n === 0) return m

  // If the lengths are very different, we can return early
  if (Math.abs(m - n) > 3) {
    return Math.max(m, n) // Simplification for very different lengths
  }

  // Create a matrix of size (m+1) x (n+1)
  const dp = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0))

  // Initialize the first row and column
  for (let i = 0; i <= m; i++) {
    dp[i][0] = i
  }

  for (let j = 0; j <= n; j++) {
    dp[0][j] = j
  }

  // Track minimum value in each row for early termination
  let minValue = 0
  const maxAllowedDistance = Math.max(m, n) * 0.7 // 70% of max length as threshold

  // Fill the matrix
  for (let i = 1; i <= m; i++) {
    minValue = Number.MAX_SAFE_INTEGER

    for (let j = 1; j <= n; j++) {
      // Calculate cell similarity (0 if identical, 1 if different)
      const cellSimilarity = cellDistance(a[i - 1], b[j - 1])

      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // deletion
        dp[i][j - 1] + 1, // insertion
        dp[i - 1][j - 1] + cellSimilarity, // substitution
      )

      // Track minimum value in this row
      minValue = Math.min(minValue, dp[i][j])
    }

    // Early termination if all values in this row exceed threshold
    if (minValue > maxAllowedDistance) {
      return Math.floor(maxAllowedDistance) + 1
    }
  }

  return dp[m][n]
}

// Calculate distance between two Braille cells with weighted differences
function cellDistance(a, b) {
  // Convert cells to sets for easier comparison
  const setA = new Set(a)
  const setB = new Set(b)

  // Empty cells are considered completely different
  if (setA.size === 0 && setB.size === 0) return 0
  if (setA.size === 0 || setB.size === 0) return 1

  // Count dots that are in one set but not the other
  let missingDots = 0
  let extraDots = 0

  for (const dot of setA) {
    if (!setB.has(dot)) {
      missingDots++
    }
  }

  for (const dot of setB) {
    if (!setA.has(dot)) {
      extraDots++
    }
  }

  // Calculate similarity based on Jaccard index
  const intersection = setA.size + setB.size - missingDots - extraDots
  const union = setA.size + setB.size - intersection

  // Return a value between 0 and 1
  // 0 means identical, 1 means completely different
  return union > 0 ? 1 - intersection / union : 1
}
