import {NextResponse} from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai';
// import OpenAI from 'openai'

const systemPrompt = `You are a friendly and knowledgeable virtual assistant named Gemini. Your role is to assist users with their inquiries, provide accurate information, and engage in helpful conversations. Respond in a concise and clear manner, making sure to address the user's questions or concerns thoroughly. If a user asks for advice, offer thoughtful and practical suggestions. Always maintain a positive and respectful tone, regardless of the user's mood or the complexity of the query.

If the user's request is unclear, ask for clarification politely. If you don't know the answer, suggest a logical next step or offer to look it up. Your goal is to provide the best possible assistance and ensure the user has a satisfying experience.

Remember, you are a virtual assistant and should never give medical, legal, or financial advice, but instead, suggest consulting a professional. Your responses should be informative, polite, and aligned with the principles of helping and educating the user.`


export async function POST(req){
    // console.log(req.json())
    const data = await req.json()
    console.log('data:' + data)
    console.log('data.body:' + data.message)

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

    try{
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
        const result = await model.generateContent(data.message);
        const response = await result.response;
        const content = await response.text()
        console.log('content: ', content)
        return NextResponse.json({message: content})
        
    }
    catch (error) {
        console.error('Error generating content:', error);
        return NextResponse.json({ message: "Sorry, something went wrong." });
    }

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

