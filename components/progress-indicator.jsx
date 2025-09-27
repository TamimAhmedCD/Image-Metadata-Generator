"use client"

import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react"

export function ProgressIndicator({ total, completed, processing, errors, isActive }) {
    if (total === 0) return null

    const progress = ((completed + errors) / total) * 100
    const pending = total - completed - processing - errors

    return (
        <Card className="mb-6">
            <CardContent className="pt-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">Processing Progress</h3>
                        <span className="text-sm text-muted-foreground">
                            {completed + errors}/{total} completed
                        </span>
                    </div>

                    <Progress value={progress} className="h-2" />

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Completed: {completed}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {isActive ? (
                                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                            ) : (
                                <Clock className="w-4 h-4 text-blue-500" />
                            )}
                            <span>Processing: {processing}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span>Pending: {pending}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            <span>Errors: {errors}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
