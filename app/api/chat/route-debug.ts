import { GoogleGenerativeAI } from "@google/generative-ai"

// This is a debug endpoint to test if the Gemini API is working
export async function GET() {
  try {
    // Initialize the Google Generative AI with the API key
    const apiKey = process.env.GOOGLE_API_KEY || ""
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key is not set" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    const genAI = new GoogleGenerativeAI(apiKey)

    // Get the Gemini Pro model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    // Generate a simple response
    const result = await model.generateContent('Hello, can you respond with "Gemini API is working"?')
    const response = await result.response
    const text = response.text()

    return new Response(
      JSON.stringify({
        success: true,
        message: "Gemini API test successful",
        response: text,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error: any) {
    console.error("Error testing Gemini API:", error)

    return new Response(
      JSON.stringify({
        error: "Failed to test Gemini API",
        details: error.message || "Unknown error",
        stack: error.stack || "No stack trace",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

