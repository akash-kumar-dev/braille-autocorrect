"use client"

import { useState, useEffect, useRef } from "react"
import { QWERTY_TO_BRAILLE } from "../utils/types"
import dictionary, { englishToBraille } from "../utils/dictionary"
import { BrailleCellDisplay, brailleCellsToEnglish, parseQwertyInput } from "../utils/braille-utils"
import { BrailleAutocorrect as BrailleAutocorrectEngine } from "../utils/autocorrect"

const autocorrect = new BrailleAutocorrectEngine()
autocorrect.loadDictionary(dictionary, englishToBraille)

const BrailleAutocorrect = () => {
  const [input, setInput] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1)
  const [pressedKeys, setPressedKeys] = useState(new Set())
  const [currentCell, setCurrentCell] = useState([])
  const [completedText, setCompletedText] = useState([])
  const [brailleCells, setBrailleCells] = useState([])
  const [autoReplaceWords, setAutoReplaceWords] = useState([])
  const [selectedAutoReplace, setSelectedAutoReplace] = useState(0)
  const inputRef = useRef(null)

  useEffect(() => {
    const fullInput = input + (currentCell.length > 0 ? " " + currentCell.join("") : "")

    if (fullInput.trim()) {
      const newSuggestions = autocorrect.getSuggestions(fullInput)
      setSuggestions(newSuggestions)

      setBrailleCells(parseQwertyInput(fullInput))

      if (newSuggestions.length > 0) {
        const topSuggestions = newSuggestions.slice(0, 3)
        setAutoReplaceWords(topSuggestions)
        setSelectedAutoReplace(0)
      } else {
        setAutoReplaceWords([])
      }
    } else {
      setSuggestions([])
      setBrailleCells([])
      setAutoReplaceWords([])
    }
    setSelectedSuggestion(-1)
  }, [input, currentCell])

  const handleKeyDown = (e) => {
    const key = e.key.toUpperCase()

    if (key in QWERTY_TO_BRAILLE && !pressedKeys.has(key)) {
      e.preventDefault()

      const newPressedKeys = new Set(pressedKeys)
      newPressedKeys.add(key)
      setPressedKeys(newPressedKeys)

      setCurrentCell([...currentCell, key])
    }
    else if (e.key === " " && currentCell.length > 0) {
      e.preventDefault()

      const newInput = input + (input ? " " : "") + currentCell.join("")
      setInput(newInput)

      setCurrentCell([])
      setPressedKeys(new Set())
    }
    else if (e.key === "Backspace") {
      if (currentCell.length > 0) {
        e.preventDefault()

        const newCurrentCell = [...currentCell]
        newCurrentCell.pop()
        setCurrentCell(newCurrentCell)

        const newPressedKeys = new Set()
        for (const key of newCurrentCell) {
          newPressedKeys.add(key)
        }
        setPressedKeys(newPressedKeys)
      } else if (input.length > 0) {
        e.preventDefault()

        const cells = input.split(" ")
        cells.pop()
        setInput(cells.join(" "))
      }
    }
    // Handle suggestion selection with arrow keys
    else if (e.key === "ArrowDown" && suggestions.length > 0) {
      e.preventDefault()
      setSelectedSuggestion((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev))
      setSelectedAutoReplace(-1) // Clear auto-replace selection
    } else if (e.key === "ArrowUp" && suggestions.length > 0) {
      e.preventDefault()
      setSelectedSuggestion((prev) => (prev > 0 ? prev - 1 : 0))
      setSelectedAutoReplace(-1) // Clear auto-replace selection
    }
    // Handle auto-replace selection with Tab
    else if (e.key === "Tab" && autoReplaceWords.length > 0) {
      e.preventDefault()
      setSelectedAutoReplace((prev) => (prev + 1) % autoReplaceWords.length)
      setSelectedSuggestion(-1) // Clear suggestion selection
    }
    // Handle suggestion selection with Enter
    else if (e.key === "Enter" && selectedSuggestion >= 0) {
      e.preventDefault()
      applySuggestion(suggestions[selectedSuggestion])
    }
    // Handle auto-replace selection with Enter
    else if (e.key === "Enter" && selectedAutoReplace >= 0 && autoReplaceWords.length > 0) {
      e.preventDefault()
      applySuggestion(autoReplaceWords[selectedAutoReplace])
    }
    // Handle Enter to complete a word when no suggestion is selected
    else if (e.key === "Enter" && suggestions.length > 0 && selectedSuggestion === -1 && selectedAutoReplace === -1) {
      e.preventDefault()
      applySuggestion(suggestions[0])
    }
  }

  const handleKeyUp = (e) => {
    const key = e.key.toUpperCase()

    if (key in QWERTY_TO_BRAILLE) {
      const newPressedKeys = new Set(pressedKeys)
      newPressedKeys.delete(key)
      setPressedKeys(newPressedKeys)
    }
  }

  // Apply a suggestion
  const applySuggestion = (suggestion) => {
    setCompletedText([...completedText, suggestion])

    setInput("")
    setCurrentCell([])
    setPressedKeys(new Set())
    setSuggestions([])
    setAutoReplaceWords([])
    setSelectedAutoReplace(0)
  }

  const getEnglishTranslation = () => {
    if (!input && currentCell.length === 0) return ""

    const cells = parseQwertyInput(input + (currentCell.length > 0 ? " " + currentCell.join("") : ""))
    return brailleCellsToEnglish(cells)
  }

  const getCompletedTextBraille = () => {
    if (completedText.length === 0) return []

    const brailleWords = []

    for (const word of completedText) {
      const brailleWord = []

      for (const char of word.toLowerCase()) {
        if (englishToBraille.has(char)) {
          brailleWord.push([...englishToBraille.get(char)])
        }
      }

      brailleWords.push(brailleWord)
    }

    return brailleWords
  }

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return (
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
      {/* Main Content */}
      <div className="flex-1">
        {/* Completed Text Display */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <h2 className="text-lg font-semibold mb-2">Completed Text:</h2>
          <div className="min-h-[60px]">
            {completedText.length > 0 ? (
              <p className="text-xl">{completedText.join(" ")}</p>
            ) : (
              <p className="text-gray-400 italic">Your completed text will appear here</p>
            )}
          </div>
        </div>

        {/* Completed Text in Braille */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <h2 className="text-lg font-semibold mb-2">Completed Text in Braille:</h2>
          <div className="min-h-[80px]">
            {completedText.length > 0 ? (
              <div className="flex flex-wrap gap-4">
                {getCompletedTextBraille().map((word, wordIndex) => (
                  <div key={wordIndex} className="flex items-center">
                    {word.map((cell, cellIndex) => (
                      <BrailleCellDisplay key={`${wordIndex}-${cellIndex}`} cell={cell} size="small" />
                    ))}
                    {wordIndex < completedText.length - 1 && <div className="mx-2 text-gray-400">•</div>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic">Braille representation will appear here</p>
            )}
          </div>
        </div>

        {/* Current Input */}
        <div className="mb-6">
          <label className="block text-lg font-semibold mb-2">Current Input:</label>
          <div
            className="border rounded-lg p-3 min-h-[50px] focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white relative"
            tabIndex={0}
            ref={inputRef}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            onClick={() => inputRef.current && inputRef.current.focus()}
          >
            {input && <span className="mr-2">{input}</span>}
            {currentCell.length > 0 && <span className="bg-gray-200 px-1 rounded">{currentCell.join("")}</span>}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Type using D, W, Q, K, O, P keys for Braille dots 1-6. Press Space to complete a cell.
          </p>
        </div>

        {/* Auto-Replace Options */}
        {autoReplaceWords.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Auto-Replace Options:</h2>
            <div className="flex flex-wrap gap-2">
              {autoReplaceWords.map((word, index) => (
                <div
                  key={index}
                  className={`px-4 py-2 rounded-md cursor-pointer border ${
                    index === selectedAutoReplace
                      ? "bg-green-100 border-green-500 text-green-800 font-medium"
                      : "bg-gray-50 border-gray-300 hover:bg-gray-100"
                  }`}
                  onClick={() => {
                    setSelectedAutoReplace(index)
                    setSelectedSuggestion(-1)
                  }}
                  onDoubleClick={() => applySuggestion(word)}
                >
                  {word}
                  {index === selectedAutoReplace && <span className="ml-2 text-xs bg-green-200 px-1 rounded">Tab</span>}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Press Tab to cycle through options. Press Enter to select the highlighted option.
            </p>
          </div>
        )}

        {/* Braille Visualization */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Braille Visualization:</h2>
          <div className="p-4 bg-gray-50 rounded-lg border flex flex-wrap">
            {brailleCells.map((cell, index) => (
              <BrailleCellDisplay key={index} cell={cell} size="medium" />
            ))}
            {currentCell.length > 0 && (
              <BrailleCellDisplay cell={currentCell.map((k) => QWERTY_TO_BRAILLE[k]).sort()} size="medium" />
            )}
            {brailleCells.length === 0 && currentCell.length === 0 && (
              <p className="text-gray-400 italic">Braille cells will appear here</p>
            )}
          </div>
        </div>

        {/* English Translation */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">English Translation:</h2>
          <div className="p-4 bg-gray-50 rounded-lg border min-h-[50px]">
            {getEnglishTranslation() ? (
              <p className="text-xl">{getEnglishTranslation()}</p>
            ) : (
              <p className="text-gray-400 italic">English translation will appear here</p>
            )}
          </div>
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">All Suggestions:</h2>
            <div className="border rounded-lg overflow-hidden">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={`p-3 cursor-pointer hover:bg-gray-100 flex justify-between items-center ${
                    index === selectedSuggestion ? "bg-blue-100" : ""
                  }`}
                  onClick={() => {
                    setSelectedSuggestion(index)
                    setSelectedAutoReplace(-1)
                  }}
                  onDoubleClick={() => applySuggestion(suggestion)}
                >
                  <span className={index === selectedSuggestion ? "font-medium" : ""}>{suggestion}</span>
                  {index === selectedSuggestion && (
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                      onClick={(e) => {
                        e.stopPropagation()
                        applySuggestion(suggestion)
                      }}
                    >
                      Select
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Use arrow keys to navigate suggestions. Press Enter to select the highlighted suggestion.
            </p>
          </div>
        )}
      </div>

      {/* Sidebar: Keyboard Display & Instructions */}
      <div className="w-full md:w-80 flex-shrink-0">
        {/* Keyboard Display */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {Object.entries(QWERTY_TO_BRAILLE).map(([key, dot]) => (
            <div
              key={key}
              className={`border rounded-lg p-3 text-center ${pressedKeys.has(key) ? "bg-blue-500 text-white" : ""}`}
            >
              <span className="text-lg font-medium">{key}</span>
              <span className="block text-sm">(Dot {dot})</span>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
          <p className="font-medium text-base mb-2">Instructions:</p>
          <ul className="list-disc pl-5">
            <li>Press D, W, Q, K, O, P keys to input Braille dots</li>
            <li>Press multiple keys simultaneously for a single Braille cell</li>
            <li>Press Space to complete a cell and add it to the input</li>
            <li>Press Backspace to delete the last input</li>
            <li>Press Tab to cycle through auto-replace options</li>
            <li>Use arrow keys to navigate all suggestions</li>
            <li>Press Enter to select the highlighted suggestion or auto-replace option</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default BrailleAutocorrect
