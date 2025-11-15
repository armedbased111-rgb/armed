import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";

export default function Legal() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mentions légales</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <section>
          <h2 className="text-lg font-semibold mb-2">Conditions d'utilisation</h2>
          <p className="text-muted-foreground">À compléter...</p>
        </section>
        
        <section>
          <h2 className="text-lg font-semibold mb-2">Politique de confidentialité</h2>
          <p className="text-muted-foreground">À compléter...</p>
        </section>
      </CardContent>
    </Card>
  );
}
