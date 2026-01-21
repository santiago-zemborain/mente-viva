import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

function generateEmailHTML({
  name,
  selectedDates,
  dayName,
  time,
  total,
  paymentMode,
  paymentMethod,
}: {
  name: string
  selectedDates: string[]
  dayName: string
  time: string
  total: number
  paymentMode: string
  paymentMethod: string
}) {
  const formattedDates = selectedDates
    .map((d) => new Date(d).toLocaleDateString("es-AR", { day: "numeric", month: "long" }))
    .join(", ")

  const bankDetails =
    paymentMethod === "transfer"
      ? `
    <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
      <h3 style="margin: 0 0 12px 0; color: #1e3a5f;">Datos para transferencia:</h3>
      <p style="margin: 4px 0;"><strong>Banco:</strong> Galicia</p>
      <p style="margin: 4px 0;"><strong>Titular:</strong> MAITE BUSTINZA</p>
      <p style="margin: 4px 0;"><strong>CBU:</strong> 0070664930004001936415</p>
      <p style="margin: 4px 0;"><strong>Alias:</strong> MENTEVIVAESPACIO</p>
      <p style="margin: 4px 0;"><strong>N° de cuenta:</strong> 4001936-4 664-1</p>
    </div>
  `
      : ""

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Confirmación de inscripción - Mente Viva</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #2196F3; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">MENTE VIVA</h1>
          <p style="color: white; margin: 8px 0 0 0; font-size: 14px;">Un espacio de aprendizaje y salud integral</p>
        </div>
        
        <div style="background-color: #ffffff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1e3a5f; margin-top: 0;">¡Hola ${name}!</h2>
          
          <p>Tu inscripción al <strong>Taller de Memoria</strong> ha sido confirmada.</p>
          
          <div style="background-color: #eff6ff; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3 style="margin: 0 0 12px 0; color: #1e3a5f;">Detalles de tu inscripción:</h3>
            <p style="margin: 4px 0;"><strong>Día:</strong> ${dayName}</p>
            <p style="margin: 4px 0;"><strong>Horario:</strong> ${time} hs</p>
            <p style="margin: 4px 0;"><strong>Fechas:</strong> ${formattedDates}</p>
            <p style="margin: 4px 0;"><strong>Modalidad:</strong> ${paymentMode === "monthly" ? "Pack mensual" : "Clases sueltas"}</p>
            <p style="margin: 4px 0;"><strong>Total a pagar:</strong> $${total.toLocaleString("es-AR")}</p>
          </div>
          
          ${bankDetails}
          
          <div style="background-color: #fef3c7; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0;"><strong>Ubicación:</strong> Av. Presidente Manuel Quintana y Montevideo, Recoleta, CABA</p>
          </div>
          
          <p style="margin-top: 24px;">Si tenés alguna consulta, no dudes en contactarnos.</p>
          
          <p style="color: #666; font-size: 14px; margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
            Con cariño,<br>
            <strong>El equipo de Mente Viva</strong>
          </p>
        </div>
      </body>
    </html>
  `
}

function generateSpecialClassEmailHTML({
  name,
  specialClass,
  total,
  paymentMethod,
}: {
  name: string
  specialClass: { title: string; month_label?: string }
  total: string | number
  paymentMethod: string
}) {
  const bankDetails =
    paymentMethod === "transfer"
      ? `
    <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
      <h3 style="margin: 0 0 12px 0; color: #1e3a5f;">Datos para transferencia:</h3>
      <p style="margin: 4px 0;"><strong>Banco:</strong> Galicia</p>
      <p style="margin: 4px 0;"><strong>Titular:</strong> MAITE BUSTINZA</p>
      <p style="margin: 4px 0;"><strong>CBU:</strong> 0070664930004001936415</p>
      <p style="margin: 4px 0;"><strong>Alias:</strong> MENTEVIVAESPACIO</p>
      <p style="margin: 4px 0;"><strong>N° de cuenta:</strong> 4001936-4 664-1</p>
    </div>
  `
      : ""

  const totalFormatted = typeof total === "string" ? total : total.toLocaleString("es-AR")

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Confirmación de reserva - Mente Viva</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #2196F3; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">MENTE VIVA</h1>
          <p style="color: white; margin: 8px 0 0 0; font-size: 14px;">Un espacio de aprendizaje y salud integral</p>
        </div>
        
        <div style="background-color: #ffffff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1e3a5f; margin-top: 0;">¡Hola ${name}!</h2>
          
          <p>Tu reserva para la clase especial ha sido confirmada.</p>
          
          <div style="background-color: #eff6ff; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3 style="margin: 0 0 12px 0; color: #1e3a5f;">Detalles de tu reserva:</h3>
            <p style="margin: 4px 0;"><strong>Clase:</strong> ${specialClass.title}</p>
            ${specialClass.month_label ? `<p style="margin: 4px 0;"><strong>Mes:</strong> ${specialClass.month_label}</p>` : ""}
            <p style="margin: 4px 0;"><strong>Total:</strong> $${totalFormatted}</p>
          </div>
          
          ${bankDetails}
          
          <p style="margin-top: 24px;">Si tenés alguna consulta, no dudes en contactarnos.</p>
          
          <p style="color: #666; font-size: 14px; margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
            Con cariño,<br>
            <strong>El equipo de Mente Viva</strong>
          </p>
        </div>
      </body>
    </html>
  `
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, selectedDates, weekday, total, paymentMode, paymentMethod, specialClass } = body

    console.log("SEND CONFIRMATION BODY", body);

    // Determinar si es taller de memoria o clase especial
    const isSpecialClass = !!specialClass
    const dayName = weekday === 3 ? "Miércoles" : weekday === 5 ? "Viernes" : ""
    const timeSlot = weekday === 3 ? "11:00" : weekday === 5 ? "16:00" : ""

    if (!resend) {
      console.log("[v0] RESEND_API_KEY not configured")
      console.log("[v0] Would send email to:", email)
      console.log("[v0] Email data:", { name, selectedDates, dayName, timeSlot, total, paymentMode, paymentMethod })
      return NextResponse.json({
        success: true,
        emailSent: false,
        message: "Resend no configurado - agregar RESEND_API_KEY en variables de entorno",
      })
    }

    const ownerEmail = "mentevivaespacio@gmail.com"
    // Enviar al email real del usuario, con copia al owner
    const recipientEmail = email

    // Generar contenido del email según el tipo
    const emailContent = isSpecialClass
      ? generateSpecialClassEmailHTML({
          name,
          specialClass,
          total,
          paymentMethod,
        })
      : generateEmailHTML({
          name,
          selectedDates: selectedDates || [],
          dayName,
          time: timeSlot,
          total,
          paymentMode,
          paymentMethod,
        })

    const subject = isSpecialClass
      ? `Confirmación de reserva - ${specialClass.title} - Mente Viva`
      : "Confirmación de inscripción - Taller de Memoria - Mente Viva"

    const { data, error } = await resend.emails.send({
      from: "Mente Viva <onboarding@resend.dev>",
      to: [recipientEmail],
      bcc: [ownerEmail], // Copia oculta al owner para seguimiento
      subject,
      html: emailContent,
    })

    if (error) {
      console.error("[v0] Resend error:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    console.log(
      "[v0] Email sent successfully to:",
      recipientEmail,
      "ID:",
      data?.id,
    )
    return NextResponse.json({
      success: true,
      emailSent: true,
      emailId: data?.id,
      recipient: recipientEmail,
    })
  } catch (error) {
    console.error("[v0] Error in send-confirmation:", error)
    return NextResponse.json({ error: "Error al procesar la confirmación" }, { status: 500 })
  }
}
