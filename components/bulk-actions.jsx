"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { FileText, Tags, Zap, Download, Loader2 } from "lucide-react"
import { ProgressIndicator } from "./progress-indicator"


export function BulkActions({
    images,
    isProcessing,
    hasApiConfig,
    exportFormat,
    setExportFormat,
    onBulkGenerate,
    onBulkExport,
}) {
    const pendingImages = images.filter((img) => img.status === "pending")
    const processingImages = images.filter((img) => img.status === "processing")
    const completedImages = images.filter((img) => img.status === "complete")
    const errorImages = images.filter((img) => img.status === "error")
    const hasResults = completedImages.length > 0

    if (images.length === 0) return null

    return (
        <div className="space-y-6">
            <ProgressIndicator
                total={images.length}
                completed={completedImages.length}
                processing={processingImages.length}
                errors={errorImages.length}
                isActive={isProcessing}
            />

            {/* Bulk Generation Actions */}
            {pendingImages.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="w-5 h-5" />
                            Bulk Actions ({pendingImages.length} pending images)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Button
                                onClick={() => onBulkGenerate("prompt_only")}
                                disabled={isProcessing || !hasApiConfig}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                                Generate All Prompts
                            </Button>
                            <Button
                                onClick={() => onBulkGenerate("metadata_only")}
                                disabled={isProcessing || !hasApiConfig}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Tags className="w-4 h-4" />}
                                Generate All Metadata
                            </Button>
                            <Button
                                onClick={() => onBulkGenerate("full")}
                                disabled={isProcessing || !hasApiConfig}
                                className="flex items-center gap-2"
                            >
                                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                                Generate All Full
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Export Options */}
            {hasResults && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Download className="w-5 h-5" />
                            Export All Results ({completedImages.length} completed)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <RadioGroup value={exportFormat} onValueChange={setExportFormat} className="flex gap-6">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="full" id="full" />
                                <Label htmlFor="full">Full: Filename, Title, Description, Keywords</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="basic" id="basic" />
                                <Label htmlFor="basic">Basic: Filename, Title, Keywords</Label>
                            </div>
                        </RadioGroup>
                        <Button onClick={onBulkExport} className="w-full">
                            <Download className="w-4 h-4 mr-2" />
                            Export All as {exportFormat.toUpperCase()} CSV
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
