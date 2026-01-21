"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { EditSpecialClassDialog } from "./edit-special-class-dialog"
import type { Product } from "@/lib/types"

interface Props {
  product: Product
}

export function EditSpecialClassButton({ product }: Props) {
  return <EditSpecialClassDialog product={product} />
}

