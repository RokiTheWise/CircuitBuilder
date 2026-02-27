
const toBin = (n: number, pad: number) => n.toString(2).padStart(pad, '0');
const getVar = (i: number) => String.fromCharCode(65 + i);

// 1. THE CORE SOLVER (Returns raw patterns like "1-0-")
export function getPrimeImplicants(numInputs: number, outputs: Record<number, number>): string[] {
  const maxRows = Math.pow(2, numInputs);
  const minterms = Object.keys(outputs)
    .map(Number)
    .filter(i => i < maxRows && outputs[i] === 1);

  if (minterms.length === 0) return [];
  if (minterms.length === maxRows) return [Array(numInputs).fill('-').join('')];

  const mintermBins = minterms.map(m => toBin(m, numInputs));
  let groups = new Set<string>(mintermBins);
  let primeImplicants = new Set<string>();

  // --- STEP 1: Find ALL Prime Implicants ---
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
  
  const piArray = Array.from(primeImplicants);

  // --- STEP 2: The Prime Implicant Chart  ---
  
  // Helper to check if a prime implicant covers a minterm
  const covers = (pi: string, m: string) => {
    for(let i = 0; i < pi.length; i++) {
      if(pi[i] !== '-' && pi[i] !== m[i]) return false;
    }
    return true;
  };

  // Map out which minterms each Prime Implicant covers
  const piCovers = new Map<string, string[]>();
  piArray.forEach(pi => piCovers.set(pi, mintermBins.filter(m => covers(pi, m))));

  const essential = new Set<string>();
  let remainingMinterms = new Set<string>(mintermBins);

  // Find Essential Prime Implicants (Minterms covered by ONLY ONE prime implicant)
  mintermBins.forEach(m => {
    const coveringPIs = piArray.filter(pi => covers(pi, m));
    if (coveringPIs.length === 1) {
       essential.add(coveringPIs[0]);
    }
  });

  // Remove the minterms that are already covered by the essentials
  essential.forEach(pi => {
    piCovers.get(pi)?.forEach(m => remainingMinterms.delete(m));
  });

  // If everything is covered, we just return the essentials! (This fixes your ABC + A'CD bug)
  if (remainingMinterms.size === 0) {
      return Array.from(essential);
  }

// --- STEP 3: Handle leftover minterms (Petrick's Method simulation) ---
  const remainingPIs = piArray.filter(pi => !essential.has(pi));
  let bestAdditionalCover: string[] = remainingPIs; 

  // Calculate cost (Fewer terms is vastly more important, fewer literals is the tie-breaker)
  const getCost = (cover: string[]) => {
      let literals = 0;
      cover.forEach(term => {
          for(let char of term) if (char !== '-') literals++;
      });
      // 100 points per term, 1 point per literal (e.g., 2 terms with 3 total vars = 203 cost)
      return (cover.length * 100) + literals; 
  };

  const solve = (currentCover: string[], uncov: Set<string>, availablePIs: string[]) => {
      if (uncov.size === 0) {
         if (getCost(currentCover) < getCost(bestAdditionalCover)) {
             bestAdditionalCover = [...currentCover];
         }
         return;
      }
      
      // FAIL: Ran out of options
      if (availablePIs.length === 0) return;
      
      // PRUNE: If current path is already worse/equal in terms than the best, stop digging
      if (currentCover.length >= bestAdditionalCover.length) return; 

      const nextMinterm = Array.from(uncov)[0];
      const candidatePIs = availablePIs.filter(pi => covers(pi, nextMinterm));

      for (const pi of candidatePIs) {
          const newUncov = new Set(uncov);
          piCovers.get(pi)?.forEach(m => newUncov.delete(m));
          solve([...currentCover, pi], newUncov, availablePIs.filter(p => p !== pi));
      }
  };

  if (remainingMinterms.size > 0) {
      solve([], remainingMinterms, remainingPIs);
  }
  
  // Combine essentials with the best additional coverage
  return Array.from(essential).concat(bestAdditionalCover);
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