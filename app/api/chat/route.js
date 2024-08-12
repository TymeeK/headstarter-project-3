import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
// import OpenAI from 'openai'

const systemPrompt = `You are a friendly and knowledgeable virtual assistant named Gemini. Your role is to assist users with their inquiries, provide accurate information, and engage in helpful conversations. Respond in a concise and clear manner, making sure to address the user's questions or concerns thoroughly. If a user asks for advice, offer thoughtful and practical suggestions. Always maintain a positive and respectful tone, regardless of the user's mood or the complexity of the query.

If the user's request is unclear, ask for clarification politely. If you don't know the answer, suggest a logical next step or offer to look it up. Your goal is to provide the best possible assistance and ensure the user has a satisfying experience.

Remember, you are a virtual assistant and should never give medical, legal, or financial advice, but instead, suggest consulting a professional. Your responses should be informative, polite, and aligned with the principles of helping and educating the user.`

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
const chat = model.startChat({
  history: [
    {
      role: 'user',
      parts: [{ text: systemPrompt }],
    },
  ],
})

export async function POST(req) {
  // console.log(req.json())
  const data = await req.json()
  console.log('data.body(received message):' + data.message)

  // const prompt = `${systemPrompt}\nUser: ${data.message}\nAssistant:`;

  try {
    // 1.single-turn chat(no context)
    // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
    // const result = await model.generateContent(prompt);
    // const response = await result.response;
    // const content = await response.text()

    // 2.multi-turn chat(with context) without streaming
    // const result = await chat.sendMessage(data.message);
    // const content = result.response.text();
    // console.log('content: ', content)
    // return NextResponse.json({message: content})

    // 3.mult-turn chat(with context) with streaming(use Gemini's sendMessageStream along with javascript's ReadableStream)
    const result = await chat.sendMessageStream(data.message)
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          const chunkText = await chunk.text() // Convert chunk to text
          console.log('Chunk received:', chunkText)
          controller.enqueue(chunkText) // Send chunk to the client
        }
        controller.close() // Close the stream when done
      },
    })

    return new NextResponse(readableStream, {
      headers: { 'Content-Type': 'text/plain' }, // Ensure correct content type
    })
  } catch (error) {
    console.error('Error generating content:', error)
    const response = NextResponse.json({
      message: 'Sorry something went wrong.',
    })
    return response
  }

  // 3. openai(not free)
  // const openai = new OpenAI()
  // const completion = await openai.chat.completions.create({
  //     model : "gpt-3.5-turbo",
  //     messages : [
  //       {"role": "system", "content": "You are a helpful assistant."},
  //       {"role": "user", "content": "What is a LLM?"}
  //     ]
  // })

  // console.log(completion.choices[0])

  // return NextResponse.json({message: content})
}
