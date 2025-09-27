"use client"

import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertTriangle } from "lucide-react"
import { ADOBE_STOCK_GUIDELINES } from "@/lib/adobe-stock-guidelines"

export function TitleValidator({ title, className }) {
    if (!title) return null

    const length = title.length
    const maxLength = ADOBE_STOCK_GUIDELINES.title.maxLength
    const hasForbiddenChars = /[:\-;]/.test(title)

    const isValid = length <= maxLength && !hasForbiddenChars && length > 0

    const getIcon = () => {
        if (isValid) return <CheckCircle className="w-3 h-3" />
        return <AlertTriangle className="w-3 h-3" />
    }

    const getVariant = () => {
        if (isValid) return "secondary"
        return "outline"
    }

    const getMessage = () => {
        if (hasForbiddenChars) return "Contains forbidden characters (: - ;)"
        if (length > maxLength) return `Too long (${length}/${maxLength} chars)`
        if (isValid) return `Perfect (${length}/${maxLength} chars)`
        return `${length}/${maxLength} chars`
    }

    return (
        <Badge variant={getVariant()} className={`flex items-center gap-1 text-xs ${className}`}>
            {getIcon()}
            {getMessage()}
        </Badge>
    )
}
