type ErrorStateProps = { message?: string };
export default function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="rounded-lg border border-red-600 p-4 bg-red-950/20 text-red-400">
      <p>Erreur de chargement du catalogue.</p>
      {message && <p className="text-sm mt-1">{message}</p>}
    </div>
  );
}