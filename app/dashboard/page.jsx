"use client"

import { useState, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { ImageIcon, Zap, Settings } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"
import { ApiManagement } from "@/components/api-management"
import { ImageUpload } from "@/components/image-upload"
import { BulkActions } from "@/components/bulk-actions"
import { ImageResults } from "@/components/image-results"
import { generateMetadata, toBase64 } from "@/lib/metadata-generator"
import { exportSingleCSV, exportBulkCSV } from "@/lib/csv-export"

export default function Dashboard() {
    const [apiKeys, setApiKeys] = useState([])
    const [selectedApiKey, setSelectedApiKey] = useState("")
    const [selectedModel, setSelectedModel] = useState("")
    const [images, setImages] = useState([])
    const [isProcessing, setIsProcessing] = useState(false)
    const [exportFormat, setExportFormat] = useState("full")

    const currentApiKey = apiKeys.find((key) => key.id === selectedApiKey && key.isActive)
    const hasApiConfig = !!(currentApiKey && selectedModel)

    const handleFileChange = useCallback(async (e) => {
        const files = Array.from(e.target.files || [])
        if (!files.length) return

        const newImages = files.map((file) => ({
            id: Date.now() + Math.random(),
            file: file,
            url: URL.createObjectURL(file),
            status: "pending",
            result: null,
        }))

        setImages((prev) => [...newImages, ...prev])
    }, [])

    const updateImageStatus = useCallback((imageId, status, result) => {
        setImages((prev) => prev.map((img) => (img.id === imageId ? { ...img, status, ...(result && { result }) } : img)))
    }, [])

    const handleGenerateClick = useCallback(
        async (imageId, outputType) => {
            const img = images.find((i) => i.id === imageId)
            if (!img || isProcessing || !currentApiKey || !selectedModel) return

            setIsProcessing(true)
            updateImageStatus(imageId, "processing")

            try {
                const base64 = await toBase64(img.file)

                const metadata = await generateMetadata(
                    { file: img.file, base64, mimeType: img.file.type },
                    currentApiKey,
                    selectedModel,
                    outputType,
                )

                updateImageStatus(imageId, "complete", metadata)
            } catch (error) {
                console.error(`Error processing ${img.file.name}:`, error)
                const errorMessage = error.message || "Unknown error occurred"
                const isServiceUnavailable = errorMessage.includes("Service temporarily unavailable")

                updateImageStatus(imageId, "error", {
                    prompt: `Error: ${errorMessage}${isServiceUnavailable ? "\n\nTip: Click the retry button to try again." : ""}`,
                    title: "API ERROR",
                    keywords: "error",
                    canRetry:
                        isServiceUnavailable || errorMessage.includes("Rate limit") || errorMessage.includes("Server error"),
                })
            } finally {
                setIsProcessing(false)
            }
        },
        [images, isProcessing, currentApiKey, selectedModel, updateImageStatus],
    )

    const handleBulkGenerate = useCallback(
        async (outputType) => {
            const pendingImages = images.filter((img) => img.status === "pending")
            if (pendingImages.length === 0 || isProcessing || !currentApiKey || !selectedModel) return

            setIsProcessing(true)

            // Mark all pending images as processing
            setImages((prev) => prev.map((img) => (img.status === "pending" ? { ...img, status: "processing" } : img)))

            // Process images sequentially to avoid rate limits
            for (const img of pendingImages) {
                try {
                    const base64 = await toBase64(img.file)
                    const metadata = await generateMetadata(
                        { file: img.file, base64, mimeType: img.file.type },
                        currentApiKey,
                        selectedModel,
                        outputType,
                    )

                    updateImageStatus(img.id, "complete", metadata)
                } catch (error) {
                    console.error(`Error processing ${img.file.name}:`, error)
                    const errorMessage = error.message || "Unknown error occurred"
                    const isServiceUnavailable = errorMessage.includes("Service temporarily unavailable")

                    updateImageStatus(img.id, "error", {
                        prompt: `Error: ${errorMessage}`,
                        title: "API ERROR",
                        keywords: "error",
                        canRetry:
                            isServiceUnavailable || errorMessage.includes("Rate limit") || errorMessage.includes("Server error"),
                    })
                }

                await new Promise((resolve) => setTimeout(resolve, 2000))
            }

            setIsProcessing(false)
        },
        [images, isProcessing, currentApiKey, selectedModel, updateImageStatus],
    )

    const handleBulkExport = useCallback(() => {
        exportBulkCSV(images, exportFormat)
    }, [images, exportFormat])

    const handleDeleteImage = useCallback((imageId) => {
        setImages((prev) => {
            const imageToDelete = prev.find((img) => img.id === imageId)
            if (imageToDelete?.url) {
                URL.revokeObjectURL(imageToDelete.url)
            }
            return prev.filter((img) => img.id !== imageId)
        })
    }, [])

    const handleExportCSV = useCallback(
        (img) => {
            exportSingleCSV(img, exportFormat)
        },
        [exportFormat],
    )

    const handleRetryImage = useCallback(
        async (imageId) => {
            const img = images.find((i) => i.id === imageId)
            if (!img || isProcessing || !currentApiKey || !selectedModel) return

            updateImageStatus(imageId, "pending")

            setTimeout(() => {
                handleGenerateClick(imageId, "full")
            }, 100)
        },
        [images, isProcessing, currentApiKey, selectedModel, updateImageStatus, handleGenerateClick],
    )

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <ImageIcon className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <span className="text-xl font-bold">MetaGen AI</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Badge variant="secondary" className="px-3 py-1">
                                <Zap className="w-3 h-3 mr-1" />
                                Dashboard
                            </Badge>
                            <ThemeToggle />
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Tabs defaultValue="generate" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8">
                        <TabsTrigger value="generate" className="flex items-center gap-2">
                            <ImageIcon className="w-4 h-4" />
                            Generate
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            API Settings
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="generate" className="space-y-8">
                        <ImageUpload onFileChange={handleFileChange} isProcessing={isProcessing} hasApiConfig={hasApiConfig} />

                        <BulkActions
                            images={images}
                            isProcessing={isProcessing}
                            hasApiConfig={hasApiConfig}
                            exportFormat={exportFormat}
                            setExportFormat={setExportFormat}
                            onBulkGenerate={handleBulkGenerate}
                            onBulkExport={handleBulkExport}
                        />

                        <ImageResults
                            images={images}
                            isProcessing={isProcessing}
                            hasApiConfig={hasApiConfig}
                            exportFormat={exportFormat}
                            onGenerate={handleGenerateClick}
                            onExport={handleExportCSV}
                            onDelete={handleDeleteImage}
                            onRetry={handleRetryImage}
                        />
                    </TabsContent>

                    <TabsContent value="settings">
                        <ApiManagement
                            apiKeys={apiKeys}
                            setApiKeys={setApiKeys}
                            selectedApiKey={selectedApiKey}
                            setSelectedApiKey={setSelectedApiKey}
                            selectedModel={selectedModel}
                            setSelectedModel={setSelectedModel}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
