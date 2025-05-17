# Braille Autocorrect and Suggestion System

A sophisticated autocorrect and suggestion system for Braille input using the QWERTY keyboard format. This project aims to improve the typing experience for visually impaired individuals by providing real-time suggestions, auto-correction, and visual feedback.

## Features

- **Efficient Word Lookup**: Uses a Trie data structure for fast dictionary searches
- **Similarity Matching**: Implements Levenshtein distance algorithm optimized for Braille cells
- **Learning Mechanism**: Improves suggestions based on user's previous inputs
- **Real-time Suggestions**: Optimized for speed to support large dictionaries
- **Auto-replace Options**: Shows top 3 suggestions for quick selection

## Installation

1. **Clone the repository**


```bash
git clone https://github.com/akash-kumar-dev/braille-autocorrect.git
cd braille-autocorrect
```

2. **Install dependencies**

```bash
npm install

```

3. **Run the development server**

```bash
npm run start
```

## Technical Approach

### Data Structures

1. **Trie**: For efficient dictionary storage and prefix matching
2. **Levenshtein Distance**: For finding similar words, optimized for Braille cells

### Algorithms

1. **Word Suggestion**:
   - First attempts exact matching using the Trie
   - If no exact match, finds similar words using Levenshtein distance
   - Ranks suggestions by similarity and user frequency
   - Returns the top N suggestions

2. **Learning Mechanism**:
   - Tracks word usage frequency
   - Prioritizes frequently used words in ambiguous cases
   - Adapts to user's typing patterns over time

## Usage

### QWERTY Braille Typing Format

The system uses the following key mapping for Braille dots:

- **D** → Dot 1 (top left)
- **W** → Dot 2 (middle left)
- **Q** → Dot 3 (bottom left)
- **K** → Dot 4 (top right)
- **O** → Dot 5 (middle right)
- **P** → Dot 6 (bottom right)

1. Type using the D, W, Q, K, O, P keys to input Braille dots
2. Press Space to complete a cell
3. See the Braille visualization and English translation update in real-time
4. Press Tab to cycle through auto-replace options
5. Press Enter to select the highlighted suggestion

## How It Works

1. **Input Parsing:**
   - QWERTY keys (D, W, Q, K, O, P) are mapped to Braille dots (1-6)
   - Multiple keys pressed simultaneously form a single Braille cell
   - Cells are separated by spaces

2. **Suggestion Generation:**
   - First attempts exact matching using the Trie
   - If no exact match, finds similar words using Levenshtein distance
   - Ranks suggestions by similarity and user frequency
   - Returns the top N suggestions

3. **Learning Mechanism:**
   - Tracks word usage frequency
   - Prioritizes frequently used words in ambiguous cases
   - Adapts to user's typing patterns over time
