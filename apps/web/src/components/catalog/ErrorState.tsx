type ErrorStateProps = { message?: string };

export default function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive-foreground">
      <p className="font-medium">Erreur de chargement du catalogue.</p>
      {message && <p className="text-sm mt-1 text-muted-foreground">{message}</p>}
    </div>
  );
}
