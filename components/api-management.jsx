"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Key, Plus, Trash2, Power, PowerOff } from "lucide-react"

export const PROVIDERS = {
    gemini: {
        name: "Google AI Studio (Gemini)",
        baseUrl: "https://generativelanguage.googleapis.com/v1/models/",
        models: [
            { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash" },
            { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro" },
            { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash" },
            { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro" },
            { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash" },
        ],
        keyFormat: "AIzaSy...",
    },
    openrouter: {
        name: "OpenRouter",
        baseUrl: "https://openrouter.ai/api/v1/chat/completions",
        models: [
            { id: "openai/gpt-5", name: "GPT-5" }, // Newest flagship model
            { id: "gpt-4o", name: "GPT-4o" },
            { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet" },
            { id: "gpt-4o-mini", name: "GPT-4o Mini" },
            { id: "claude-3-haiku", name: "Claude 3 Haiku" },
        ],
        keyFormat: "sk-or-v1-...",
    },
    anthropic: {
        name: "Anthropic",
        baseUrl: "https://api.anthropic.com/v1/messages",
        models: [
            { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet" },
            { id: "claude-3-haiku-20240307", name: "Claude 3 Haiku" },
        ],
        keyFormat: "sk-ant-...",
    },
    openai: {
        name: "OpenAI",
        baseUrl: "https://api.openai.com/v1/chat/completions",
        models: [
            { id: "gpt-4o", name: "GPT-4o" },
            { id: "gpt-4o-mini", name: "GPT-4o Mini" },
            { id: "gpt-4-turbo", name: "GPT-4 Turbo" },
        ],
        keyFormat: "sk-...",
    },
}

export function ApiManagement({
    apiKeys,
    setApiKeys,
    selectedApiKey,
    setSelectedApiKey,
    selectedModel,
    setSelectedModel,
}) {
    const [showAddForm, setShowAddForm] = useState(false)
    const [newApiKey, setNewApiKey] = useState({
        name: "",
        provider: "",
        key: "",
    })

    // Save API keys to localStorage whenever they change
    useEffect(() => {
        if (apiKeys.length > 0) {
            localStorage.setItem("api_keys", JSON.stringify(apiKeys))
        }
    }, [apiKeys])

    const addApiKey = () => {
        if (!newApiKey.name || !newApiKey.provider || !newApiKey.key) {
            alert("Please fill in all fields")
            return
        }

        const provider = PROVIDERS[newApiKey.provider]
        const apiKey = {
            id: Date.now().toString(),
            name: newApiKey.name,
            key: newApiKey.key,
            provider: newApiKey.provider,
            models: provider.models.map((m) => m.id),
            isActive: true, // Default to active
        }

        setApiKeys([...apiKeys, apiKey])
        setNewApiKey({ name: "", provider: "", key: "" })
        setShowAddForm(false)

        // Auto-select the new key if it's the first one
        if (apiKeys.length === 0) {
            setSelectedApiKey(apiKey.id)
        }
    }

    const removeApiKey = (id) => {
        const newKeys = apiKeys.filter((key) => key.id !== id)
        setApiKeys(newKeys)
        if (selectedApiKey === id) {
            setSelectedApiKey(newKeys.length > 0 ? newKeys[0].id : "")
            setSelectedModel("") // Clear model when API key is removed
        }
    }

    const toggleApiKeyStatus = (id) => {
        setApiKeys(apiKeys.map((key) => (key.id === id ? { ...key, isActive: !key.isActive } : key)))

        if (selectedApiKey === id) {
            const updatedKey = apiKeys.find((key) => key.id === id)
            if (updatedKey && !updatedKey.isActive) {
                const activeKeys = apiKeys.filter((key) => key.id !== id && key.isActive)
                setSelectedApiKey(activeKeys.length > 0 ? activeKeys[0].id : "")
                setSelectedModel("")
            }
        }
    }

    const currentApiKey = apiKeys.find((key) => key.id === selectedApiKey)
    const availableModels = currentApiKey ? PROVIDERS[currentApiKey.provider].models : []

    // Auto-select first available model when API key changes
    useEffect(() => {
        if (currentApiKey && availableModels.length > 0 && !selectedModel) {
            setSelectedModel(availableModels[0].id)
        }
    }, [selectedApiKey, currentApiKey, availableModels, selectedModel])

    return (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Key className="w-5 h-5" />
                        API Configuration
                    </div>
                    <Button onClick={() => setShowAddForm(!showAddForm)} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add API Key
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Add New API Key Form */}
                {showAddForm && (
                    <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
                        <h4 className="font-semibold">Add New API Key</h4>
                        <div className="grid md:grid-cols-4 gap-4">
                            <div>
                                <Label htmlFor="api-name">Name</Label>
                                <Input
                                    id="api-name"
                                    value={newApiKey.name}
                                    onChange={(e) => setNewApiKey((prev) => ({ ...prev, name: e.target.value }))}
                                    placeholder="My API Key"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="provider-select">Provider</Label>
                                <Select
                                    value={newApiKey.provider}
                                    onValueChange={(value) => setNewApiKey((prev) => ({ ...prev, provider: value }))}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select provider" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(PROVIDERS).map(([key, provider]) => (
                                            <SelectItem key={key} value={key}>
                                                {provider.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="api-key-input">API Key</Label>
                                <Input
                                    id="api-key-input"
                                    type="password"
                                    value={newApiKey.key}
                                    onChange={(e) => setNewApiKey((prev) => ({ ...prev, key: e.target.value }))}
                                    placeholder={
                                        newApiKey.provider
                                            ? PROVIDERS[newApiKey.provider].keyFormat
                                            : "Enter API key"
                                    }
                                    className="mt-1"
                                />
                            </div>
                            <div className="flex items-end gap-2">
                                <Button onClick={addApiKey} size="sm">
                                    Add
                                </Button>
                                <Button onClick={() => setShowAddForm(false)} variant="outline" size="sm">
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Existing API Keys */}
                {apiKeys.length > 0 && (
                    <div className="space-y-4">
                        <h4 className="font-semibold">Your API Keys</h4>
                        <div className="grid gap-3">
                            {apiKeys.map((apiKey) => (
                                <div key={apiKey.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline">{PROVIDERS[apiKey.provider].name}</Badge>
                                        <span className="font-medium">{apiKey.name}</span>
                                        <span className="text-sm text-muted-foreground">{apiKey.key.substring(0, 8)}...</span>
                                        <Badge variant={apiKey.isActive ? "default" : "secondary"} className="flex items-center gap-1">
                                            {apiKey.isActive ? <Power className="w-3 h-3" /> : <PowerOff className="w-3 h-3" />}
                                            {apiKey.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor={`toggle-${apiKey.id}`} className="text-sm">
                                                Active
                                            </Label>
                                            <Switch
                                                id={`toggle-${apiKey.id}`}
                                                checked={apiKey.isActive}
                                                onCheckedChange={() => toggleApiKeyStatus(apiKey.id)}
                                            />
                                        </div>
                                        <Button
                                            onClick={() => removeApiKey(apiKey.id)}
                                            variant="ghost"
                                            size="sm"
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* API Key and Model Selection - Only show active keys */}
                {apiKeys.filter((key) => key.isActive).length > 0 && (
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="api-key-select">Select API Key</Label>
                            <Select value={selectedApiKey} onValueChange={setSelectedApiKey}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Choose API key" />
                                </SelectTrigger>
                                <SelectContent>
                                    {apiKeys
                                        .filter((key) => key.isActive)
                                        .map((apiKey) => (
                                            <SelectItem key={apiKey.id} value={apiKey.id}>
                                                {apiKey.name} ({PROVIDERS[apiKey.provider].name})
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="model-select">Select Model</Label>
                            <Select value={selectedModel} onValueChange={setSelectedModel}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Choose model" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableModels.map((model) => (
                                        <SelectItem key={model.id} value={model.id}>
                                            {model.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}

                {apiKeys.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">No API Keys Configured</p>
                        <p className="text-sm">Add your first API key to get started with image analysis</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
