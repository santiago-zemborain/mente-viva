import type { Metadata } from "next"
import Link from "next/link"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Preguntas Frecuentes",
  description: "Respuestas a las preguntas más comunes sobre Mente Viva y nuestros servicios.",
}

const faqs = [
  {
    question: "¿Necesito derivación médica para asistir al taller?",
    answer:
      "No, no necesitás derivación médica. Sin embargo, realizamos una entrevista previa para conocerte y asegurarnos de que el taller sea el espacio adecuado para vos.",
  },
  {
    question: "¿El taller es solo para adultos mayores?",
    answer:
      "El Taller de Memoria está orientado principalmente a adultos mayores, pero nuestras clases especiales, eventos y formaciones están abiertas a personas de todas las edades.",
  },
  {
    question: "¿Qué pasa si no puedo asistir a una clase?",
    answer:
      "Si avisás con anticipación, podemos reprogramar la clase para otro día del mismo mes, sujeto a disponibilidad de cupo.",
  },
  {
    question: "¿Puedo probar una clase antes de inscribirme al mes?",
    answer:
      "Sí, ofrecemos una clase de prueba para que puedas conocer el espacio y la metodología antes de comprometerte con el mes completo. Primero necesitás completar la entrevista virtual.",
  },
  {
    question: "¿Cómo son los métodos de pago?",
    answer:
      "Aceptamos pago por MercadoPago (link de pago) o transferencia bancaria. No trabajamos con tarjetas de crédito directamente.",
  },
  {
    question: "¿Qué incluye el valor de cada clase?",
    answer:
      "El valor incluye la clase de 1h30, infusiones (té, café), algo para comer, material de trabajo y seguimiento personalizado si lo necesitás.",
  },
  {
    question: "¿Puedo cambiar de horario una vez inscripto?",
    answer:
      "Al inscribirte elegís un horario fijo (miércoles o viernes) para todo el mes. Los cambios de horario se evalúan caso por caso según disponibilidad.",
  },
  {
    question: "¿Emiten factura?",
    answer: "Sí, podemos emitir factura. Solicitala al momento de realizar el pago.",
  },
]

// Configurar como estática
export const dynamic = 'force-static'

export default function FAQPage() {
  return (
    <div className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold">Preguntas Frecuentes</h1>
          <p className="text-xl text-muted-foreground">
            Encontrá respuestas a las preguntas más comunes sobre nuestros servicios.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-lg">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 rounded-xl bg-muted/50 p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold">¿No encontraste lo que buscabas?</h2>
          <p className="mb-6 text-muted-foreground">Contactanos y te ayudamos con tu consulta.</p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button asChild>
              <a href="https://wa.me/5491125790108" target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            </Button>
            <Button asChild variant="outline">
              <Link href="/contacto">Formulario de contacto</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
