interface ConfirmationEmailProps {
  name: string
  selectedDates: string[]
  dayName: string
  time: string
  total: number
  paymentMode: string
  paymentMethod: string
}

export function ConfirmationEmail({
  name,
  selectedDates,
  dayName,
  time,
  total,
  paymentMode,
  paymentMethod,
}: ConfirmationEmailProps) {
  const dateFormatter = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>Confirmación de Inscripción - Mente Viva</title>
      </head>
      <body style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f5f5f5", margin: 0, padding: "20px" }}>
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div style={{ backgroundColor: "#2196F3", padding: "30px", textAlign: "center" as const }}>
            <h1 style={{ color: "#ffffff", margin: 0, fontSize: "28px" }}>MENTE VIVA</h1>
            <p style={{ color: "#ffffff", margin: "10px 0 0 0", opacity: 0.9 }}>
              Un espacio de aprendizaje y salud integral
            </p>
          </div>

          {/* Content */}
          <div style={{ padding: "30px" }}>
            <h2 style={{ color: "#333333", marginTop: 0 }}>¡Hola {name}!</h2>

            <p style={{ color: "#555555", fontSize: "16px", lineHeight: 1.6 }}>
              Tu inscripción al <strong>Taller de Memoria</strong> ha sido confirmada. A continuación encontrarás los
              detalles de tu reserva:
            </p>

            {/* Details Box */}
            <div style={{ backgroundColor: "#f8f9fa", borderRadius: "8px", padding: "20px", margin: "20px 0" }}>
              <h3 style={{ color: "#2196F3", marginTop: 0, marginBottom: "15px" }}>Detalles de tu inscripción</h3>

              <p style={{ margin: "8px 0", color: "#555555" }}>
                <strong>Día:</strong> {dayName} {time} hs
              </p>

              <p style={{ margin: "8px 0", color: "#555555" }}>
                <strong>Fechas seleccionadas:</strong>
              </p>
              <ul style={{ margin: "5px 0 15px 20px", color: "#555555" }}>
                {selectedDates.map((date, index) => (
                  <li key={index} style={{ marginBottom: "5px" }}>
                    {dateFormatter.format(new Date(date + "T12:00:00"))}
                  </li>
                ))}
              </ul>

              <p style={{ margin: "8px 0", color: "#555555" }}>
                <strong>Modalidad:</strong> {paymentMode === "monthly" ? "Pack mensual completo" : "Clases sueltas"}
              </p>

              <p style={{ margin: "8px 0", color: "#555555" }}>
                <strong>Método de pago:</strong>{" "}
                {paymentMethod === "mercadopago" ? "MercadoPago" : "Transferencia bancaria"}
              </p>

              <div style={{ borderTop: "1px solid #dee2e6", marginTop: "15px", paddingTop: "15px" }}>
                <p style={{ margin: 0, fontSize: "18px", color: "#333333" }}>
                  <strong>Total a abonar: ${total.toLocaleString("es-AR")}</strong>
                </p>
              </div>
            </div>

            {/* Payment Info for Transfer */}
            {paymentMethod === "transfer" && (
              <div
                style={{
                  backgroundColor: "#fff3cd",
                  borderRadius: "8px",
                  padding: "20px",
                  margin: "20px 0",
                  border: "1px solid #ffc107",
                }}
              >
                <h3 style={{ color: "#856404", marginTop: 0 }}>Datos para la transferencia</h3>
                <p style={{ margin: "8px 0", color: "#856404" }}>
                  <strong>Banco:</strong> GALICIA
                </p>
                <p style={{ margin: "8px 0", color: "#856404" }}>
                  <strong>Titular:</strong> MAITE BUSTINZA
                </p>
                <p style={{ margin: "8px 0", color: "#856404" }}>
                  <strong>CBU:</strong> 0070664930004001936415
                </p>
                <p style={{ margin: "8px 0", color: "#856404" }}>
                  <strong>Alias:</strong> MENTEVIVAESPACIO
                </p>
                <p style={{ margin: "8px 0", color: "#856404" }}>
                  <strong>Nº de cuenta:</strong> 4001936-4 664-1
                </p>
                <p style={{ margin: "15px 0 0 0", color: "#856404", fontSize: "14px" }}>
                  Por favor, enviá el comprobante de transferencia por WhatsApp al número de contacto.
                </p>
              </div>
            )}

            {/* Location */}
            <div style={{ backgroundColor: "#e8f4fd", borderRadius: "8px", padding: "20px", margin: "20px 0" }}>
              <h3 style={{ color: "#2196F3", marginTop: 0 }}>Ubicación</h3>
              <p style={{ margin: "8px 0", color: "#555555" }}>
                Av. Presidente Manuel Quintana y Montevideo
                <br />
                Recoleta, CABA
              </p>
            </div>

            <p style={{ color: "#555555", fontSize: "16px", lineHeight: 1.6 }}>
              Si tenés alguna consulta, no dudes en contactarnos.
            </p>

            <p style={{ color: "#555555", fontSize: "16px", lineHeight: 1.6 }}>
              ¡Te esperamos!
              <br />
              <strong>Equipo Mente Viva</strong>
            </p>
          </div>

          {/* Footer */}
          <div
            style={{
              backgroundColor: "#f8f9fa",
              padding: "20px",
              textAlign: "center" as const,
              borderTop: "1px solid #dee2e6",
            }}
          >
            <p style={{ color: "#888888", fontSize: "14px", margin: 0 }}>
              Mente Viva - Un espacio de aprendizaje y salud integral
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}
