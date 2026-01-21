import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Términos y Condiciones",
}

// Configurar como estática
export const dynamic = 'force-static'

export default function TerminosPage() {
  return (
    <div className="mx-auto max-w-3xl prose prose-lg">
      <h1>Términos y Condiciones</h1>
      <p className="lead">Última actualización: Enero 2025</p>

      <h2>Aceptación de los términos</h2>
      <p>
        Al utilizar los servicios de Mente Viva, aceptás estos términos y condiciones en su totalidad. Si no estás de
        acuerdo con alguno de estos términos, te pedimos que no utilices nuestros servicios.
      </p>

      <h2>Servicios</h2>
      <p>
        Mente Viva ofrece talleres de estimulación cognitiva, clases especiales, formaciones profesionales y eventos
        relacionados con la salud cognitiva. Todos nuestros servicios son de carácter educativo y no constituyen
        tratamiento médico.
      </p>

      <h2>Inscripciones y pagos</h2>
      <ul>
        <li>Las inscripciones se confirman una vez recibido el pago correspondiente.</li>
        <li>Los precios están expresados en pesos argentinos (ARS).</li>
        <li>Aceptamos pagos por MercadoPago y transferencia bancaria.</li>
      </ul>

      <h2>Cancelaciones</h2>
      <p>
        Consultá nuestra política de pagos y cancelaciones para conocer las condiciones de reembolso y reprogramación.
      </p>

      <h2>Responsabilidad</h2>
      <p>
        Mente Viva no se hace responsable por diagnósticos médicos. Nuestros servicios son complementarios y no
        reemplazan el tratamiento médico profesional.
      </p>
    </div>
  )
}
