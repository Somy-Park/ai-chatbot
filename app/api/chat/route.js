// Import libraries
import { NextResponse } from "next/server";
import OpenAI from "openai";

// Tells AI how it's supposed to behave 
const systemPrompt = `You are an AI customer support bot for Headstarter AI, a platform for AI-powered software engineering interviews. Your role is to assist users with account setup, platform navigation, troubleshooting, and providing information about AI interviews.
1. User Assistance: Respond in a friendly, professional manner, tailoring responses for job applicants, recruiters, or hiring managers.
2. Common Tasks: Guide users through account management, help with platform navigation and interview scheduling, troubleshoot technical issues, explain the AI interview process, and assist with billing inquiries.
3. Escalation: Direct users to human support when necessary.
4. Confidentiality: Handle all user data securely.`

export async function POST(req) { // Use Post route since we're sending info and expecting stuff back 
  const openai = new OpenAI()
  const data = await req.json() // Get json data from your request 

  // Chat completion (ai response) from request (await=> doesnt block code while waiting (multiple req can be sent at same time))
  const completion = await openai.chat.completions.create({
    messages: [
      // Set AI's behavior (forms input to AI model)
      {
        role: "system",
        content: systemPrompt
      },
      // User data that'll be passed into the messages array (combine system and user inputs to generate ai response)
      ...data,
    ],
    model: "gpt-4o-mini",
    stream: true,
  })

  // Stream the completion
  const stream = new ReadableStream({
    // Start stream
    async start(controller) {
      const encoder = new TextEncoder() // Encode text to bytes (int array)
      try {
        for await (const chunk of completion) { 
          const content = chunk.choices[0]?.delta?.content
          if (content) {
            const text = encoder.encode(content)
            controller.enqueue(text) // Send to controller
          }
        }
      } catch (error) {
        controller.error(err)
      } finally {
        controller.close()
      }
    }
  })
  return new NextResponse(stream) // Send the stream (Ai's response to user)
}