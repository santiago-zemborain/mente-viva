import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Políticas de Pago y Cancelación",
}

// Configurar como estática
export const dynamic = 'force-static'

export default function PagosPage() {
  return (
    <div className="mx-auto max-w-3xl prose prose-lg">
      <h1>Políticas de Pago y Cancelación</h1>
      <p className="lead">Última actualización: Enero 2025</p>

      <h2>Métodos de pago</h2>
      <p>Aceptamos los siguientes métodos de pago:</p>
      <ul>
        <li>
          <strong>MercadoPago:</strong> A través de link de pago. Podés pagar con dinero en cuenta, tarjeta de débito o
          crédito (según lo permita MercadoPago).
        </li>
        <li>
          <strong>Transferencia bancaria:</strong> Te proporcionamos los datos bancarios y podés subir el comprobante
          desde la web.
        </li>
      </ul>

      <h2>Confirmación de pago</h2>
      <p>
        Los pagos se confirman manualmente. Una vez que verifiquemos tu pago, recibirás una confirmación por email y/o
        WhatsApp.
      </p>

      <h2>Política de cancelación - Taller de Memoria</h2>
      <ul>
        <li>Si avisás con más de 24hs de anticipación, podés reprogramar la clase dentro del mismo mes.</li>
        <li>Las clases no utilizadas no se acumulan para el mes siguiente.</li>
        <li>No se realizan reembolsos una vez iniciado el mes.</li>
      </ul>

      <h2>Política de cancelación - Clases Especiales</h2>
      <ul>
        <li>La seña (50%) no es reembolsable.</li>
        <li>Si cancelás antes de pagar el saldo, perdés la seña pero no tenés obligación de pagar el resto.</li>
        <li>
          Si Mente Viva cancela la clase, se reembolsa el 100% de lo pagado o se ofrece crédito para futuros servicios.
        </li>
      </ul>

      <h2>Contacto</h2>
      <p>
        Para consultas sobre pagos y cancelaciones, contactanos a{" "}
        <a href="mailto:mentevivaespacio@gmail.com">mentevivaespacio@gmail.com</a> o por WhatsApp al +54 11 2579 0108.
      </p>
    </div>
  )
}
