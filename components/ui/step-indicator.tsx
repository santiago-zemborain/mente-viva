import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface Step {
  number: number
  title: string
  description?: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
  className?: string
}

export function StepIndicator({ steps, currentStep, className }: StepIndicatorProps) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between", className)}>
      {steps.map((step, index) => {
        const isCompleted = step.number < currentStep
        const isCurrent = step.number === currentStep

        return (
          <div key={step.number} className="flex flex-1 items-start gap-3 sm:flex-col sm:items-center sm:gap-0 sm:text-center">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-bold transition-colors sm:h-12 sm:w-12 sm:text-lg",
                isCompleted && "bg-primary text-primary-foreground",
                isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                !isCompleted && !isCurrent && "bg-muted text-muted-foreground",
              )}
            >
              {isCompleted ? <Check className="h-5 w-5 sm:h-6 sm:w-6" /> : step.number}
            </div>
            <div className="flex-1 sm:mt-3">
              <h4 className={cn("text-sm font-semibold sm:text-base", isCurrent ? "text-foreground" : "text-muted-foreground")}>
                {step.title}
              </h4>
              {step.description && <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{step.description}</p>}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn("hidden h-1 flex-1 sm:block", isCompleted ? "bg-primary" : "bg-muted")}
                aria-hidden="true"
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
