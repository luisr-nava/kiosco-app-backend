import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
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
                <Shield className="text-primary h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-3xl">
                  Política de Privacidad
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
              <h2 className="mb-4 text-2xl font-semibold">Introducción</h2>
              <p className="text-muted-foreground mb-4">
                En Balanzio, nos comprometemos a proteger su privacidad y la
                seguridad de sus datos personales. Esta Política de Privacidad
                explica cómo recopilamos, usamos, compartimos y protegemos su
                información cuando utiliza nuestra aplicación.
              </p>
              <p className="text-muted-foreground">
                Al utilizar Balanzio, usted acepta las prácticas descritas en
                esta política. Si no está de acuerdo con esta política, por
                favor no utilice nuestra aplicación.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">
                1. Información que Recopilamos
              </h2>

              <h3 className="mt-4 mb-3 text-xl font-semibold">
                1.1 Información que Proporciona
              </h3>
              <p className="text-muted-foreground mb-4">
                Recopilamos información que usted nos proporciona directamente
                cuando:
              </p>
              <ul className="text-muted-foreground ml-4 list-inside list-disc space-y-2">
                <li>Crea una cuenta (nombre, email, contraseña)</li>
                <li>Completa su perfil de usuario</li>
                <li>
                  Registra información de su negocio (nombre de tienda,
                  dirección, etc.)
                </li>
                <li>
                  Ingresa datos de productos, clientes, proveedores y empleados
                </li>
                <li>Realiza transacciones de venta o compra</li>
                <li>Se comunica con nuestro equipo de soporte</li>
              </ul>

              <h3 className="mt-6 mb-3 text-xl font-semibold">
                1.2 Información Recopilada Automáticamente
              </h3>
              <p className="text-muted-foreground mb-4">
                Cuando utiliza nuestra aplicación, recopilamos automáticamente:
              </p>
              <ul className="text-muted-foreground ml-4 list-inside list-disc space-y-2">
                <li>
                  Información del dispositivo (tipo, sistema operativo,
                  navegador)
                </li>
                <li>Dirección IP y ubicación aproximada</li>
                <li>
                  Datos de uso (páginas visitadas, tiempo de uso, acciones
                  realizadas)
                </li>
                <li>Cookies y tecnologías similares</li>
                <li>Registros de errores y diagnóstico</li>
              </ul>

              <h3 className="mt-6 mb-3 text-xl font-semibold">
                1.3 Datos de Negocio
              </h3>
              <p className="text-muted-foreground mb-4">
                Los datos operativos que ingresa en el sistema, incluyendo:
              </p>
              <ul className="text-muted-foreground ml-4 list-inside list-disc space-y-2">
                <li>Información de inventario y productos</li>
                <li>Registros de ventas y compras</li>
                <li>Datos de clientes y proveedores</li>
                <li>Información financiera (ingresos, gastos)</li>
                <li>Reportes y análisis generados</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">
                2. Cómo Utilizamos su Información
              </h2>
              <p className="text-muted-foreground mb-4">
                Utilizamos la información recopilada para:
              </p>
              <ul className="text-muted-foreground ml-4 list-inside list-disc space-y-2">
                <li>Proporcionar, operar y mantener nuestros servicios</li>
                <li>Procesar sus transacciones y gestionar su cuenta</li>
                <li>Mejorar, personalizar y expandir nuestros servicios</li>
                <li>Entender y analizar cómo utiliza nuestra aplicación</li>
                <li>
                  Desarrollar nuevos productos, servicios y funcionalidades
                </li>
                <li>
                  Comunicarnos con usted para servicio al cliente,
                  actualizaciones y marketing
                </li>
                <li>
                  Enviar información técnica, actualizaciones y notificaciones
                  de seguridad
                </li>
                <li>Prevenir fraude y actividades ilegales</li>
                <li>Cumplir con obligaciones legales</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">
                3. Compartir su Información
              </h2>
              <p className="text-muted-foreground mb-4">
                No vendemos su información personal. Podemos compartir su
                información en las siguientes circunstancias:
              </p>

              <h3 className="mt-4 mb-3 text-xl font-semibold">
                3.1 Proveedores de Servicios
              </h3>
              <p className="text-muted-foreground mb-4">
                Compartimos información con terceros que nos ayudan a operar
                nuestra aplicación:
              </p>
              <ul className="text-muted-foreground ml-4 list-inside list-disc space-y-2">
                <li>Servicios de hosting y almacenamiento en la nube</li>
                <li>Procesadores de pago</li>
                <li>Servicios de análisis y métricas</li>
                <li>Proveedores de email y comunicaciones</li>
                <li>Servicios de seguridad y prevención de fraude</li>
              </ul>

              <h3 className="mt-6 mb-3 text-xl font-semibold">
                3.2 Requisitos Legales
              </h3>
              <p className="text-muted-foreground mb-4">
                Podemos divulgar su información si es requerido por ley o en
                respuesta a:
              </p>
              <ul className="text-muted-foreground ml-4 list-inside list-disc space-y-2">
                <li>Órdenes judiciales o solicitudes gubernamentales</li>
                <li>Cumplimiento de regulaciones legales</li>
                <li>
                  Protección de nuestros derechos, privacidad, seguridad o
                  propiedad
                </li>
                <li>
                  Situaciones de emergencia que involucren peligro de muerte o
                  lesiones
                </li>
              </ul>

              <h3 className="mt-6 mb-3 text-xl font-semibold">
                3.3 Transferencias de Negocio
              </h3>
              <p className="text-muted-foreground">
                En caso de fusión, adquisición o venta de activos, su
                información puede ser transferida al nuevo propietario.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">
                4. Seguridad de los Datos
              </h2>
              <p className="text-muted-foreground mb-4">
                Implementamos medidas de seguridad técnicas y organizativas para
                proteger su información:
              </p>
              <ul className="text-muted-foreground ml-4 list-inside list-disc space-y-2">
                <li>Cifrado de datos en tránsito y en reposo (SSL/TLS)</li>
                <li>Autenticación de dos factores (2FA)</li>
                <li>Controles de acceso basados en roles</li>
                <li>Auditorías de seguridad regulares</li>
                <li>Monitoreo continuo de amenazas</li>
                <li>Copias de seguridad automáticas y encriptadas</li>
                <li>Protección contra ataques DDoS</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Sin embargo, ningún método de transmisión por Internet o
                almacenamiento electrónico es 100% seguro. No podemos garantizar
                la seguridad absoluta.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">
                5. Retención de Datos
              </h2>
              <p className="text-muted-foreground mb-4">
                Retenemos su información personal durante el tiempo que su
                cuenta esté activa o según sea necesario para:
              </p>
              <ul className="text-muted-foreground ml-4 list-inside list-disc space-y-2">
                <li>Proporcionar nuestros servicios</li>
                <li>Cumplir con obligaciones legales</li>
                <li>Resolver disputas</li>
                <li>Hacer cumplir nuestros acuerdos</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Cuando solicite la eliminación de su cuenta, eliminaremos o
                anonimizaremos su información personal dentro de un plazo
                razonable, excepto cuando debamos retenerla por requisitos
                legales.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">
                6. Sus Derechos de Privacidad
              </h2>
              <p className="text-muted-foreground mb-4">
                Dependiendo de su ubicación, puede tener los siguientes
                derechos:
              </p>
              <ul className="text-muted-foreground ml-4 list-inside list-disc space-y-2">
                <li>
                  <strong>Acceso:</strong> Solicitar una copia de sus datos
                  personales
                </li>
                <li>
                  <strong>Rectificación:</strong> Corregir información inexacta
                  o incompleta
                </li>
                <li>
                  <strong>Eliminación:</strong> Solicitar la eliminación de sus
                  datos (derecho al olvido)
                </li>
                <li>
                  <strong>Portabilidad:</strong> Recibir sus datos en un formato
                  estructurado
                </li>
                <li>
                  <strong>Restricción:</strong> Limitar el procesamiento de sus
                  datos
                </li>
                <li>
                  <strong>Oposición:</strong> Oponerse al procesamiento de sus
                  datos
                </li>
                <li>
                  <strong>Retirar consentimiento:</strong> En cualquier momento
                </li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Para ejercer estos derechos, puede acceder a la configuración de
                su cuenta o contactarnos directamente en privacidad@balanzio.net
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">
                7. Cookies y Tecnologías de Rastreo
              </h2>
              <p className="text-muted-foreground mb-4">
                Utilizamos cookies y tecnologías similares para:
              </p>
              <ul className="text-muted-foreground ml-4 list-inside list-disc space-y-2">
                <li>Recordar sus preferencias y configuración</li>
                <li>Mantener su sesión activa</li>
                <li>Analizar el uso y rendimiento de la aplicación</li>
                <li>Personalizar su experiencia</li>
                <li>Fines de seguridad y prevención de fraude</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Puede configurar su navegador para rechazar cookies, pero esto
                puede afectar la funcionalidad de la aplicación.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">
                8. Transferencias Internacionales
              </h2>
              <p className="text-muted-foreground">
                Sus datos pueden ser transferidos y procesados en países
                diferentes al suyo. Nos aseguramos de que dichas transferencias
                cumplan con las leyes de protección de datos aplicables mediante
                el uso de mecanismos de transferencia adecuados como cláusulas
                contractuales estándar.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">
                9. Privacidad de Menores
              </h2>
              <p className="text-muted-foreground">
                Nuestros servicios no están dirigidos a menores de 18 años. No
                recopilamos intencionalmente información personal de menores. Si
                descubrimos que hemos recopilado datos de un menor sin el
                consentimiento parental adecuado, eliminaremos dicha información
                de inmediato.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">
                10. Cambios a esta Política
              </h2>
              <p className="text-muted-foreground mb-4">
                Podemos actualizar esta Política de Privacidad periódicamente.
                Le notificaremos sobre cambios significativos mediante:
              </p>
              <ul className="text-muted-foreground ml-4 list-inside list-disc space-y-2">
                <li>Notificación por email</li>
                <li>Aviso destacado en nuestra aplicación</li>
                <li>
                  Actualización de la fecha de &quot;última actualización&quot;
                </li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Le recomendamos revisar esta política periódicamente para
                mantenerse informado sobre cómo protegemos su información.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">
                11. Cumplimiento Normativo
              </h2>
              <p className="text-muted-foreground mb-4">
                Cumplimos con las siguientes regulaciones de privacidad:
              </p>
              <ul className="text-muted-foreground ml-4 list-inside list-disc space-y-2">
                <li>GDPR (Reglamento General de Protección de Datos - UE)</li>
                <li>CCPA (Ley de Privacidad del Consumidor de California)</li>
                <li>LGPD (Lei Geral de Proteção de Dados - Brasil)</li>
                <li>Leyes locales de protección de datos aplicables</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">12. Contacto</h2>
              <p className="text-muted-foreground mb-4">
                Si tiene preguntas, inquietudes o solicitudes relacionadas con
                esta Política de Privacidad, puede contactarnos:
              </p>
              <ul className="text-muted-foreground list-none space-y-2">
                <li>
                  <strong>Oficial de Privacidad:</strong> privacy@balanzio.net
                </li>
                <li>
                  <strong>Email general:</strong> soporte@balanzio.net
                </li>
                <li>
                  <strong>Teléfono:</strong> +1 (555) 123-4567
                </li>
                <li>
                  <strong>Dirección:</strong> Calle Principal 123, Ciudad, País
                </li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Responderemos a su solicitud dentro de los 30 días siguientes a
                su recepción.
              </p>
            </section>

            <Separator className="my-6" />

            <div className="text-muted-foreground text-center text-sm">
              <p className="mb-4">
                Su privacidad es fundamental para nosotros. Al utilizar
                Balanzio, usted reconoce que ha leído y comprendido esta
                Política de Privacidad.
              </p>
              <p>
                Para más información sobre cómo utilizamos sus datos, consulte
                nuestros{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  Términos y Condiciones
                </Link>
                .
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
