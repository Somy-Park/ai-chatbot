'use client'
import Image from "next/image";
import { useState } from "react";
import { Box, Stack, TextField, Button} from "@mui/material";

export default function Home() {
  // All messages (AI and user)
  const[messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm the Headstarter support agent. How can I help you today?"
    },
  ])
  // User's messages
  const [message, setMessage] = useState("")
  // Send message helper function
  const sendMessage = async () => {
    if (!message.trim()) return;  // Don't send empty messages

    setMessage('') //  Clear input field
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message }, // Add user message to chat 
      { role: 'assistant', content: '' }, // Add placeholder for assistant's response
    ])
    // Send message to server 
    //try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      }).then(async (res) => {
        const reader = res.body.getReader()  // Get a reader to read the response body
        const decoder = new TextDecoder()  // Create a decoder to decode the response text

        let result = ''
        // Function to process the text from the response
        return reader.read().then(function processText({ done, value }) {
          if (done) {
            return result
          }
          const text = decoder.decode(value || new Uint8Array(), { stream: true })  // Decode the text
          setMessages((messages) => {
            let lastMessage = messages[messages.length - 1]  // Get the last message (assistant's placeholder)
            let otherMessages = messages.slice(0, messages.length - 1)  // Get all other messages
            return [
              ...otherMessages,
              { ...lastMessage, content: lastMessage.content + text },  // Append the decoded text to the assistant's message
            ]
          })
          return reader.read().then(processText)  // Continue reading the next chunk of the response
        })
      })
  }

  return (
    
    <Box // Entire screen (for flex box properties)
      width = "100vw" 
      height="100vh" 
      display = "flex"
      flexDirection={"column"} // Main axis: vertical
      justifyContent={"center"} // Center items along MAIN axis (this case vertical)
      alignItems={"center"} // Center items along CROSS axis
    >
      <Stack // Entire chat box
        direction = "column" // Lay out children vertically
        //bgcolor={"lavender"}
        width="500px"
        height="700px"
        border="1px solid black"
        p={2} // Padding (Space between all children and border of this container)
        spacing={3} // Space between the children
      >
        <Stack // Inner stack handling arrangements of chat messages
           direction={'column'}
           bgcolor={"pink"}
           spacing={2}
           flexGrow={1}
           overflow="auto" // Handle overflow with scrolling
           maxHeight="100%"
        >
          {
            messages.map((message, index) => ( // Loop over each message
              <Box  // Message box container
                key={index}
                display="flex"
                justifyContent={ // If AI, put message bubble on left. If user, put message bubble on right
                  message.role === 'assistant' ? 'flex-start' : 'flex-end'
                }
              >
                <Box  // The actual message
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
        <Stack // Container for text input field
          //bgcolor={"lightblue"}
          direction={"row"}
          spacing = {2}
        >
          <TextField  // Text field 
            label = "Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button   // Send button on side
            variant="contained"
            onClick={sendMessage}
          >
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  
  )

}
