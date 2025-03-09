import type { Message } from "ai"

// This is a fallback API route that simulates AI responses when the Gemini API is not available
export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    // Get the last user message
    const lastUserMessage = messages.filter((m: Message) => m.role === "user").pop()

    if (!lastUserMessage) {
      return new Response(JSON.stringify({ error: "No user message found" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Extract the topic or question from the user message
    const userInput = lastUserMessage.content.toString()

    // Generate a response based on the user input
    let response = ""

    // If this is the first message, it's likely a topic
    if (messages.length <= 2) {
      response = generateIntroResponse(userInput)
    } else {
      // For follow-up questions, generate a follow-up response
      response = generateFollowUpResponse(userInput)
    }

    // Simulate a delay to make it feel more natural
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return new Response(JSON.stringify({ text: response }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error: any) {
    console.error("Error in fallback API:", error)

    return new Response(
      JSON.stringify({
        error: "Failed to generate response",
        details: error.message || "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

// Generate an introduction response for a given topic
function generateIntroResponse(topic: string): string {
  const introResponses = [
    `Let's explore ${topic} together. This is a fascinating area with many interesting concepts to unpack. To start, what do you already know about ${topic}?`,

    `${topic} is a rich subject with many dimensions to explore. Before we dive deep, I'm curious: what aspects of ${topic} interest you the most?`,

    `I'd be happy to help you learn about ${topic}. To make our discussion more effective, could you share what sparked your interest in this topic?`,

    `${topic} has many interesting facets. To begin our exploration, what questions do you have about ${topic} that you're most eager to understand?`,

    `${topic} is a great topic to explore. Let's start with the basics: what's your current understanding of ${topic}, and what would you like to learn more about?`,
  ]

  // Return a random introduction response
  return introResponses[Math.floor(Math.random() * introResponses.length)]
}

// Generate a follow-up response
function generateFollowUpResponse(input: string): string {
  const followUpResponses = [
    `That's an interesting perspective. Have you considered how this relates to other aspects of the topic? What connections do you see?`,

    `Good thinking. Let's dig deeper into that idea. What do you think would happen if we applied this concept in a different context?`,

    `You've raised some important points. How might these ideas be challenged or critiqued by someone with a different viewpoint?`,

    `I appreciate your thoughts on this. Let's consider the implications: what might be some real-world consequences of what we've discussed?`,

    `That's a thoughtful response. To build on this, what questions does this raise for you that we haven't addressed yet?`,
  ]

  // Return a random follow-up response
  return followUpResponses[Math.floor(Math.random() * followUpResponses.length)]
}

