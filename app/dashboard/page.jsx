"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { ImageIcon, Zap } from "lucide-react"
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

    const currentApiKey = apiKeys.find((key) => key.id === selectedApiKey)
    const hasApiConfig = !!(currentApiKey && selectedModel)

    const handleFileChange = async (e) => {
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
    }

    const handleGenerateClick = async (imageId, outputType) => {
        const img = images.find((i) => i.id === imageId)
        if (!img || isProcessing || !currentApiKey || !selectedModel) return

        setIsProcessing(true)
        setImages((prev) => prev.map((i) => (i.id === imageId ? { ...i, status: "processing" } : i)))

        try {
            const base64 = await toBase64(img.file)

            const metadata = await generateMetadata(
                { file: img.file, base64, mimeType: img.file.type },
                currentApiKey,
                selectedModel,
                outputType,
            )

            setImages((prev) =>
                prev.map((i) =>
                    i.id === imageId
                        ? {
                            ...i,
                            status: "complete",
                            result: metadata,
                        }
                        : i,
                ),
            )
        } catch (error) {
            console.error(`Error processing ${img.file.name}:`, error)
            setImages((prev) =>
                prev.map((i) =>
                    i.id === imageId
                        ? {
                            ...i,
                            status: "error",
                            result: {
                                prompt: `Error: ${error.message}`,
                                title: "API ERROR",
                                keywords: "error",
                            },
                        }
                        : i,
                ),
            )
        } finally {
            setIsProcessing(false)
        }
    }

    const handleBulkGenerate = async (outputType) => {
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

                setImages((prev) => prev.map((i) => (i.id === img.id ? { ...i, status: "complete", result: metadata } : i)))
            } catch (error) {
                console.error(`Error processing ${img.file.name}:`, error)
                setImages((prev) =>
                    prev.map((i) =>
                        i.id === img.id
                            ? {
                                ...i,
                                status: "error",
                                result: {
                                    prompt: `Error: ${error.message}`,
                                    title: "API ERROR",
                                    keywords: "error",
                                },
                            }
                            : i,
                    ),
                )
            }

            // Small delay between requests to be respectful to APIs
            await new Promise((resolve) => setTimeout(resolve, 1000))
        }

        setIsProcessing(false)
    }

    const handleBulkExport = () => {
        exportBulkCSV(images, exportFormat)
    }

    const handleDeleteImage = (imageId) => {
        setImages((prev) => {
            const imageToDelete = prev.find((img) => img.id === imageId)
            if (imageToDelete?.url) {
                URL.revokeObjectURL(imageToDelete.url)
            }
            return prev.filter((img) => img.id !== imageId)
        })
    }

    const handleExportCSV = (img) => {
        // exportSingleCSV(img, exportFormat)
    }

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
                        <Badge variant="secondary" className="px-3 py-1">
                            <Zap className="w-3 h-3 mr-1" />
                            Dashboard
                        </Badge>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ApiManagement
                    apiKeys={apiKeys}
                    setApiKeys={setApiKeys}
                    selectedApiKey={selectedApiKey}
                    setSelectedApiKey={setSelectedApiKey}
                    selectedModel={selectedModel}
                    setSelectedModel={setSelectedModel}
                />

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
                />
            </div>
        </div>
    )
}
