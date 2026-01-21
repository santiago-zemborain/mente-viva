import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { name, email, phone, comments } = await request.json()

    if (!process.env.RESEND_API_KEY) {
      console.log("[v0] Resend not configured, skipping email")
      return NextResponse.json({ success: true, message: "Email skipped - Resend not configured" })
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Nueva solicitud de entrevista</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #2196F3; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Nueva Solicitud de Entrevista</h1>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; margin-bottom: 20px;">
              <strong>¡Hola!</strong> Una persona se ha anotado para una entrevista inicial en Mente Viva.
            </p>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; border-left: 4px solid #2196F3;">
              <h2 style="color: #2196F3; margin-top: 0; font-size: 18px;">Datos del interesado/a:</h2>
              
              <p style="margin: 10px 0;"><strong>Nombre:</strong> ${name}</p>
              <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #2196F3;">${email}</a></p>
              <p style="margin: 10px 0;"><strong>Celular:</strong> <a href="tel:+54${phone}" style="color: #2196F3;">+54 ${phone}</a></p>
              ${comments ? `<p style="margin: 10px 0;"><strong>Comentarios:</strong> ${comments}</p>` : ""}
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 20px;">
              Recordá contactar a esta persona dentro de las próximas 48 horas hábiles.
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>Este es un email automático de Mente Viva</p>
          </div>
        </body>
      </html>
    `

    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "mentevivaespacio@gmail.com",
      subject: `Nueva solicitud de entrevista: ${name}`,
      html: htmlContent,
    })

    if (error) {
      console.log("[v0] Error sending interview notification:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    console.log("[v0] Interview notification sent successfully:", data)
    return NextResponse.json({ success: true, emailId: data?.id })
  } catch (error) {
    console.log("[v0] Error in send-interview-notification:", error)
    return NextResponse.json({ success: false, error: "Failed to send email" }, { status: 500 })
  }
}
