// src/utils/EquationParser.ts

const getVar = (i: number) => String.fromCharCode(65 + i);

export function parseEquationToTable(equation: string, numInputs: number): Record<number, number> | null {
  // 1. TOKENIZE
  const tokens = equation
    .toUpperCase()
    .replace(/[\u2018\u2019`]/g, "'") 
    .replace(/\s+/g, '')              
    .split('')                        
    // UPDATE: Add 0 and 1 to the regex allowlist
    .filter(t => /[A-Z0-1+()']/.test(t)); 

  let pos = 0;

  function peek() { return tokens[pos]; }
  function consume() { return tokens[pos++]; }
  
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
      // Variable A-E
      const varIndex = token.charCodeAt(0) - 65;
      if (varIndex >= numInputs || varIndex < 0) throw new Error("Unknown Var");
      val = !!scope[varIndex];
    } else if (token === '0') {
      // UPDATE: Handle Constant 0
      val = false;
    } else if (token === '1') {
      // UPDATE: Handle Constant 1
      val = true;
    } else {
      throw new Error("Unexpected token");
    }

    while (peek() === "'") {
      consume();
      val = !val;
    }
    return val;
  }

  // ... Execution Loop stays the same ...
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