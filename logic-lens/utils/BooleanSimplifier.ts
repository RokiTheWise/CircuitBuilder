
const toBin = (n: number, pad: number) => n.toString(2).padStart(pad, '0');
const getVar = (i: number) => String.fromCharCode(65 + i);

// 1. THE CORE SOLVER (Returns raw patterns like "1-0-")
export function getPrimeImplicants(numInputs: number, outputs: Record<number, number>): string[] {
  // SAFETY FILTER: Calculate the maximum valid row index (e.g., 2^1 = 2 rows: 0 and 1)
  const maxRows = Math.pow(2, numInputs);

  const minterms = Object.keys(outputs)
    .map(Number)
    // CRITICAL FIX: Ignore "ghost" rows from previous larger tables
    .filter(i => i < maxRows && outputs[i] === 1);

  if (minterms.length === 0) return [];
  // If all valid rows are 1, return a single term of all dashes
  if (minterms.length === maxRows) return [Array(numInputs).fill('-').join('')];

  let groups = new Set<string>(minterms.map(m => toBin(m, numInputs)));
  let primeImplicants = new Set<string>();

  // Quine-McCluskey Algorithm
  while (groups.size > 0) {
    const nextGroups = new Set<string>();
    const used = new Set<string>();
    const sorted = Array.from(groups).sort();

    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        const s1 = sorted[i];
        const s2 = sorted[j];

        let diffIdx = -1;
        let diffCount = 0;
        for (let k = 0; k < numInputs; k++) {
          if (s1[k] !== s2[k]) {
            diffIdx = k;
            diffCount++;
          }
        }

        if (diffCount === 1) {
          const combined = s1.substring(0, diffIdx) + '-' + s1.substring(diffIdx + 1);
          nextGroups.add(combined);
          used.add(s1);
          used.add(s2);
        }
      }
    }

    sorted.forEach(s => {
      if (!used.has(s)) primeImplicants.add(s);
    });

    if (nextGroups.size === 0) break; 
    groups = nextGroups;
  }
  
  return Array.from(primeImplicants);
}

// 2. THE FORMATTER (Returns "A + B")
export function getSimplifiedEquation(numInputs: number, outputs: Record<number, number>): string {
  // This will now use the clean, filtered implicants
  const implicants = getPrimeImplicants(numInputs, outputs);
  
  if (implicants.length === 0) return "0";
  // Check if it's a "Always True" case (all dashes)
  if (implicants[0].split('').every(c => c === '-')) return "1";

  const terms = implicants.map(term => {
    let part = "";
    for (let i = 0; i < term.length; i++) {
      if (term[i] === '1') part += getVar(i);
      if (term[i] === '0') part += getVar(i) + "'";
    }
    return part || "1";
  });

  return terms.sort((a, b) => a.length - b.length || a.localeCompare(b)).join(" + ");
}