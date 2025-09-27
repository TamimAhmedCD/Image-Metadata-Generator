"use client"

import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react"
import { validateKeywords } from "@/lib/seo-keywords"

export function KeywordValidator({ keywords, className }) {
    if (!keywords || keywords === "error") return null

    const validation = validateKeywords(keywords)

    const getIcon = () => {
        if (validation.isValid) {
            return <CheckCircle className="w-3 h-3" />
        } else if (validation.count < 30) {
            return <AlertTriangle className="w-3 h-3" />
        } else {
            return <XCircle className="w-3 h-3" />
        }
    }

    const getVariant = () => {
        if (validation.isValid) return "secondary"
        if (validation.count < 30) return "outline"
        return "destructive"
    }

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <Badge variant={getVariant()} className="flex items-center gap-1 text-xs">
                {getIcon()}
                {validation.count} keywords
            </Badge>
            {validation.isValid && (
                <Badge variant="default" className="flex items-center gap-1 text-xs bg-blue-100 text-blue-800">
                    <Info className="w-3 h-3" />
                    Adobe Stock Ready
                </Badge>
            )}
        </div>
    )
}
