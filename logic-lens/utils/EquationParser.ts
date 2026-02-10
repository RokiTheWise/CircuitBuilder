// src/utils/EquationParser.ts

const getVar = (i: number) => String.fromCharCode(65 + i);

export function parseEquationToTable(equation: string, numInputs: number): Record<number, number> | null {
  // 1. TOKENIZE: Split by EVERY character to separate "ABC" into "A", "B", "C"
  const tokens = equation
    .toUpperCase()
    .replace(/[\u2018\u2019`]/g, "'") // Handle smart quotes
    .replace(/\s+/g, '')              // Remove spaces
    .split('')                        // Split into individual chars
    .filter(t => /[A-Z+()']/.test(t)); // Keep only valid logic characters

  let pos = 0;

  function peek() { return tokens[pos]; }
  function consume() { return tokens[pos++]; }
  
  // 2. Parser Functions
  function parseExpression(): boolean {
    let left = parseTerm();
    while (peek() === '+') {
      consume();
      const right = parseTerm();
      left = left || right;
    }
    return left;
  }
  
  function parseTerm(): boolean {
    let left = parseFactor();
    while (pos < tokens.length && peek() !== '+' && peek() !== ')') {
      const right = parseFactor();
      left = left && right;
    }
    return left;
  }

  function parseFactor(): boolean {
    let val: boolean;
    const token = consume();

    if (token === '(') {
      val = parseExpression();
      if (consume() !== ')') throw new Error("Expected )");
    } else if (token && /^[A-Z]$/.test(token)) {
      const varIndex = token.charCodeAt(0) - 65;
      if (varIndex >= numInputs || varIndex < 0) throw new Error("Unknown Var");
      val = !!scope[varIndex];
    } else {
      throw new Error("Unexpected token");
    }

    while (peek() === "'") {
      consume();
      val = !val;
    }
    return val;
  }

  // 3. Execution Loop
  const table: Record<number, number> = {};
  const maxRows = Math.pow(2, numInputs);
  let scope: boolean[] = [];

  try {
    for (let i = 0; i < maxRows; i++) {
      const binary = i.toString(2).padStart(numInputs, '0');
      scope = binary.split('').map(b => b === '1');

      pos = 0;
      const result = parseExpression();
      
      if (pos < tokens.length) return null;

      table[i] = result ? 1 : 0;
    }
    return table;
  } catch (e) {
    return null;
  }
}