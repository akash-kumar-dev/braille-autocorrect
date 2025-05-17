import { brailleToEnglish } from "./dictionary"

// Convert Braille cells to English text
export function brailleCellsToEnglish(cells) {
  let result = ""

  for (const cell of cells) {
    const key = [...cell].sort().join(",")
    if (brailleToEnglish.has(key)) {
      result += brailleToEnglish.get(key)
    } else {
      result += "?"
    }
  }

  return result
}

// Render a Braille cell as a visual dot pattern
export function BrailleCellDisplay({ cell, size = "medium" }) {
  const dots = new Set(cell)

  const sizes = {
    small: {
      container: "w-8 h-12",
      dot: "w-3 h-3",
    },
    medium: {
      container: "w-10 h-14",
      dot: "w-4 h-4",
    },
    large: {
      container: "w-12 h-16",
      dot: "w-5 h-5",
    },
  }

  const { container, dot } = sizes[size] || sizes.medium

  return (
    <div className="inline-block mr-2 mb-2">
      <div className={`grid grid-cols-2 gap-1 ${container} bg-gray-100 p-1 rounded`}>
        <div className={`rounded-full ${dot} ${dots.has(1) ? "bg-blue-600" : "bg-gray-300"}`}></div>
        <div className={`rounded-full ${dot} ${dots.has(4) ? "bg-blue-600" : "bg-gray-300"}`}></div>
        <div className={`rounded-full ${dot} ${dots.has(2) ? "bg-blue-600" : "bg-gray-300"}`}></div>
        <div className={`rounded-full ${dot} ${dots.has(5) ? "bg-blue-600" : "bg-gray-300"}`}></div>
        <div className={`rounded-full ${dot} ${dots.has(3) ? "bg-blue-600" : "bg-gray-300"}`}></div>
        <div className={`rounded-full ${dot} ${dots.has(6) ? "bg-blue-600" : "bg-gray-300"}`}></div>
      </div>
    </div>
  )
}

// Parse a QWERTY Braille input string into an array of Braille cells
export function parseQwertyInput(input) {
  const cells = []
  const qwertyToBraille = {
    D: 1,
    W: 2,
    Q: 3,
    K: 4,
    O: 5,
    P: 6,
  }

  if (!input || input.trim() === "") {
    return cells
  }

  const cellStrings = input.trim().split(/\s+/)

  for (const cellStr of cellStrings) {
    const cell = []

    for (const char of cellStr.toUpperCase()) {
      if (char in qwertyToBraille) {
        cell.push(qwertyToBraille[char])
      }
    }

    if (cell.length > 0) {
      cells.push([...cell].sort())
    }
  }

  return cells
}

export function englishToBrailleCell(char, englishToBrailleMap) {
  const lowerChar = char.toLowerCase()
  if (englishToBrailleMap.has(lowerChar)) {
    return [...englishToBrailleMap.get(lowerChar)]
  }
  return null
}

export function brailleCellToEnglish(cell, brailleToEnglishMap) {
  const key = [...cell].sort().join(",")
  return brailleToEnglishMap.get(key) || "?"
}
