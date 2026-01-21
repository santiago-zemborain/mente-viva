import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Política de Privacidad",
}

// Configurar como estática
export const dynamic = 'force-static'

export default function PrivacidadPage() {
  return (
    <div className="mx-auto max-w-3xl prose prose-lg">
      <h1>Política de Privacidad</h1>
      <p className="lead">Última actualización: Enero 2025</p>

      <h2>Información que recopilamos</h2>
      <p>
        En Mente Viva recopilamos información personal que nos proporcionás voluntariamente al registrarte, solicitar
        una entrevista o inscribirte en nuestros servicios. Esta información incluye:
      </p>
      <ul>
        <li>Nombre completo</li>
        <li>Dirección de correo electrónico</li>
        <li>Número de teléfono/WhatsApp</li>
        <li>Información de pago (no almacenamos datos de tarjetas)</li>
      </ul>

      <h2>Uso de la información</h2>
      <p>Utilizamos tu información personal para:</p>
      <ul>
        <li>Gestionar tu inscripción y reservas</li>
        <li>Comunicarnos contigo sobre tus clases y pagos</li>
        <li>Enviarte información relevante sobre nuestros servicios</li>
        <li>Mejorar nuestros servicios</li>
      </ul>

      <h2>Protección de datos</h2>
      <p>
        Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal contra acceso
        no autorizado, pérdida o alteración.
      </p>

      <h2>Contacto</h2>
      <p>
        Si tenés preguntas sobre esta política, contactanos a{" "}
        <a href="mailto:mentevivaespacio@gmail.com">mentevivaespacio@gmail.com</a>
      </p>
    </div>
  )
}
