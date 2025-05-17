import { BrailleTrie } from "./trie"
import { levenshteinDistance } from "./levenshtein"
import { parseQwertyInput } from "./braille-utils"
import { brailleToEnglish } from "./dictionary"

export class BrailleAutocorrect {
  constructor(maxSuggestions = 5, maxDistance = 3) {
    this.trie = new BrailleTrie()
    this.dictionary = new Map()
    this.maxSuggestions = maxSuggestions
    this.maxDistance = maxDistance
    this.userFrequency = new Map()
  }

  // Load dictionary from a list of words
  loadDictionary(words, charToBraille) {
    for (const word of words) {
      const brailleWord = []

      for (const char of word.toLowerCase()) {
        if (charToBraille.has(char)) {
          brailleWord.push([...charToBraille.get(char)])
        }
      }

      if (brailleWord.length > 0) {
        this.dictionary.set(word, brailleWord)
        this.trie.insert(brailleWord, word)
      }
    }
  }

  getLevenshteinDistance(a, b) {
    return levenshteinDistance(a, b)
  }

  getBrailleWord(word) {
    return this.dictionary.get(word) || null
  }

  getSuggestions(input) {
    const inputBraille = parseQwertyInput(input)

    if (inputBraille.length === 0) return []

    const exactMatch = this.trie.search(inputBraille)
    if (exactMatch) {
      this.updateFrequency(exactMatch)
      return [exactMatch]
    }

    let firstEnglishChar = ""
    if (inputBraille.length > 0) {
      const key = [...inputBraille[0]].sort().join(",")
      firstEnglishChar = brailleToEnglish.get(key) || ""
    }

    const candidates = []

    const dynamicMaxDistance = Math.min(this.maxDistance, Math.max(1, Math.ceil(inputBraille.length * 0.5)))

    for (const [word, brailleWord] of this.dictionary.entries()) {
      const startsWithSameChar =
        firstEnglishChar !== "?" && firstEnglishChar !== "" && word.startsWith(firstEnglishChar)

      if (Math.abs(brailleWord.length - inputBraille.length) > dynamicMaxDistance && !startsWithSameChar) {
        continue
      }

      let isPrefixMatch = false
      if (inputBraille.length <= 3) {
        isPrefixMatch = true
        for (let i = 0; i < Math.min(inputBraille.length, brailleWord.length); i++) {
          const cellA = inputBraille[i]
          const cellB = brailleWord[i]

          if (cellA.length !== cellB.length || !cellA.every((dot) => cellB.includes(dot))) {
            isPrefixMatch = false
            break
          }
        }
      }

      if (isPrefixMatch || startsWithSameChar) {
        const frequency = this.userFrequency.get(word) || 0
        candidates.push({
          word,
          distance: isPrefixMatch ? 0.1 : 0.5,
          frequency,
          prefixMatch: true,
        })
        continue
      }
      const distance = levenshteinDistance(inputBraille, brailleWord)

      if (distance <= dynamicMaxDistance) {
        const frequency = this.userFrequency.get(word) || 0
        candidates.push({
          word,
          distance,
          frequency,
          prefixMatch: false,
        })
      }
    }

    candidates.sort((a, b) => {
      if (a.prefixMatch && !b.prefixMatch) return -1
      if (!a.prefixMatch && b.prefixMatch) return 1

      if (Math.abs(a.distance - b.distance) < 0.5) {
        return b.frequency - a.frequency
      }
      return a.distance - b.distance
    })

    const suggestions = candidates.slice(0, this.maxSuggestions).map((c) => c.word)

    if (suggestions.length > 0) {
      this.updateFrequency(suggestions[0])
    }

    return suggestions
  }

  updateFrequency(word) {
    const currentFreq = this.userFrequency.get(word) || 0
    this.userFrequency.set(word, currentFreq + 1)
  }

  getFrequency(word) {
    return this.userFrequency.get(word) || 0
  }

  resetFrequencies() {
    this.userFrequency.clear()
  }
}
