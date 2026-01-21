import { type NextRequest, NextResponse } from "next/server"

const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN

export async function POST(request: NextRequest) {
  try {
    if (!MERCADOPAGO_ACCESS_TOKEN) {
      console.log("[v0] MercadoPago Access Token not configured")
      return NextResponse.json({ error: "MercadoPago no está configurado" }, { status: 500 })
    }

    const body = await request.json()
    const { name, email, phone, selectedDates, weekday, time, total, paymentMode, productId, productTitle, paymentType } = body

    // Validar datos requeridos
    const isSpecialClass = !!productId
    if (!name || !email || !phone || !total) {
      return NextResponse.json(
        { error: "Datos incompletos para crear la preferencia de pago" },
        { status: 400 }
      )
    }
    
    // Para taller de memoria, selectedDates es requerido
    if (!isSpecialClass && !selectedDates) {
      return NextResponse.json(
        { error: "Datos incompletos para crear la preferencia de pago" },
        { status: 400 }
      )
    }

    // Validar que el total sea un número positivo
    const totalAmount = typeof total === "number" ? total : parseFloat(total)
    if (isNaN(totalAmount) || totalAmount <= 0) {
      return NextResponse.json(
        { error: "El monto total debe ser un número positivo" },
        { status: 400 }
      )
    }

    const WEEKDAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
    const dayName = WEEKDAY_NAMES[weekday] || ""

    // Get base URL for redirects - validar que sea una URL válida
    let baseUrl = request.headers.get("origin") || request.headers.get("host")
    
    // Si no tiene protocolo, agregarlo
    if (baseUrl && !baseUrl.startsWith("http")) {
      // En desarrollo puede ser localhost, en producción debe ser HTTPS
      const protocol = baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1") ? "http" : "https"
      baseUrl = `${protocol}://${baseUrl}`
    }
    
    // Fallback a URL de producción si no se puede determinar
    if (!baseUrl || !baseUrl.startsWith("http")) {
      baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://menteviva.com.ar"
    }
    
    // Asegurarse de que la URL termine sin barra
    baseUrl = baseUrl.replace(/\/$/, "")

    // Limpiar y validar teléfono
    const cleanPhone = phone.replace(/[^0-9]/g, "")
    const phoneNumber = cleanPhone.startsWith("54") ? cleanPhone.slice(2) : cleanPhone

    // Validar statement_descriptor (máximo 22 caracteres, solo letras y números)
    const statementDescriptor = "MENTE VIVA".substring(0, 22).replace(/[^a-zA-Z0-9\s]/g, "")

    // Construir URLs de retorno según el tipo de producto
    let successUrl: string
    let failureUrl: string
    let pendingUrl: string

    if (isSpecialClass) {
      // URLs para clases especiales
      const params = new URLSearchParams({
        status: "approved",
        name: name,
        email: email,
        clase: productTitle || "Clase Especial",
        total: totalAmount.toString(),
        metodo: "mercadopago",
        tipo: paymentType || "full",
      })
      successUrl = `${baseUrl}/clases-especiales/confirmacion?${params.toString()}`
      failureUrl = `${baseUrl}/clases-especiales?status=failure`
      pendingUrl = `${baseUrl}/clases-especiales/confirmacion?${new URLSearchParams({ ...Object.fromEntries(params), status: "pending" }).toString()}`
    } else {
      // URLs para taller de memoria
      // Formatear fechas para la URL
      const formattedDates = selectedDates
        .map((d: string) => {
          const date = new Date(d + "T12:00:00")
          return date.toLocaleDateString("es-AR", { day: "numeric", month: "long" })
        })
        .join(", ")
      
      const params = new URLSearchParams({
        status: "approved",
        name: name,
        email: email,
        clases: selectedDates.length.toString(),
        total: totalAmount.toString(),
        dia: weekday.toString(),
        fechas: formattedDates,
        metodo: "mercadopago",
      })
      
      successUrl = `${baseUrl}/taller-de-memoria/inscripcion/confirmacion?${params.toString()}`
      failureUrl = `${baseUrl}/taller-de-memoria/inscripcion?status=failure`
      
      const pendingParams = new URLSearchParams(params)
      pendingParams.set("status", "pending")
      pendingUrl = `${baseUrl}/taller-de-memoria/inscripcion/confirmacion?${pendingParams.toString()}`
    }

    // Validar que las URLs sean válidas
    try {
      new URL(successUrl)
      new URL(failureUrl)
      new URL(pendingUrl)
    } catch (urlError) {
      console.error("[v0] Invalid URL format:", { baseUrl, successUrl, failureUrl, pendingUrl })
      return NextResponse.json(
        { error: "Error al generar URLs de retorno. Verificá la configuración del servidor." },
        { status: 500 }
      )
    }

    // Construir título y descripción según el tipo
    let itemTitle: string
    let itemDescription: string

    if (isSpecialClass) {
      itemTitle = productTitle || "Clase Especial Mente Viva"
      itemDescription = `Reserva de ${itemTitle} para ${name}`
      if (paymentType === "deposit") {
        itemTitle += " - Seña"
        itemDescription += " (pago parcial)"
      }
    } else {
      itemTitle = `Taller de Memoria - ${selectedDates.length} clase${selectedDates.length > 1 ? "s" : ""}${dayName ? ` (${dayName} ${time})` : ""}`
      itemDescription = `Inscripción al Taller de Memoria de Mente Viva para ${name}`
    }

    const preferenceData = {
      items: [
        {
          title: itemTitle.substring(0, 256), // Máximo 256 caracteres
          description: itemDescription.substring(0, 256),
          quantity: 1,
          unit_price: totalAmount,
          currency_id: "ARS",
        },
      ],
      payer: {
        name: (name.split(" ")[0] || name).substring(0, 60),
        surname: name.split(" ").slice(1).join(" ").substring(0, 60) || "",
        email: email,
        phone: {
          area_code: "54",
          number: phoneNumber.substring(0, 11), // Máximo 11 dígitos
        },
      },
      back_urls: {
        success: successUrl,
        failure: failureUrl,
        pending: pendingUrl,
      },
      auto_return: "approved" as const,
      external_reference: `${email}-${Date.now()}`.substring(0, 256), // Máximo 256 caracteres
      statement_descriptor: statementDescriptor,
      metadata: {
        guest_name: name,
        guest_email: email,
        guest_phone: phone,
        ...(isSpecialClass
          ? {
              product_id: productId,
              product_title: productTitle,
              payment_type: paymentType || "full",
            }
          : {
              selected_dates: JSON.stringify(selectedDates),
              weekday: weekday?.toString(),
              time: time,
              payment_mode: paymentMode,
            }),
      },
    }

    // Log para debugging (solo en desarrollo)
    if (process.env.NODE_ENV === "development") {
      console.log("[v0] MercadoPago preference data:", {
        baseUrl,
        successUrl,
        hasBackUrls: !!preferenceData.back_urls,
        backUrlsKeys: Object.keys(preferenceData.back_urls),
      })
    }

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preferenceData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("[v0] MercadoPago error:", JSON.stringify(errorData, null, 2))
      
      // Mensajes de error más específicos
      let errorMessage = "Error al crear preferencia de pago"
      
      if (errorData.code === "PA_UNAUTHORIZED_RESULT_FROM_POLICIES") {
        errorMessage = "Error de autorización: Verificá que tu aplicación de MercadoPago tenga habilitado Checkout Pro y que el Access Token tenga los permisos necesarios."
      } else if (errorData.message) {
        errorMessage = errorData.message
      } else if (errorData.cause && Array.isArray(errorData.cause)) {
        errorMessage = errorData.cause.map((c: any) => c.message || c.description).join(", ")
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: errorData,
          code: errorData.code,
        },
        { status: response.status || 500 }
      )
    }

    const data = await response.json()
    console.log("[v0] MercadoPago preference created:", data.id)

    return NextResponse.json({
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point,
      id: data.id,
    })
  } catch (error) {
    console.error("[v0] Error creating MercadoPago preference:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
