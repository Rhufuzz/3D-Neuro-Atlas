import StudyClient from './study-client';

export default function StudyPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Study Tools</h1>
      <p className="text-sm text-muted-foreground">Flashcards and a practice exam, filtered by exam scope.</p>
      <StudyClient />
    </div>
  );
}
