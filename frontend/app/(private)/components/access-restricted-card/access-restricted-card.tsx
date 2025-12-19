import { ShieldAlert } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Props {
  title?: string;
  description?: string;
  helperText?: string;
}

/**
 * Card genérico para bloquear secciones a roles restringidos.
 */
export const AccessRestrictedCard = ({
  title = "Acceso restringido",
  description = "Esta sección solo está disponible para propietarios de la cuenta.",
  helperText = "Consulta con el owner del proyecto para obtener permisos.",
}: Props) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <ShieldAlert className="h-5 w-5 text-destructive" />
        {title}
      </CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">{helperText}</p>
    </CardContent>
  </Card>
);
