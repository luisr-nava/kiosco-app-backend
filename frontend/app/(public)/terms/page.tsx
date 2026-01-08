import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  return (
    <div className="from-background to-muted/20 min-h-screen bg-gradient-to-b">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
                <FileText className="text-primary h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-3xl">
                  Términos y Condiciones
                </CardTitle>
                <p className="text-muted-foreground mt-1 text-sm">
                  Última actualización: Noviembre 2025
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <Separator className="my-6" />

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">
                1. Aceptación de los Términos
              </h2>
              <p className="text-muted-foreground mb-4">
                Al acceder y utilizar Balanzio (en adelante, &quot;la
                Aplicación&quot;), usted acepta estar sujeto a estos Términos y
                Condiciones. Si no está de acuerdo con alguna parte de estos
                términos, no debe utilizar nuestra aplicación.
              </p>
              <p className="text-muted-foreground">
                Nos reservamos el derecho de actualizar o modificar estos
                términos en cualquier momento sin previo aviso. El uso continuo
                de la Aplicación después de dichos cambios constituirá su
                aceptación de los nuevos términos.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">
                2. Descripción del Servicio
              </h2>
              <p className="text-muted-foreground mb-4">
                Balanzio es un sistema integral de gestión empresarial que
                proporciona las siguientes funcionalidades:
              </p>
              <ul className="text-muted-foreground ml-4 list-inside list-disc space-y-2">
                <li>Sistema de punto de venta (POS)</li>
                <li>Gestión de inventario y productos</li>
                <li>Administración de clientes y proveedores</li>
                <li>Control de empleados</li>
                <li>Gestión de compras y ventas</li>
                <li>Reportes y análisis financieros</li>
                <li>Gestión multi-sucursal</li>
                <li>Control de ingresos y gastos</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">
                3. Registro y Cuenta de Usuario
              </h2>
              <p className="text-muted-foreground mb-4">
                Para utilizar la Aplicación, debe crear una cuenta
                proporcionando información precisa y completa. Usted es
                responsable de:
              </p>
              <ul className="text-muted-foreground ml-4 list-inside list-disc space-y-2">
                <li>
                  Mantener la confidencialidad de sus credenciales de acceso
                </li>
                <li>Todas las actividades que ocurran bajo su cuenta</li>
                <li>
                  Notificarnos inmediatamente sobre cualquier uso no autorizado
                  de su cuenta
                </li>
                <li>Proporcionar información veraz, exacta y actualizada</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Nos reservamos el derecho de suspender o cancelar cuentas que
                violen estos términos o que consideremos fraudulentas.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">4. Uso Aceptable</h2>
              <p className="text-muted-foreground mb-4">
                Al utilizar la Aplicación, usted se compromete a NO:
              </p>
              <ul className="text-muted-foreground ml-4 list-inside list-disc space-y-2">
                <li>Usar la Aplicación para fines ilegales o no autorizados</li>
                <li>
                  Intentar obtener acceso no autorizado a nuestros sistemas o
                  redes
                </li>
                <li>Interferir con el funcionamiento de la Aplicación</li>
                <li>Transmitir virus, malware o código malicioso</li>
                <li>
                  Recopilar información de otros usuarios sin su consentimiento
                </li>
                <li>Realizar ingeniería inversa del software</li>
                <li>Revender o redistribuir el servicio sin autorización</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">
                5. Propiedad Intelectual
              </h2>
              <p className="text-muted-foreground mb-4">
                Todo el contenido, características y funcionalidad de la
                Aplicación son propiedad exclusiva de Balanzio y están
                protegidos por derechos de autor, marcas registradas y otras
                leyes de propiedad intelectual.
              </p>
              <p className="text-muted-foreground">
                Los datos que usted ingresa en el sistema son de su propiedad,
                pero nos otorga una licencia para procesarlos y almacenarlos con
                el fin de proporcionar el servicio.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">
                6. Privacidad y Datos
              </h2>
              <p className="text-muted-foreground mb-4">
                Su privacidad es importante para nosotros. El uso de su
                información personal se rige por nuestra{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Política de Privacidad
                </Link>
                , que forma parte integral de estos Términos y Condiciones.
              </p>
              <p className="text-muted-foreground">
                Implementamos medidas de seguridad técnicas y organizativas para
                proteger sus datos, pero no podemos garantizar la seguridad
                absoluta de la información transmitida a través de Internet.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">
                7. Facturación y Pagos
              </h2>
              <p className="text-muted-foreground mb-4">
                Algunos servicios de la Aplicación pueden requerir el pago de
                tarifas. Al suscribirse a un plan de pago:
              </p>
              <ul className="text-muted-foreground ml-4 list-inside list-disc space-y-2">
                <li>
                  Acepta pagar todas las tarifas asociadas con su plan
                  seleccionado
                </li>
                <li>
                  Las suscripciones se renuevan automáticamente a menos que las
                  cancele
                </li>
                <li>
                  Los reembolsos se manejan según nuestra política de reembolsos
                </li>
                <li>
                  Nos reservamos el derecho de modificar las tarifas con previo
                  aviso
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">
                8. Disponibilidad del Servicio
              </h2>
              <p className="text-muted-foreground mb-4">
                Si bien nos esforzamos por mantener la Aplicación disponible
                24/7, no podemos garantizar que el servicio esté libre de
                interrupciones, retrasos o errores.
              </p>
              <p className="text-muted-foreground">
                Nos reservamos el derecho de modificar, suspender o descontinuar
                cualquier aspecto de la Aplicación en cualquier momento, con o
                sin previo aviso.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">
                9. Limitación de Responsabilidad
              </h2>
              <p className="text-muted-foreground mb-4">
                En la medida máxima permitida por la ley, Balanzio no será
                responsable por:
              </p>
              <ul className="text-muted-foreground ml-4 list-inside list-disc space-y-2">
                <li>
                  Daños indirectos, incidentales, especiales o consecuentes
                </li>
                <li>Pérdida de beneficios, datos o uso</li>
                <li>Interrupción del negocio</li>
                <li>
                  Cualquier daño derivado del uso o imposibilidad de usar la
                  Aplicación
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">10. Indemnización</h2>
              <p className="text-muted-foreground">
                Usted acepta indemnizar y mantener indemne a Balanzio y sus
                afiliados de cualquier reclamación, daño, pérdida,
                responsabilidad y gasto (incluidos honorarios legales) que
                surjan de su uso de la Aplicación o violación de estos términos.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">11. Rescisión</h2>
              <p className="text-muted-foreground mb-4">
                Podemos suspender o cancelar su acceso a la Aplicación
                inmediatamente, sin previo aviso ni responsabilidad, por
                cualquier motivo, incluido el incumplimiento de estos Términos y
                Condiciones.
              </p>
              <p className="text-muted-foreground">
                Usted puede cancelar su cuenta en cualquier momento desde la
                configuración de su perfil.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">12. Ley Aplicable</h2>
              <p className="text-muted-foreground">
                Estos términos se rigen por las leyes aplicables en su
                jurisdicción. Cualquier disputa relacionada con estos términos
                se resolverá en los tribunales competentes de su localidad.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">13. Contacto</h2>
              <p className="text-muted-foreground mb-2">
                Si tiene preguntas sobre estos Términos y Condiciones, puede
                contactarnos a través de:
              </p>
              <ul className="text-muted-foreground list-none space-y-2">
                <li>Email: soporte@balanzio.net</li>
                <li>Teléfono: +1 (555) 123-4567</li>
                <li>Dirección: Calle Principal 123, Ciudad, País</li>
              </ul>
            </section>

            <Separator className="my-6" />

            <div className="text-muted-foreground text-center text-sm">
              <p>
                Al utilizar Balanzio, usted reconoce que ha leído, entendido y
                acepta estar sujeto a estos Términos y Condiciones.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
