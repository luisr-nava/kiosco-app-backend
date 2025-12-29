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

export const SelectShopCard = ({
  title = "Selecciona una tienda",
  description = "Debes elegir una tienda activa para continuar.",
  helperText = "Abre el selector de tiendas para continuar.",
}: Props) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">{helperText}</p>
    </CardContent>
  </Card>
);

