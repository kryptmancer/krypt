import { GoogleGenerativeAI } from "@google/generative-ai"
import type { Message } from "ai"

// Initialize the Google Generative AI with the API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "")

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    // Simple approach: just get the last user message and respond to it
    const lastUserMessage = messages.filter((m: Message) => m.role === "user").pop()

    if (!lastUserMessage) {
      return new Response(JSON.stringify({ error: "No user message found" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Prepare a prompt that includes context about being a Socratic teacher
    let prompt = lastUserMessage.content.toString()

    // If this is the first message, it's likely a topic the user wants to learn about
    if (messages.length <= 2) {
      prompt = `I want to learn about "${prompt}". Please teach me this concept by asking thoughtful questions that guide me to deeper understanding rather than just providing information directly. Start with a brief introduction and your first question.`
    }

    // Add the Socratic teaching instructions to every prompt
    const fullPrompt = `You are an AI teacher using the Socratic method. 
    Ask thoughtful questions to guide discovery.
    Provide minimal information to stimulate thinking.
    Ask one question at a time.
    Acknowledge insights and correct misconceptions.
    Increase complexity gradually.
    End each response with a thought-provoking question.
    
    Here is what I want to discuss: ${prompt}`

    // Get the Gemini model - using the correct model name
    // The error suggests we need to use a different model name or API version
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro", // Updated model name
    })

    // Generate content
    const result = await model.generateContent(fullPrompt)
    const response = await result.response
    const text = response.text()

    // Return the response as a simple JSON object
    return new Response(JSON.stringify({ text }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error: any) {
    console.error("Error calling Gemini API:", error)

    // If we still get an error with the updated model, try a fallback model
    try {
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "")
      const model = genAI.getGenerativeModel({
        model: "gemini-1.0-pro", // Fallback model
      })

      const result = await model.generateContent(
        "Please respond with a simple message saying 'Gemini API is working with this model'",
      )
      const response = await result.response
      const text = response.text()

      return new Response(
        JSON.stringify({
          text: "I encountered an issue with the primary model, but I can still respond. What would you like to learn about?",
          debug: text,
        }),
        {
          headers: { "Content-Type": "application/json" },
        },
      )
    } catch (fallbackError: any) {
      // If both models fail, return detailed error information
      return new Response(
        JSON.stringify({
          error: "Failed to process with Gemini API",
          details: error.message || "Unknown error",
          fallbackError: fallbackError.message || "Fallback also failed",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }
  }
}

