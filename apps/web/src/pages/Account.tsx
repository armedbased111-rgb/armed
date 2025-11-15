import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";

export default function Account() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Compte</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Espace client à venir.</p>
      </CardContent>
    </Card>
  );
}
