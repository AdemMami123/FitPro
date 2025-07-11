'use client'

import { useState, useRef, useEffect } from 'react'
import { saveChatMessage, getChatHistory } from '@/lib/actions/database.action'

interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: Date
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true)
    
    // Set initial message after hydration
    const initialMessage: Message = {
      id: 'initial-welcome',
      content: "**Hey! I'm FitPro AI 👋**\n\nI help with:\n• Workouts & exercises\n• Nutrition advice\n• Motivation & tips\n\nWhat's your question?",
      sender: 'ai',
      timestamp: new Date()
    }
    
    // Load chat history
    const loadChatHistory = async () => {
      try {
        const result = await getChatHistory('default')
        let allMessages = [initialMessage]
        
        if (result.success && result.messages && result.messages.length > 0) {
          const formattedHistory = result.messages.map(msg => ({
            id: msg.id,
            content: msg.content,
            sender: msg.sender,
            timestamp: new Date(msg.timestamp)
          }))
          
          // Add history messages, but avoid duplicates
          allMessages = [initialMessage, ...formattedHistory]
        }
        
        // Remove duplicates by ID
        const uniqueMessages = allMessages.filter((message, index, self) => 
          index === self.findIndex(m => m.id === message.id)
        )
        
        setMessages(uniqueMessages)
      } catch (error) {
        console.error('Error loading chat history:', error)
        setMessages([initialMessage])
      } finally {
        setIsLoadingHistory(false)
      }
    }
    
    loadChatHistory()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => {
      const newMessages = [...prev, userMessage]
      return newMessages.filter((message, index, self) => 
        index === self.findIndex(m => m.id === message.id)
      )
    })
    const messageToSend = inputMessage
    setInputMessage('')
    setIsLoading(true)

    try {
      // Save user message to database
      await saveChatMessage(messageToSend, 'user', 'default')

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSend,
          conversationHistory: messages.slice(-8).map(m => `${m.sender}: ${m.content}`).join('\n')
        }),
      })

      const data = await response.json()

      if (data.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          sender: 'ai',
          timestamp: new Date()
        }
        setMessages(prev => {
          const newMessages = [...prev, aiMessage]
          return newMessages.filter((message, index, self) => 
            index === self.findIndex(m => m.id === message.id)
          )
        })
        
        // Save AI response to database
        await saveChatMessage(data.response, 'ai', 'default')
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: 'Sorry, I encountered an error. Please try again.',
          sender: 'ai',
          timestamp: new Date()
        }
        setMessages(prev => {
          const newMessages = [...prev, errorMessage]
          return newMessages.filter((message, index, self) => 
            index === self.findIndex(m => m.id === message.id)
          )
        })
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages(prev => {
        const newMessages = [...prev, errorMessage]
        return newMessages.filter((message, index, self) => 
          index === self.findIndex(m => m.id === message.id)
        )
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center mb-4">
        <div className="bg-purple-100 dark:bg-purple-900/50 rounded-full p-3 mr-3">
          <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Coach Chat</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 max-h-96 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        {!isClient ? (
          <div className="text-center py-8">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className={`text-sm ${message.sender === 'ai' ? 'whitespace-pre-line' : ''}`}>
                  {message.content.split('\n').map((line, index) => {
                    const lineKey = `${message.id}-line-${index}`
                    // Handle bold text formatting
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return (
                        <div key={lineKey} className="font-semibold mt-2 mb-1 text-purple-600 dark:text-purple-400">
                          {line.replace(/\*\*/g, '')}
                        </div>
                      );
                    }
                    // Handle bullet points
                    if (line.startsWith('•')) {
                      return (
                        <div key={lineKey} className="ml-2 flex items-start">
                          <span className="text-green-500 mr-2 mt-1">•</span>
                          <span>{line.substring(1).trim()}</span>
                        </div>
                    );
                  }
                  // Handle numbered lists
                  if (/^\d+\./.test(line.trim())) {
                    return (
                      <div key={lineKey} className="ml-2 flex items-start">
                        <span className="text-blue-500 mr-2 font-medium">{line.match(/^\d+\./)?.[0]}</span>
                        <span>{line.replace(/^\d+\.\s*/, '')}</span>
                      </div>
                    );
                  }
                  // Regular text
                  return line.trim() ? (
                    <div key={lineKey} className="mb-1">
                      {line}
                    </div>
                  ) : (
                    <div key={lineKey} className="h-2"></div>
                  );
                })}
              </div>
              <p className="text-xs mt-2 opacity-70">
                {isClient ? message.timestamp.toLocaleTimeString() : ''}
              </p>
            </div>
          </div>
        ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs">FitPro AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex space-x-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything about fitness, workouts, nutrition, or tell me about your day..."
          className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          disabled={isLoading}
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !inputMessage.trim()}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  )
}
