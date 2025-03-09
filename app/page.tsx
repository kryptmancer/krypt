"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, Send, BrainCircuit } from "lucide-react"

// Define message type
type Message = {
  role: "user" | "assistant"
  content: string
}

export default function Krypt() {
  const [topic, setTopic] = useState("")
  const [isStarted, setIsStarted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Custom implementation of chat functionality
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() && !topic.trim()) return

    // Use topic if we're just starting, otherwise use input
    const messageContent = isStarted ? input : topic

    if (!messageContent.trim()) return

    // Add user message to the chat
    const userMessage: Message = {
      role: "user",
      content: messageContent.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)
    setError(null)

    // Clear input field
    setInput("")
    setTopic("")
    setIsStarted(true)

    try {
      // First try the main API endpoint
      let response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      })

      // If the main API fails, try the fallback
      if (!response.ok) {
        console.log("Main API failed, trying fallback...")
        response = await fetch("/api/chat/route-fallback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [...messages, userMessage],
          }),
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to get response")
      }

      const data = await response.json()

      // Add assistant message to the chat
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.text,
        },
      ])
    } catch (err: any) {
      console.error("Error in chat:", err)
      setError(err.message || "Failed to get a response. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <main className="flex-1 max-w-4xl mx-auto w-full p-4">
        <div className="flex items-center justify-center mb-8 mt-4">
          <BrainCircuit className="h-8 w-8 mr-2 text-emerald-400" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
            Krypt
          </h1>
        </div>

        {!isStarted ? (
          <Card className="bg-zinc-900 border-zinc-800 shadow-lg shadow-emerald-900/20">
            <CardContent className="pt-6 pb-2">
              <div className="space-y-6">
                <Input
                  placeholder="What do you want to learn?"
                  className="min-h-[60px] text-lg bg-zinc-800 border-zinc-700 focus:border-emerald-500 focus:ring-emerald-500/20"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && topic.trim()) {
                      e.preventDefault()
                      handleSubmit(e)
                    }
                  }}
                />

                <Button
                  className="w-full py-6 text-lg bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 border-0"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={!topic.trim() || isLoading}
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Begin"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-zinc-900 border-zinc-800 shadow-lg shadow-emerald-900/20 h-[85vh] flex flex-col">
            <CardContent className="flex-grow overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-800">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === "user"
                          ? "bg-gradient-to-r from-emerald-600 to-blue-700 text-white"
                          : "bg-zinc-800 text-zinc-100 border border-zinc-700"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg p-4 bg-zinc-800 border border-zinc-700">
                      <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex justify-center">
                    <div className="max-w-[80%] rounded-lg p-4 bg-red-900/30 border border-red-800 text-red-200">
                      <p>{error}</p>
                      <Button
                        onClick={() => setError(null)}
                        variant="outline"
                        className="mt-2 border-red-700 hover:bg-red-800/30 text-red-200"
                        size="sm"
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </CardContent>

            <CardFooter className="border-t border-zinc-800 p-4">
              <form onSubmit={handleSubmit} className="w-full flex gap-2">
                <Input
                  placeholder="Your response..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  className="flex-1 bg-zinc-800 border-zinc-700 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 border-0"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
            </CardFooter>
          </Card>
        )}
      </main>
    </div>
  )
}

