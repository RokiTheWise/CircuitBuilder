import Link from "next/link";
import {
  FiArrowLeft,
  FiCpu,
  FiTable,
  FiZap,
  FiLayout,
  FiCode,
} from "react-icons/fi";

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      {/* NAVIGATION */}
      <nav className="border-b bg-white p-4 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link
            href="/"
            className="flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 transition-colors"
          >
            <FiArrowLeft /> Back to Tool
          </Link>
          <h1 className="text-xl font-black tracking-tight">
            Logi<span className="text-blue-600">Sketch</span>{" "}
            <span className="text-slate-400 font-medium">Internal Docs</span>
          </h1>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-16">
        <header className="mb-20">
          <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tighter leading-tight">
            The Architecture of Logic
          </h2>
          <p className="text-xl text-slate-500 leading-relaxed max-w-2xl">
            LogiSketch is a reactive system that synchronizes human-readable
            equations with mathematical truth tables and directed acyclic graphs
            (DAGs).
          </p>
        </header>

        {/* 01. RECURSIVE DESCENT EVALUATOR */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-6 text-blue-600">
            <FiCpu className="text-3xl" />
            <h3 className="text-2xl font-black uppercase tracking-tight">
              01. Recursive Descent Evaluator
            </h3>
          </div>
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div className="text-slate-600 space-y-4">
              <p>
                The <code>EquationParser.ts</code> utilizes a{" "}
                <strong>top-down recursive descent</strong> approach. Rather
                than constructing a persistent Abstract Syntax Tree (AST), the
                parser acts as an evaluator parameterized by a variable scope.
              </p>
              <p className="text-sm italic">
                This enables highly efficient truth-table generation by directly
                computing Boolean results for each variable assignment without
                the overhead of additional memory allocation.
              </p>
              <ul className="space-y-2 list-disc pl-5 text-sm">
                <li>
                  <strong>Expression (OR)</strong>: Lowest precedence, handles{" "}
                  <code>+</code>.
                </li>
                <li>
                  <strong>Term (AND)</strong>: Middle precedence, handles
                  implicit multiplication (e.g., <code>AB</code>).
                </li>
                <li>
                  <strong>Factor (NOT/Atom)</strong>: Highest precedence,
                  handles <code>'</code>, constants <code>0/1</code>, and
                  variables (A–E).
                </li>
              </ul>
            </div>
            <div className="bg-slate-900 rounded-xl p-6 shadow-2xl">
              <div className="flex gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <pre className="text-[11px] font-mono text-blue-300 leading-relaxed">
                {`function parseTerm(): boolean {
  let left = parseFactor();
  // Continues until a lower-precedence 
  // delimiter (+ or )) is encountered.
  while (peek() !== '+' && peek() !== ')') {
    const right = parseFactor();
    left = left && right; // Logical Conjunction
  }
  return left;
}`}
              </pre>
            </div>
          </div>
        </section>

        {/* 02. QUINE-MCCLUSKEY REDUCTION */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-6 text-purple-600">
            <FiZap className="text-3xl" />
            <h3 className="text-2xl font-black uppercase tracking-tight">
              02. Boolean Reduction (QMC)
            </h3>
          </div>
          <p className="text-slate-600 mb-8 leading-relaxed">
            To ensure the generated circuit is optimized, LogiSketch implements
            the <strong>Quine-McCluskey Algorithm</strong>. This process finds
            the minimum Sum-of-Products (SOP) form by merging minterms that
            differ by a single bit.
          </p>

          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm overflow-hidden">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-black text-slate-800 mb-1">
                  2<sup>n</sup>
                </div>
                <div className="text-[10px] uppercase font-bold text-slate-400">
                  Identify Minterms
                </div>
              </div>
              <div>
                <div className="text-3xl font-black text-purple-600 mb-1">
                  Gray
                </div>
                <div className="text-[10px] uppercase font-bold text-slate-400">
                  Hamming Distance Check
                </div>
              </div>
              <div>
                <div className="text-3xl font-black text-blue-600 mb-1">
                  SOP
                </div>
                <div className="text-[10px] uppercase font-bold text-slate-400">
                  Minimal Prime Implicants
                </div>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-slate-50">
              <p className="text-xs text-slate-500 italic">
                "The algorithm iteratively identifies prime implicants by
                replacing differing bits with dashes. For example,{" "}
                <code className="text-purple-600 font-bold bg-slate-50 px-1 rounded">
                  110
                </code>{" "}
                and
                <code className="text-purple-600 font-bold bg-slate-50 px-1 rounded">
                  111
                </code>{" "}
                merge into
                <code className="text-purple-600 font-bold bg-slate-50 px-1 rounded">
                  11-
                </code>
                , representing the term{" "}
                <code className="text-blue-600 font-bold bg-slate-50 px-1 rounded">
                  AB
                </code>{" "}
                independent of
                <code className="text-blue-600 font-bold bg-slate-50 px-1 rounded">
                  C
                </code>
                ."
              </p>
            </div>
          </div>
        </section>

        {/* 03. TWO-WAY BINDING */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-6 text-emerald-600">
            <FiTable className="text-3xl" />
            <h3 className="text-2xl font-black uppercase tracking-tight">
              03. TWO-WAY BINDING
            </h3>
          </div>
          <p className="text-slate-600 mb-8 leading-relaxed">
            LogiSketch features <strong>Bidirectional Reactivity</strong>. The
            state remains consistent whether you modify the logic from the
            equation or the table:
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
              <h4 className="font-bold text-emerald-900 mb-2">Top-Down Flow</h4>
              <p className="text-sm text-emerald-700">
                Parsing an equation evaluates it against the
                <code className="mx-1 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold">
                  2ⁿ
                </code>
                truth table rows, reflecting the new logic across the entire
                grid.
              </p>
            </div>
            <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
              <h4 className="font-bold text-blue-900 mb-2">Bottom-Up Flow</h4>
              <p className="text-sm text-blue-700">
                Toggling a cell triggers the <strong>QMC reduction</strong> to
                synthesize the simplest possible equation matching that specific
                output pattern.
              </p>
            </div>
          </div>
        </section>

        {/* 04. GRAPH SYNTHESIS */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-6 text-orange-600">
            <FiLayout className="text-3xl" />
            <h3 className="text-2xl font-black uppercase tracking-tight">
              04. Universal Logic Synthesis
            </h3>
          </div>
          <p className="text-slate-600 mb-6 leading-relaxed">
            The prime implicants are transformed into a{" "}
            <strong>Directed Acyclic Graph (DAG)</strong>. LogiSketch applies De
            Morgan's Laws to handle functional completeness in NAND/NOR modes:
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center font-bold text-purple-600">
                NAND
              </div>
              <div className="text-sm text-slate-600">
                Standard <strong>AND-OR</strong> logic is synthesized as{" "}
                <strong>NAND-NAND</strong>, utilizing double negation to
                maintain equivalence.
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center font-bold text-orange-600">
                NOR
              </div>
              <div className="text-sm text-slate-600">
                Uses the <strong>OR-AND</strong> dual form, optimized via shared
                inverters to minimize total gate count.
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-32 pt-10 border-t border-slate-200 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
            Designed by Dexter Jethro Enriquez
          </p>
          <div className="flex justify-center gap-8 mb-8">
            <a
              href="https://djenriquez.dev"
              className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] hover:text-blue-700 transition-colors"
            >
              Portfolio
            </a>
            <a
              href="https://github.com/RokiTheWise/CircuitBuilder"
              className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] hover:text-blue-700 transition-colors"
            >
              GitHub
            </a>
          </div>
          <div className="flex justify-center gap-4">
            <Link
              href="/"
              className="px-10 py-4 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
            >
              Launch Studio
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
