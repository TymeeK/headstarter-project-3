'use client'

import { Box, Button, Stack, TextField } from '@mui/material'
import { useState } from 'react'

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm the Headstarter support assistant. How can I help you today?",
    },
  ])
  const [message, setMessage] = useState('')

  const sendMessage = async () => {
    setMessage('');

    const userMessage = { role: 'user', content: message };
    // setMessages([...messages, userMessage]); //append new message to messages

    // Add user's message to the chat
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' }, // Placeholder for assistant's response
    ]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({message}),
      });
      // 1.single-turn chat(no context)
      // const assistantMessage = { role: 'assistant', content: data.message };

      // setMessages((prevMessages) => [...prevMessages, assistantMessage]);
      // Update messages with the assistant's response

      // 2.multi-turn chat(with context) without streaming
      //const data = await response.json();

      // setMessages((prevMessages) => {
      //   // Replace the placeholder with the actual response
      //   const updatedMessages = [...prevMessages];
      //   const lastMessage = updatedMessages.pop();
      //   return [
      //     ...updatedMessages,
      //     { ...lastMessage, content: data.message },
      //   ];
      // });
      // console.log(messages)

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decode the chunk and append to the assistant message
        assistantMessage += decoder.decode(value, { stream: true });

        // Update the assistant message in the chat
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          const lastMessage = updatedMessages.pop(); // Get the placeholder
          return [
            ...updatedMessages,
            { ...lastMessage, content: assistantMessage },
          ];
        });
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', content: 'Sorry, something went wrong.' },
      ]);
    } finally {
      setMessage('');
    }
  }
  console.log(messages)

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Stack
        direction={'column'}
        width="500px"
        height="700px"
        border="1px solid black"
        p={2}
        spacing={3}
      >
        <Stack
          direction={'column'}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
            >
              <Box
                bgcolor={
                  message.role === 'assistant'
                    ? 'primary.main'
                    : 'secondary.main'
                }
                color="white"
                borderRadius={16}
                p={3}
              >
                {message.content}
              </Box>
            </Box>
          ))}
        </Stack>
        <Stack direction={'row'} spacing={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button variant="contained" onClick={sendMessage}>
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}