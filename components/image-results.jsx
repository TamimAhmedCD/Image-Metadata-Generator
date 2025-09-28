"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    FileText,
    Tags,
    Zap,
    Download,
    Loader2,
    CheckCircle,
    XCircle,
    Clock,
    Trash2,
    Sparkles,
    RotateCcw,
    AlertTriangle,
} from "lucide-react"
import { KeywordValidator } from "./keyword-validator"
import { TitleValidator } from "./title-validator"
import { CopyButton } from "./copy-button"
import { validateKeywords } from "@/lib/seo-keywords"
import { memo } from "react"
const ImageCard = memo(
    ({
        img,
        isProcessing,
        hasApiConfig,
        exportFormat,
        onGenerate,
        onExport,
        onDelete,
        onRetry,
    }) => {
        const getStatusIcon = (status) => {
            switch (status) {
                case "processing":
                    return <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />
                case "complete":
                    return <CheckCircle className="w-4 h-4 text-green-500" />
                case "error":
                    return <XCircle className="w-4 h-4 text-red-500" />
                default:
                    return <Clock className="w-4 h-4 text-muted-foreground" />
            }
        }

        const keywordValidation = img.result?.keywords ? validateKeywords(img.result.keywords) : null
        const canRetry = img.status === "error" && img.result?.canRetry

        return (
            <Card className="overflow-hidden">
                <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-6">
                        <img
                            src={img.url || "/placeholder.svg"}
                            alt={img.file.name}
                            className="w-24 h-24 object-cover rounded-lg border"
                        />
                        <div className="flex-grow">
                            <h3 className="text-lg font-semibold truncate mb-1">{img.file.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">Size: {(img.file.size / 1024 / 1024).toFixed(2)} MB</p>
                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge
                                    variant={
                                        img.status === "processing"
                                            ? "default"
                                            : img.status === "complete"
                                                ? "secondary"
                                                : img.status === "error"
                                                    ? "destructive"
                                                    : "outline"
                                    }
                                    className="flex items-center gap-1 w-fit"
                                >
                                    {getStatusIcon(img.status)}
                                    {img.status.toUpperCase()}
                                </Badge>
                                {img.result?.title && <TitleValidator title={img.result.title} />}
                                {img.result?.keywords && <KeywordValidator keywords={img.result.keywords} />}
                            </div>
                        </div>
                        <Button
                            onClick={() => onDelete(img.id)}
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>

                    {img.status === "error" && img.result?.prompt && (
                        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                                <div className="flex-grow">
                                    <h4 className="font-medium text-destructive mb-2">Processing Error</h4>
                                    <p className="text-sm text-muted-foreground whitespace-pre-line">{img.result.prompt}</p>
                                    {canRetry && onRetry && (
                                        <Button
                                            onClick={() => onRetry(img.id)}
                                            variant="outline"
                                            size="sm"
                                            className="mt-3 border-destructive/20 hover:bg-destructive/10"
                                            disabled={isProcessing || !hasApiConfig}
                                        >
                                            <RotateCcw className="w-4 h-4 mr-2" />
                                            Retry Generation
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {img.status === "pending" && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                            <Button
                                onClick={() => onGenerate(img.id, "prompt_only")}
                                disabled={isProcessing || !hasApiConfig}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <FileText className="w-4 h-4" />
                                Generate Prompt Only
                            </Button>
                            <Button
                                onClick={() => onGenerate(img.id, "metadata_only")}
                                disabled={isProcessing || !hasApiConfig}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <Tags className="w-4 h-4" />
                                Generate Metadata Only
                            </Button>
                            <Button
                                onClick={() => onGenerate(img.id, "full")}
                                disabled={isProcessing || !hasApiConfig}
                                className="flex items-center gap-2"
                            >
                                <Zap className="w-4 h-4" />
                                Generate Full
                            </Button>
                        </div>
                    )}

                    {img.result && img.status === "complete" && (
                        <div className="grid md:grid-cols-2 gap-6">
                            {img.result.prompt && (
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <Label className="text-base font-semibold text-primary">AI Prompt (Description)</Label>
                                        <CopyButton text={img.result.prompt} />
                                    </div>
                                    <Textarea readOnly className="min-h-32 bg-muted/50" value={img.result.prompt} />
                                </div>
                            )}

                            {(img.result.title || img.result.keywords) && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Label className="text-base font-semibold text-primary">Adobe Stock Metadata</Label>
                                        {keywordValidation?.isValid && (
                                            <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                                                <Sparkles className="w-3 h-3" />
                                                Stock Ready
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        <div className="p-3 bg-muted/50 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <Label className="text-sm font-medium">Title (Max 70 chars):</Label>
                                                <div className="flex items-center gap-2">
                                                    {img.result.title && <TitleValidator title={img.result.title} />}
                                                    {img.result.title && <CopyButton text={img.result.title} />}
                                                </div>
                                            </div>
                                            <p className="font-medium">{img.result.title || "N/A"}</p>
                                        </div>
                                        <div className="p-3 bg-muted/50 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <Label className="text-sm font-medium">Keywords (30-49 required):</Label>
                                                <div className="flex items-center gap-2">
                                                    {keywordValidation && (
                                                        <span
                                                            className={`text-xs ${keywordValidation.isValid ? "text-green-600" : "text-amber-600"}`}
                                                        >
                                                            {keywordValidation.count} keywords
                                                        </span>
                                                    )}
                                                    {img.result.keywords && <CopyButton text={img.result.keywords} />}
                                                </div>
                                            </div>
                                            <p className="text-sm">{img.result.keywords || "N/A"}</p>
                                            {keywordValidation && !keywordValidation.isValid && (
                                                <p className="text-xs text-amber-600 mt-1">{keywordValidation.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    <Button onClick={() => onExport(img)} className="w-full" disabled={img.status !== "complete"}>
                                        <Download className="w-4 h-4 mr-2" />
                                        Export {exportFormat.toUpperCase()} as CSV
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        )
    },
)

ImageCard.displayName = "ImageCard"

export function ImageResults({
    images,
    isProcessing,
    hasApiConfig,
    exportFormat,
    onGenerate,
    onExport,
    onDelete,
    onRetry,
}) {
    if (images.length === 0) {
        return (
            <Card>
                <CardContent className="p-12 text-center">
                    <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">📷</div>
                    <p className="text-lg font-medium text-muted-foreground mb-2">No images uploaded yet</p>
                    <p className="text-sm text-muted-foreground">Configure your API keys and upload images to get started</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {images.map((img) => (
                <ImageCard
                    key={`image-${img.id}-${img.status}`}
                    img={img}
                    isProcessing={isProcessing}
                    hasApiConfig={hasApiConfig}
                    exportFormat={exportFormat}
                    onGenerate={onGenerate}
                    onExport={onExport}
                    onDelete={onDelete}
                    onRetry={onRetry}
                />
            ))}
        </div>
    )
}
