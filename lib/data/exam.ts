/**
 * Exam logistics, weekly plan and study guidance for Biological & Cognitive Psychology
 * (VU Amsterdam, Bachelor year 1, 2026-2027), transcribed from the official course manual
 * and the "How should I study" guide. Sources of truth for the exam-prep page.
 */

export interface ExamInfo {
  id: 'midterm' | 'final' | 'resit';
  name: string;
  date: string;
  time: string;
  questions: number;
  weeks: string;
  material: string[];
  note: string;
}

export const EXAMS: ExamInfo[] = [
  {
    id: 'midterm',
    name: 'Midterm exam (Part 1)',
    date: 'Wednesday 17 December 2026',
    time: '18:45 – 21:00',
    questions: 60,
    weeks: 'Weeks 1–7',
    material: [
      'Carlson & Birkett: Ch. 1–3, 4 (pp. 110–131), 6, 8, 14',
      'Cognitive Psychology syllabus: Ch. 1–6 & 9',
      'Lecture materials & PowerPoint presentations',
      'Tutorials & weekly quizzes',
    ],
    note: 'Covers the learning goals of the first seven weeks.',
  },
  {
    id: 'final',
    name: 'Final exam (Part 1 & Part 2)',
    date: 'Monday 26 January 2027',
    time: '08:30 – 10:45',
    questions: 60,
    weeks: 'All weeks (1–11)',
    material: [
      'Carlson & Birkett: Ch. 1–3, 4 (pp. 110–131), 6, 8, 9, 11, 13, 14, 18 (pp. 581–591)',
      'Cognitive Psychology syllabus: Ch. 1–9',
      'Lecture materials & PowerPoint presentations',
      'Tutorials & weekly quizzes',
    ],
    note: 'Covers all learning goals of the course. Your average of midterm + final ≥ 5.5 passes the course (one grade may compensate the other).',
  },
  {
    id: 'resit',
    name: 'Resit (Part 1 & Part 2)',
    date: 'April 2027 (date TBC)',
    time: 'TBC',
    questions: 60,
    weeks: 'All weeks',
    material: ['Same material as the final exam'],
    note: 'If you take the resit, its grade is your final grade for the course. Pass ≥ 5.5.',
  },
];

export const COURSE_INFO = {
  name: 'Biological & Cognitive Psychology',
  year: 'Bachelor year 1 · 2026–2027 · 9 ECTS',
  lecturers: 'Dr. Dennis van ‘t Ent & Dr. Richard Godijn',
  book: 'Carlson, N.R. & Birkett, M.A. (2021). Physiology of Behavior (13th ed.). Pearson.',
  syllabus: 'Cognitive Psychology syllabus, Chapters 1–9 (Canvas)',
  format: 'Two lectures + one tutorial per week (no tutorials after the midterm). Each exam: 60 multiple-choice questions.',
  weekLabel: (w: number) => (w === 8 ? 'Midterm week' : w === 12 ? 'Final week' : `Week ${w}`),
};

export interface PlanWeek {
  week: number;
  dates: string;
  lectures: string;
  book: string;
  /** Module that covers this week's content, if any. */
  module?: string;
  /** Official per-week learning goals ("I know / I understand …") from the study guide. */
  goals: string[];
}

