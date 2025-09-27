"use client"

import { Upload } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function ImageUpload({ onFileChange, isProcessing, hasApiConfig }) {
    return (
        <Card className="mb-8">
            <CardContent className="p-8">
                <label
                    htmlFor="image-upload"
                    className={`block text-center cursor-pointer p-12 border-2 border-dashed rounded-lg transition-all duration-200 ${hasApiConfig
                        ? "border-primary/50 hover:border-primary hover:bg-primary/5"
                        : "border-destructive/50 bg-destructive/5 text-destructive cursor-not-allowed"
                        }`}
                >
                    <Upload className="mx-auto h-12 w-12 mb-4 text-muted-foreground" />
                    <span className="text-lg font-semibold block mb-2">
                        {isProcessing ? "Processing Images..." : hasApiConfig ? "Upload Multiple Images" : "Setup Required"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                        {hasApiConfig
                            ? "Click or drag to upload images for processing"
                            : "Please configure API keys and select a model"}
                    </span>
                </label>
                <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={onFileChange}
                    multiple
                    className="hidden"
                    disabled={isProcessing || !hasApiConfig}
                />
            </CardContent>
        </Card>
    )
}
