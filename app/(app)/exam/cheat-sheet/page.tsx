'use client';

import { Printer, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useScope } from '@/lib/use-scope';
import { MODULES } from '@/lib/data/curriculum';
import { COURSE_INFO } from '@/lib/data/exam';

export default function CheatSheetPage() {
  const { scope, isIn } = useScope();
  const isPartial = scope === 'partial';
  const activeModules = MODULES.filter((m) => isIn(m.weeks));

  const print = () => {
    if (typeof window !== 'undefined') window.print();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto print:max-w-none print:m-0 print:p-0 print:text-black">
      {/* Screen-only navigation bar */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          href="/exam"
          className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Exam Prep
        </Link>
        <button
          onClick={print}
          className="px-3.5 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium inline-flex items-center gap-1.5 shadow"
        >
          <Printer className="h-3.5 w-3.5" /> Print / Save as PDF
        </button>
      </div>

      <header className="border-b pb-4 border-border/80 print:border-black">
        <h1 className="text-2xl font-bold">{COURSE_INFO.name} — Exam Reference Sheet</h1>
        <p className="text-xs text-muted-foreground print:text-gray-700 mt-1">
          {COURSE_INFO.year} · {COURSE_INFO.lecturers} · Scope:{' '}
          <strong className="text-foreground print:text-black">
            {isPartial ? 'Partial Exam (Weeks 1–7)' : 'Final Exam (All Weeks 1–11)'}
          </strong>
        </p>
      </header>

      {/* 1. Core Formulas & Constants */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-primary print:text-black uppercase tracking-wider text-xs border-b border-border/60 pb-1">
          1. Key Formulas &amp; Quantitative Principles
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 text-xs">
          <div className="panel print:border print:border-gray-300 p-3 rounded space-y-1">
            <p className="font-semibold text-foreground print:text-black">Resting Membrane &amp; Hodgkin-Huxley</p>
            <p className="text-muted-foreground print:text-gray-800">
              Vm ≈ −70 mV. Na⁺/K⁺ pump: 3 Na⁺ out, 2 K⁺ in per ATP.
            </p>
            <p className="text-muted-foreground print:text-gray-800">
              ENa ≈ +50 mV, EK ≈ −77 mV.
            </p>
            <p className="text-muted-foreground print:text-gray-800">
              Threshold ≈ −55 mV (all-or-none voltage-gated Na⁺ channel opening).
            </p>
          </div>

          <div className="panel print:border print:border-gray-300 p-3 rounded space-y-1">
            <p className="font-semibold text-foreground print:text-black">Donders Subtractive Method</p>
            <p className="text-muted-foreground print:text-gray-800">
              Duration of stage = RT(task with stage) − RT(task without stage).
            </p>
            <p className="text-muted-foreground print:text-gray-800">
              Assumes <em>pure insertion</em> (adding a mental stage leaves other stages unaffected).
            </p>
          </div>

          <div className="panel print:border print:border-gray-300 p-3 rounded space-y-1">
            <p className="font-semibold text-foreground print:text-black">Mental Chronometry &amp; Rotation</p>
            <p className="text-muted-foreground print:text-gray-800">
              Shepard &amp; Metzler: RT = a + b · θ (linear slope with angular difference).
            </p>
            <p className="text-muted-foreground print:text-gray-800">
              Fingerprint of continuous analogue internal representation.
            </p>
          </div>

          <div className="panel print:border print:border-gray-300 p-3 rounded space-y-1">
            <p className="font-semibold text-foreground print:text-black">Electrophysiology &amp; ERP Markers</p>
            <p className="text-muted-foreground print:text-gray-800">
              <strong>N400:</strong> Negative peak ~400 ms post-stimulus = semantic violation / unexpected word.
            </p>
            <p className="text-muted-foreground print:text-gray-800">
              <strong>P600:</strong> Positive peak ~600 ms post-stimulus = syntactic agreement error.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Neurotransmitter & Drug Matrix */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-primary print:text-black uppercase tracking-wider text-xs border-b border-border/60 pb-1">
          2. Neurotransmitters, Receptors &amp; Drugs
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/80 print:border-black text-muted-foreground print:text-black">
                <th className="py-1.5 px-2">Transmitter</th>
                <th className="py-1.5 px-2">Primary Origin Nucleus</th>
                <th className="py-1.5 px-2">Key Receptors</th>
                <th className="py-1.5 px-2">Pharmacology Examples</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 print:divide-gray-300">
              <tr>
                <td className="py-1.5 px-2 font-medium">Acetylcholine (ACh)</td>
                <td className="py-1.5 px-2 text-muted-foreground print:text-gray-800">Basal forebrain / Medial septum</td>
                <td className="py-1.5 px-2 text-muted-foreground print:text-gray-800">Nicotinic (ionotropic), Muscarinic (metabotropic)</td>
                <td className="py-1.5 px-2 text-muted-foreground print:text-gray-800">Botulinum (blocks SNARE), Curare (blocks nAChR)</td>
              </tr>
              <tr>
                <td className="py-1.5 px-2 font-medium">Dopamine (DA)</td>
                <td className="py-1.5 px-2 text-muted-foreground print:text-gray-800">Substantia Nigra (SNc) &amp; VTA</td>
                <td className="py-1.5 px-2 text-muted-foreground print:text-gray-800">D1-like (Gs, excitatory), D2-like (Gi, inhibitory)</td>
                <td className="py-1.5 px-2 text-muted-foreground print:text-gray-800">L-DOPA (synthesis precursor), Cocaine (DAT blocker)</td>
              </tr>
              <tr>
                <td className="py-1.5 px-2 font-medium">Serotonin (5-HT)</td>
                <td className="py-1.5 px-2 text-muted-foreground print:text-gray-800">Raphe Nuclei (brainstem)</td>
                <td className="py-1.5 px-2 text-muted-foreground print:text-gray-800">5-HT1–7 (mostly GPCRs, 5-HT3 is ionotropic)</td>
                <td className="py-1.5 px-2 text-muted-foreground print:text-gray-800">Fluoxetine / SSRIs (SERT reuptake blocker)</td>
              </tr>
              <tr>
                <td className="py-1.5 px-2 font-medium">GABA</td>
                <td className="py-1.5 px-2 text-muted-foreground print:text-gray-800">Local interneurons throughout CNS</td>
                <td className="py-1.5 px-2 text-muted-foreground print:text-gray-800">GABA-A (Cl⁻ channel), GABA-B (K⁺ coupled GPCR)</td>
                <td className="py-1.5 px-2 text-muted-foreground print:text-gray-800">Benzodiazepines (PAM at GABA-A), Alcohol</td>
              </tr>
              <tr>
                <td className="py-1.5 px-2 font-medium">Glutamate</td>
                <td className="py-1.5 px-2 text-muted-foreground print:text-gray-800">Primary excitatory projection neurons</td>
                <td className="py-1.5 px-2 text-muted-foreground print:text-gray-800">AMPA (Na⁺ influx), NMDA (Ca²⁺ influx, Mg²⁺ blocked)</td>
                <td className="py-1.5 px-2 text-muted-foreground print:text-gray-800">Ketamine / PCP (NMDA non-competitive antagonists)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Aphasia Bedside Triad */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-primary print:text-black uppercase tracking-wider text-xs border-b border-border/60 pb-1">
          3. Classic Aphasia Classification (Bedside Triad)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/80 print:border-black text-muted-foreground print:text-black">
                <th className="py-1 px-2">Syndrome</th>
                <th className="py-1 px-2">Fluency</th>
                <th className="py-1 px-2">Comprehension</th>
                <th className="py-1 px-2">Repetition</th>
                <th className="py-1 px-2">Anatomical Correlate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 print:divide-gray-300">
              <tr>
                <td className="py-1 px-2 font-medium">Broca&apos;s</td>
                <td className="py-1 px-2 text-destructive font-semibold">Nonfluent</td>
                <td className="py-1 px-2 text-success">Intact</td>
                <td className="py-1 px-2 text-destructive font-semibold">Impaired</td>
                <td className="py-1 px-2 text-muted-foreground print:text-gray-800">Left IFG (Brodmann 44/45)</td>
              </tr>
              <tr>
                <td className="py-1 px-2 font-medium">Wernicke&apos;s</td>
                <td className="py-1 px-2 text-success">Fluent (paraphasic)</td>
                <td className="py-1 px-2 text-destructive font-semibold">Impaired</td>
                <td className="py-1 px-2 text-destructive font-semibold">Impaired</td>
                <td className="py-1 px-2 text-muted-foreground print:text-gray-800">Left posterior STG (BA 22)</td>
              </tr>
              <tr>
                <td className="py-1 px-2 font-medium">Conduction</td>
                <td className="py-1 px-2 text-success">Fluent</td>
                <td className="py-1 px-2 text-success">Intact</td>
                <td className="py-1 px-2 text-destructive font-semibold">Impaired</td>
                <td className="py-1 px-2 text-muted-foreground print:text-gray-800">Arcuate fasciculus / Supramarginal gyrus</td>
              </tr>
              <tr>
                <td className="py-1 px-2 font-medium">Global</td>
                <td className="py-1 px-2 text-destructive font-semibold">Nonfluent</td>
                <td className="py-1 px-2 text-destructive font-semibold">Impaired</td>
                <td className="py-1 px-2 text-destructive font-semibold">Impaired</td>
                <td className="py-1 px-2 text-muted-foreground print:text-gray-800">Extensive perisylvian MCA territory</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Complete Learning Goals Checklist */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-primary print:text-black uppercase tracking-wider text-xs border-b border-border/60 pb-1">
          4. Official Course Learning Goals ({isPartial ? 'Partial Exam: Modules 1–5' : 'Final Exam: All Modules 1–8'})
        </h2>
        <div className="space-y-4">
          {activeModules.map((m) => (
            <div key={m.id} className="space-y-1.5 text-xs">
              <p className="font-semibold text-foreground print:text-black">
                Module {m.number}: {m.title} ({m.weekLabel})
              </p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground print:text-gray-800">
                {m.goals.map((g, idx) => (
                  <li key={idx}>{g}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