export const WEEK_PLAN: PlanWeek[] = [
  {
    week: 1,
    dates: '28 & 30 Oct',
    lectures: 'Introduction · Approaches in cognitive neuroscience',
    book: 'Carlson 1 · Syllabus 1–2',
    module: 'm1',
    goals: [
      'I know how cognitive neuroscience came to be (historical foundations of biological & cognitive psychology).',
      'I know the different approaches in cognitive neuroscience and can explain their advantages and disadvantages.',
      'I understand how communication in the brain works, and how neurons are involved.',
    ],
  },
  {
    week: 2,
    dates: '4 & 6 Nov',
    lectures: 'Structure and functions of cells · From neuron to cognition',
    book: 'Carlson 2 · Syllabus 3',
    module: 'm1',
    goals: [
      'I know what types of neurons and glial cells exist and their role in the CNS.',
      'I know the important structures of neurons and their functions.',
      'I know how the membrane potential is supported.',
      'I know what an action potential is and how it works, and how action potentials are conducted over the axon.',
      'I understand what the neuro methods are, how they work, and the pros and cons of each — and can link case studies to methods.',
      'I understand how reaction-time measures inform us about cognitive processes, like attention.',
    ],
  },
  {
    week: 3,
    dates: '11 & 13 Nov',
    lectures: 'Neurotransmission & psychopharmacology · From brain to cognition',
    book: 'Carlson 2 (pp. 58–69), 4 (pp. 102–105, 110–131) · Syllabus 4',
    module: 'm2',
    goals: [
      'I understand how neurotransmission works in the pre-synaptic, synaptic and postsynaptic stages.',
      'I know how neurotransmitter concentration is regulated and how neurotransmitters induce postsynaptic potentials.',
      'I know what types of neurotransmitters and neuromodulators exist and how they differ.',
      'I can explain how different kinds of drugs influence neurotransmission (the ones from lectures/tutorial).',
      'I understand how information flows through the brain bottom-up and top-down, and the differences.',
      'I know how visual information travels to higher brain areas.',
      'I understand the relationship between perception and imagery, and how brain regions cooperate in working memory and imagery.',
      'I know where faces are perceived and what happens when visual areas are damaged.',
    ],
  },
  {
    week: 4,
    dates: '18 & 20 Nov',
    lectures: 'Biology of visual perception · Cognition of perception',
    book: 'Carlson 6 · Syllabus 5',
    module: 'm3',
    goals: [
      'I understand how visual information is processed from eye to brain, and which areas do primary and higher-order visual processing.',
      'I know which sensory functions are based in the retina and which cells serve them.',
      'I know the cell types in primary visual cortex and their functions.',
      'I understand how (visual) perception works.',
      'I understand how the constructive nature of perception results in illusions, and what illusions tell us about perception.',
    ],
  },
  {
    week: 5,
    dates: '25 & 27 Nov',
    lectures: 'Biology of movement · Attention and action',
    book: 'Carlson 8 (BG: pp. 267–269, 518–521) · Syllabus 6',
    module: 'm4',
    goals: [
      'I know the general anatomy of muscles.',
      'I know which cortical regions are involved in motor control and premotor planning, and the cerebellum’s role.',
      'I know the anatomy of the basal ganglia and how its components are involved in movement control.',
      'I know the consequences of impaired basal ganglia in Parkinson’s and Huntington’s disease, and how DBS helps Parkinson’s.',
      'I understand the cognitive processes in attention, the brain areas involved, and what damage causes (hemispatial neglect).',
      'I understand the limitations of attention and the relationship between attention and action.',
    ],
  },
  {
    week: 6,
    dates: '2 & 4 Dec',
    lectures: 'Biology of language · Cognition of language',
    book: 'Carlson 14 (pp. 469–483) · Syllabus 9',
    module: 'm5',
    goals: [
      'I know which brain areas represent the components of language (comprehension, production) and how damage causes deficits.',
      'I know the language disorders after brain damage and the differences among them (aphasia types).',
      'I know the difference between language mechanisms for listening/speaking versus reading/writing.',
      'I know the reading pathways and the dyslexias related to them.',
      'I know psycholinguistic concepts: phonemes, morphemes, lexicons — and typical speech errors.',
      'I know Chomsky’s phrase-structure grammar.',
      'I understand the word-superiority effect (McClelland & Rumelhart 1981), the phoneme restoration effect, and ambiguity effects on fixation durations.',
      'I know findings showing syntax and semantics both influence sentence processing before the sentence ends.',
      'I understand language acquisition, the role of context and inferences in reading, and how understanding shows in eye movements and brain activity.',
    ],
  },
  {
    week: 7,
    dates: '9 & 11 Dec',
    lectures: 'Structure of the nervous system · Q&A',
    book: 'Carlson 3',
    goals: [
      'I can recall how the nervous system develops.',
      'I can recall and recognise brain anatomy in general (lobes and functions) and know the function of brain structures shown to me.',
      'I know the principal structures of midbrain, hindbrain, brainstem and spinal cord and their primary functions.',
      'I know the organisation of CSF distribution in the CNS.',
      'Note: know the structures relevant to the brain functions discussed (e.g. LGN–V1 for vision); not every anatomical detail.',
    ],
  },
  {
    week: 8,
    dates: '17 Dec',
    lectures: 'Midterm exam (Part 1), 18:45–21:00',
    book: 'Carlson 1–3, 4 (pp. 110–131), 6, 8, 14 · Syllabus 1–6 & 9',
    goals: ['60 multiple-choice questions covering all learning goals of Weeks 1–7.'],
  },
  {
    week: 9,
    dates: '6 & 8 Jan',
    lectures: 'Biology of learning & memory · Cognition of memory',
    book: 'Carlson 13 · Syllabus 7',
    module: 'm6',
    goals: [
      'I know the different types of learning and memory and their differences.',
      'I understand how learning and memory are implemented in the brain.',
      'I know what long-term potentiation is and its physiological mechanism.',
      'I know what reinforcement is and the main brain mechanisms behind it.',
      'I know what false memories are and how they are elicited experimentally (DRM).',
      'I can explain the relevance of cues in memory research (encoding specificity, context dependence).',
      'I know what semantic networks are, how semantic memory is organised in the brain, and the hub-and-spoke model.',
      'I understand the roles of familiarity and source monitoring in memory.',
    ],
  },
  {
    week: 10,
    dates: '13 & 15 Jan',
    lectures: 'Memory processes · Biology of emotions',
    book: 'Carlson 11, 18 (pp. 581–591) · Syllabus 8',
    module: 'm7',
    goals: [
      'I know proactive and retroactive interference and the differences between them.',
      'I understand the standard model of systems consolidation.',
      'I understand the effects of imagery on memory performance.',
      'I know how memories are affected by reactivation (reconsolidation).',
      'I understand the inhibition account of retrieval-induced forgetting.',
      'I know which memory processes occur during sleep and how hippocampus, thalamus and cortex replay memories together.',
      'I know the basic emotion components and main emotion categories, and the brain regions supporting and expressing emotions.',
      'I understand the effects of emotions and stress on brain and body, and the mechanisms of facial emotional expression.',
      'I know what subjective emotional feelings are and understand empathy.',
      'I know the difference between mood-congruent and mood-dependent memory, and the emotional binding model.',
    ],
  },
  {
    week: 11,
    dates: '20 & 22 Jan',
    lectures: 'Biology of sleep · Q&A',
    book: 'Carlson 9',
    module: 'm8',
    goals: [
      'I know the function of sleep and the functions of the different sleep stages, including effects of sleep deprivation.',
      'I know which brain regions control sleep and waking.',
      'I understand the function and process of the internal biological clock.',
      'I know which neurotransmitters are involved in arousal/alertness and in promoting sleep.',
      'I can recite what happens when sleep processes are disrupted (sleep disorders) and how seasonal rhythms are supported.',
    ],
  },
  {
    week: 12,
    dates: '26 Jan',
    lectures: 'Final exam (Part 1 & 2), 08:30–10:45',
    book: 'Everything above',
    goals: ['60 multiple-choice questions covering all learning goals of the course.'],
  },
];

