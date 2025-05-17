// TrieNode class for dictionary
export class TrieNode {
  constructor() {
    this.children = new Map()
    this.isEndOfWord = false
    this.word = null
  }
}

// Trie class for efficient word lookup
export class BrailleTrie {
  constructor() {
    this.root = new TrieNode()
  }

  // Convert a Braille cell to a string key for the trie
  cellToKey(cell) {
    return [...cell].sort().join(",")
  }

  // Insert a word into the trie
  insert(brailleWord, originalWord) {
    let current = this.root

    for (const cell of brailleWord) {
      const key = this.cellToKey(cell)
      if (!current.children.has(key)) {
        current.children.set(key, new TrieNode())
      }
      current = current.children.get(key)
    }

    current.isEndOfWord = true
    current.word = originalWord
  }

  // Search for a word in the trie
  search(brailleWord) {
    let current = this.root

    for (const cell of brailleWord) {
      const key = this.cellToKey(cell)
      if (!current.children.has(key)) {
        return null
      }
      current = current.children.get(key)
    }

    return current.isEndOfWord ? current.word : null
  }

  // Get all words in the trie
  getAllWords() {
    const words = []

    const traverse = (node) => {
      if (node.isEndOfWord && node.word) {
        words.push(node.word)
      }

      for (const child of node.children.values()) {
        traverse(child)
      }
    }

    traverse(this.root)
    return words
  }
}
