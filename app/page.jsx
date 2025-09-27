"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Upload, Zap, Download, Settings, ImageIcon, FileText, Tags } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-balance">MetaGen AI</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link href="#docs" className="text-muted-foreground hover:text-foreground transition-colors">
                Docs
              </Link>
            </div>
            <Link href="/dashboard">
              <Button className="bg-primary hover:bg-primary/90">
                Get Started
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 hero-glow"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-2">
              <Zap className="w-4 h-4 mr-2" />
              AI-Powered Metadata Generation
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-balance mb-6">
              Transform Images into
              <span className="text-primary block">Rich Metadata</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 text-pretty">
              Generate AI prompts, titles, and keywords from your images instantly. Support for multiple AI providers
              with professional CSV export capabilities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 px-8 py-6 text-lg"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  Start Generating
                  <ArrowRight className={`ml-2 w-5 h-5 transition-transform ${isHovered ? "translate-x-1" : ""}`} />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg bg-transparent">
                <FileText className="mr-2 w-5 h-5" />
                View Documentation
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Everything you need for image metadata</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Professional-grade tools for content creators, marketers, and developers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="feature-card border-border/50 hover:border-primary/50 transition-all duration-300 animate-float">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Bulk Upload</h3>
                <p className="text-muted-foreground text-pretty">
                  Upload multiple images at once and process them individually or in batches with our intuitive
                  interface.
                </p>
              </CardContent>
            </Card>

            <Card
              className="feature-card border-border/50 hover:border-primary/50 transition-all duration-300 animate-float"
              style={{ animationDelay: "0.2s" }}
            >
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <Settings className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Multiple AI Providers</h3>
                <p className="text-muted-foreground text-pretty">
                  Connect unlimited API keys from Google AI Studio, OpenRouter, and other leading AI providers.
                </p>
              </CardContent>
            </Card>

            <Card
              className="feature-card border-border/50 hover:border-primary/50 transition-all duration-300 animate-float"
              style={{ animationDelay: "0.4s" }}
            >
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Smart Generation</h3>
                <p className="text-muted-foreground text-pretty">
                  Generate prompts only, metadata only, or complete analysis with properly formatted titles and
                  keywords.
                </p>
              </CardContent>
            </Card>

            <Card
              className="feature-card border-border/50 hover:border-primary/50 transition-all duration-300 animate-float"
              style={{ animationDelay: "0.6s" }}
            >
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <Tags className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Clean Formatting</h3>
                <p className="text-muted-foreground text-pretty">
                  Automatically formats titles without colons, semicolons, or dashes, and keywords without dashes.
                </p>
              </CardContent>
            </Card>

            <Card
              className="feature-card border-border/50 hover:border-primary/50 transition-all duration-300 animate-float"
              style={{ animationDelay: "0.8s" }}
            >
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <Download className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Professional Export</h3>
                <p className="text-muted-foreground text-pretty">
                  Export as CSV in two formats: basic (filename, title, keywords) or full (with descriptions).
                </p>
              </CardContent>
            </Card>

            <Card
              className="feature-card border-border/50 hover:border-primary/50 transition-all duration-300 animate-float"
              style={{ animationDelay: "1s" }}
            >
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Real-time Processing</h3>
                <p className="text-muted-foreground text-pretty">
                  Watch your images get processed in real-time with status tracking and error handling.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="gradient-bg rounded-3xl p-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-balance">Ready to transform your images?</h2>
            <p className="text-xl text-muted-foreground mb-8 text-pretty">
              Join thousands of content creators using MetaGen AI to streamline their workflow
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="bg-primary hover:bg-primary/90 px-8 py-6 text-lg">
                Get Started Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">MetaGen AI</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Support
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
            <p>© 2025 MetaGen AI. Built with modern web technologies.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