export const STUDY_TIPS: { title: string; body: string }[] = [
  {
    title: 'Commit to self-study from week 1',
    body: 'Plan frequent self-study sessions instead of postponing. Benefits: more control and accomplishment, less peak stress, fewer total hours for the same outcomes, and deeper understanding that boosts motivation. Find the locations, partners and break rhythm that work for you.',
  },
  {
    title: 'Get the most out of lectures & tutorials',
    body: 'Keep track of all tutorial homework and finish it on time. Check whether you actually understand what is explained — and ask questions during or after lectures, tutorials and the Q&A sessions. Do the weekly Canvas quizzes.',
  },
  {
    title: 'Use the textbooks actively',
    body: 'The textbooks contain the bulk of what is relevant for the learning goals. Read the required chapters, but also use them to answer your own questions after lectures. Study the learning goals and relate them to book, lectures and tutorials — exam questions cover all learning goals.',
  },
  {
    title: 'Rehearse terms with flashcards',
    body: 'The course covers many topics, so use a strategy to rehearse concepts and terms easily — flashcards are ideal for quick rehearsal sessions. This app’s Study Tools section schedules them for you (SM-2).',
  },
  {
    title: 'Do the practice exam',
    body: 'Use the practice exam to check your knowledge, find gaps, and get familiar with the question style. A full 65-question sample exam with the published answer key is included in this app under Practice exam.',
  },
  {
    title: 'Study visually — see the bigger picture',
    body: 'Visual material helps combine what you learned into a whole. Watch videos (e.g. Neuroscientifically Challenged), study anatomy on a 3D brain (that is this app’s Atlas!), and make mind maps or posters organising the textbook, manual and lecture material. The Mind-Map page gives you a starting point.',
  },
  {
    title: 'Accept the breadth — ask about the connections',
    body: 'Learning many loosely related facts can feel confusing — that is a natural consequence of learning basics. Accept the feeling, but ask how facts relate; over time the fundamentals fall into place.',
  },
];
