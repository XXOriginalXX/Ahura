import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, TrendingUp, Camera, X, AlertTriangle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const FinanceChatbot = () => {
  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [apiKey, setApiKey] = useState("AIzaSyDYraZrXVcJMxs2_83m4ueFrvl9cL_QI0s"); // Pre-set API key
  const messagesEndRef = useRef(null);
  const screenshotImageRef = useRef(null);
  
  // Updated API Configuration for Gemini 2.0
  // Updated to match the correct endpoints from the first code
  const GEMINI_MODEL = "gemini-2.0-flash"; // Using the flash model for faster responses
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent`;
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial welcome message
  useEffect(() => {
    setMessages([
      { 
        type: 'bot', 
        content: "Hello! I'm your Indian Stock Market Assistant powered by vector research. How can I help you today?",
        isInfo: false
      },
      {
        type: 'bot',
        content: "I can analyze stock charts and provide educational information about what I see. Remember that all analysis is for educational purposes only.",
        isDisclaimer: true
      },
      {
        type: 'bot',
        content: " You can analyze charts by saying 'analyze chart' or 'look at this chart'.",
        isInfo: true
      }
    ]);
  }, []);

  // Function to handle API errors consistently
  const handleApiError = (error) => {
    console.error("API Error:", error);
    
    if (error.response) {
      const status = error.response.status;
      if (status === 403) {
        return "API access denied. Your API key may be invalid or has reached its quota limit. Try updating your API key with '/apikey YOUR_NEW_KEY'";
      } else if (status === 429) {
        return "Too many requests to the API. Please wait a moment before trying again.";
      } else if (status === 404 || status === 400) {
        return "API endpoint not found or bad request. The Gemini API services may have changed. Check if you're using the correct endpoints.";
      }
    } else if (error.message && error.message.includes('Network Error')) {
      return "Network connection error. Please check your internet connection.";
    }
    
    return `Error: ${error.message || "Unknown error"}. Please try again or update your API key with '/apikey YOUR_NEW_KEY'`;
  };

  // Improved image to base64 conversion
  const imageToBase64 = (imgElement) => {
    try {
      const canvas = document.createElement("canvas");
      // Limit dimensions to avoid exceeding API size limits
      const MAX_DIMENSION = 1024;
      let width = imgElement.width;
      let height = imgElement.height;
      
      // Scale down if necessary
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.floor(height * (MAX_DIMENSION / width));
          width = MAX_DIMENSION;
        } else {
          width = Math.floor(width * (MAX_DIMENSION / height));
          height = MAX_DIMENSION;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(imgElement, 0, 0, width, height);
      
      // Use medium quality (0.8) to ensure reasonable file size
      const base64Data = canvas.toDataURL("image/jpeg", 0.8).split(',')[1];
      
      // Verify we have valid data
      if (!base64Data || base64Data.length < 100) {
        console.error("Base64 conversion produced invalid or too small data");
        throw new Error("Failed to properly convert image to base64");
      }
      
      return base64Data;
    } catch (error) {
      console.error("Error in base64 conversion:", error);
      throw error;
    }
  };

  // Updated function to call Gemini API for image-based analysis
  const callGeminiWithImage = async (imageBase64) => {
    try {
      // Log image size for debugging
      console.log("Base64 image size (bytes):", imageBase64.length);
      
      const requestData = {
        contents: [
          {
            parts: [
              { 
                text: `You are a professional financial chart analyst specializing in Indian markets. 
                Analyze this chart image in detail and provide:
                1) Overall trend direction and strength
                2)When should i buy the stock or it it buyable
                3) Key resistance levels (specific price points)
                4) Key support levels (specific price points)
                5) Pattern identification (like head and shoulders, cup and handle, etc.)
                6) Volume analysis if visible
                
                Format your response as structured text with the following sections:
                TREND: (description)
                RESISTANCE: (levels)
                SUPPORT: (levels)
                PATTERNS: (description)
                VOLUME: (analysis)
                EDUCATION: (1-2 sentences explaining what these patterns typically mean)
                
                IMPORTANT: Never make definitive price predictions. Always present information as educational content rather than direct advice.
                Include this disclaimer: "This is educational information about chart patterns, not financial advice. Past patterns don't guarantee future results."`
              },
              { 
                inline_data: {
                  mime_type: "image/jpeg",
                  data: imageBase64
                }
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 350
        }
      };
      
      const response = await axios.post(
        `${GEMINI_API_URL}?key=${apiKey}`,
        requestData,
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      if (!response.data || !response.data.candidates || response.data.candidates.length === 0) {
        throw new Error("Empty response from API");
      }
      
      const candidate = response.data.candidates[0];
      if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        throw new Error("Invalid response format from API");
      }
      
      const responseText = candidate.content.parts[0].text;
      
      // Parse the response into structured data
      const extractSection = (section) => {
        const regex = new RegExp(`${section}:\\s*(.*?)(?=\\n\\w+:|$)`, 'is');
        const match = responseText.match(regex);
        return match ? match[1].trim() : `${section} information not available`;
      };
      
      return {
        trend: extractSection('TREND'),
        resistance: extractSection('RESISTANCE'),
        support: extractSection('SUPPORT'),
        patterns: extractSection('PATTERNS'),
        volume: extractSection('VOLUME'),
        education: extractSection('EDUCATION'),
        disclaimer: "This is educational information about chart patterns, not financial advice. Past patterns don't guarantee future results."
      };
    } catch (error) {
      console.error("Gemini API error details:", error.response?.data || error.message);
      throw error; // Rethrow to be handled by the calling function
    }
  };

  // Updated function to call Gemini API for text responses
  const fetchGeminiResponse = async (userInput) => {
    try {
      const requestData = { 
        contents: [
          { 
            parts: [
              { 
                text: `You are a financial assistant specializing in Indian stock markets.
                Provide brief, educational answers about the query: ${userInput}
                
                Focus on:
                1. Explaining relevant concepts clearly
                2. Providing general market information
                3. Sharing educational context about trading patterns or trends
                4. Give specific investment advice or recommendations
                5. Make price predictions or forecast market movements
                6. Suggest specific buy/sell actions
                
                If asked about specific stocks or investments, provide educational information only and remind the user you can only offer general market education, not personalized financial advice.
                
                Keep your response under 150 words and focus on being educational.`
              }
            ] 
          }
        ],
        generationConfig: {
          maxOutputTokens: 150
        }
      };
      
      const response = await axios.post(
        `${GEMINI_API_URL}?key=${apiKey}`,
        requestData,
        { headers: { "Content-Type": "application/json" } }
      );
      
      if (!response.data || !response.data.candidates || response.data.candidates.length === 0) {
        throw new Error("Empty response from API");
      }
      
      const candidate = response.data.candidates[0];
      if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        throw new Error("Invalid response format from API");
      }
      
      let aiResponse = candidate.content.parts[0].text || "I couldn't generate a response.";
      
      // Clean up the response to make it more conversational
      aiResponse = aiResponse
        .replace(/^(Hi|Hello|Greetings|Hey).*?\,\s*/i, "")
        .replace(/\s*As a financial assistant,\s*/i, "")
        .trim();
        
      return aiResponse;
    } catch (error) {
      console.error("Gemini API error:", error);
      throw error;
    }
  };

  // Educational content about market patterns
  const marketPatterns = {
    "bullish": "A bullish pattern suggests potential upward price movement. Common indicators include higher lows, positive momentum indicators, and increasing volume on upward moves.",
    "bearish": "A bearish pattern suggests potential downward price movement. Common indicators include lower highs, negative momentum indicators, and increasing volume on downward moves.",
    "consolidation": "Consolidation patterns show sideways price action, often indicating market indecision. These can precede both breakouts and breakdowns.",
    "support": "Support levels are price points where historically the asset has stopped falling and bounced back up. Strong support often forms at round numbers or previous significant lows.",
    "resistance": "Resistance levels are price points where historically the asset has struggled to rise above. Breaking through resistance on high volume can signal continued momentum.",
    "volume": "Volume confirms price movements. High volume during price increases suggests stronger bullish sentiment, while high volume during decreases suggests stronger bearish sentiment."
  };

  // Generate educational content based on analysis
  const generateEducationalContent = (analysisText) => {
    if (!analysisText) return "";
    
    // Keywords to look for in the analysis
    const analysisLower = typeof analysisText === 'string' 
      ? analysisText.toLowerCase() 
      : JSON.stringify(analysisText).toLowerCase();
      
    let relevantEducation = "";
    
    // Check for mentions of specific patterns
    Object.keys(marketPatterns).forEach(pattern => {
      if (analysisLower.includes(pattern)) {
        relevantEducation += `\n\n**About ${pattern} patterns**: ${marketPatterns[pattern]}`;
      }
    });
    
    return relevantEducation;
  };

  // Improved screen capture function
  const captureScreen = async () => {
    setCapturing(true);
    setMessages(prev => [...prev, { 
      type: 'bot', 
      content: "Please select the screen with your chart to analyze. I'll provide educational insights about the patterns I observe.",
      isPrompt: true
    }]);
    
    try {
      // Request screen capture permission
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: { cursor: "always" },
        audio: false
      });
      
      // Create video element to display the screen capture
      const video = document.createElement("video");
      video.srcObject = stream;
      
      // Wait for video metadata to load
      await new Promise(resolve => {
        video.onloadedmetadata = () => {
          video.play();
          resolve();
        };
      });
      
      // Create canvas to capture frame
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get the image data
      const imageUrl = canvas.toDataURL("image/jpeg", 0.8);
      
      // Stop all tracks
      stream.getTracks().forEach(track => track.stop());
      
      // Create image element for conversion
      const img = new Image();
      img.src = imageUrl;
      await new Promise(resolve => {
        img.onload = resolve;
      });
      
      // Convert to base64 for API
      const base64Data = imageToBase64(img);
      
      // Store reference to image (for display)
      screenshotImageRef.current = imageUrl;
      
      // Add capture confirmation message
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: "I've captured your screen. Analyzing the chart patterns...",
        isInfo: true
      }]);
      
      // Process the image with the API
      try {
        const analysisResult = await callGeminiWithImage(base64Data);
        
        // Add educational content
        const enhancedResponse = {
          ...analysisResult,
          education: analysisResult.education + generateEducationalContent(analysisResult)
        };
        
        // Send the successful analysis to the user
        setMessages(prev => [...prev, { 
          type: 'bot', 
          content: enhancedResponse,
          hasScreenshot: true
        }]);
      } catch (apiError) {
        // Handle API errors with specific information
        setMessages(prev => [...prev, { 
          type: 'bot', 
          content: handleApiError(apiError),
          isError: true
        }]);
      }
    } catch (captureError) {
      console.error("Screen capture error:", captureError);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: captureError.message || "Screen capture was canceled or failed. Please try again or ask a different question.",
        isError: true
      }]);
    } finally {
      setCapturing(false);
    }
  };

  // Updated test connection function to use the correct endpoint
  const testConnection = async () => {
    try {
      const response = await axios.post(
        `${GEMINI_API_URL}?key=${apiKey}`,
        {
          contents: [{
            parts: [{
              text: "Respond with 'API Connection Successful' if you receive this message."
            }]
          }],
          generationConfig: {
            maxOutputTokens: 20
          }
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      return response.data && response.data.candidates && response.data.candidates.length > 0;
    } catch (error) {
      console.error("API test error:", error);
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading || capturing) return;

    // Add user message
    const userMessage = { type: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    
    const userInput = input.trim();
    setInput('');
    
    // Handle API key update command
    if (userInput.toLowerCase().startsWith("/apikey ")) {
      const newKey = userInput.substring(8).trim();
      if (newKey) {
        setApiKey(newKey);
        setMessages(prev => [...prev, { 
          type: 'bot', 
          content: "API key updated successfully. Testing connection...",
          isInfo: true
        }]);
        
        setLoading(true);
        // Test the API key
        const isConnected = await testConnection();
        setLoading(false);
        
        if (isConnected) {
          setMessages(prev => [...prev, { 
            type: 'bot', 
            content: "API connection successful with the new key.",
            isInfo: true
          }]);
        } else {
          setMessages(prev => [...prev, { 
            type: 'bot', 
            content: "Warning: The new API key may not be working properly. Please check the key and try again.",
            isError: true
          }]);
        }
      } else {
        setMessages(prev => [...prev, { 
          type: 'bot', 
          content: "Please provide a valid API key in the format: /apikey YOUR_API_KEY",
          isError: true
        }]);
      }
      return;
    }
    
    // Check if the message is related to screen analysis
    const screenAnalysisKeywords = [
      "chart", "graph", "screen", "looking at", "what do you see", 
      "analyze this", "what's on my screen", "my screen", "analyze chart",
      "chart analysis", "scan screen", "screen analysis"
    ];
    
    const isScreenAnalysisRequest = screenAnalysisKeywords.some(
      keyword => userInput.toLowerCase().includes(keyword)
    );
    
    if (isScreenAnalysisRequest) {
      captureScreen();
      return;
    }
    
    // Handle help command
    if (userInput.toLowerCase() === 'help' || userInput.toLowerCase() === '/help') {
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: `Here are some commands you can use:
        
1. Ask about specific stocks: "What's the outlook for Reliance Industries?"
2. Get market education: "Explain support and resistance levels"
3. Analyze charts: "Analyze this chart" (when you have a chart open)
4. Update API key: "/apikey YOUR_NEW_API_KEY"
5. Get help: "/help" or "help"
6. Test connection: "/test" or "test connection"

Remember that I provide educational information only, not financial advice.`,
        isInfo: true
      }]);
      return;
    }
    
    // Handle system test command
    if (userInput.toLowerCase() === '/test' || userInput.toLowerCase() === 'test connection') {
      setLoading(true);
      const isConnected = await testConnection();
      setLoading(false);
      
      if (isConnected) {
        setMessages(prev => [...prev, { 
          type: 'bot', 
          content: "✅ Connection test successful. The API is working properly.",
          isInfo: true
        }]);
      } else {
        setMessages(prev => [...prev, { 
          type: 'bot', 
          content: "❌ Connection test failed. The API may be down or your key may be invalid.",
          isError: true
        }]);
      }
      return;
    }
    
    // Normal text processing
    setLoading(true);
    
    try {
      const responseText = await fetchGeminiResponse(userInput);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: responseText
      }]);
    } catch (error) {
      console.error("API Call Error:", error);
      
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: handleApiError(error),
        isError: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Render formatted analysis content
  const renderAnalysisContent = (content) => {
    if (typeof content === 'string') {
      return content;
    }
    
    return (
      <div className="space-y-3">
        <div className="font-medium flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <span>Trend Analysis:</span>
        </div>
        <p className="text-sm">{content.trend}</p>
        
        <div className="font-medium mt-2">
          <span>Price Levels:</span>
        </div>
        <div className="text-sm">
          <div><strong>Resistance:</strong> {content.resistance}</div>
          <div><strong>Support:</strong> {content.support}</div>
        </div>
        
        {content.patterns && (
          <>
            <div className="font-medium mt-2">
              <span>Pattern Identification:</span>
            </div>
            <p className="text-sm">{content.patterns}</p>
          </>
        )}
        
        {content.volume && (
          <>
            <div className="font-medium mt-2">
              <span>Volume Analysis:</span>
            </div>
            <p className="text-sm">{content.volume}</p>
          </>
        )}
        
        {content.education && (
          <>
            <div className="font-medium mt-2">
              <span>Educational Context:</span>
            </div>
            <p className="text-sm" dangerouslySetInnerHTML={{ 
              __html: content.education.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') 
            }} />
          </>
        )}
        
        {content.disclaimer && (
          <div className="text-xs text-yellow-600 mt-2 border-t pt-2 border-yellow-200">
            {content.disclaimer}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Chat button */}
      <motion.button
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
      >
        <MessageSquare className="h-6 w-6" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 right-4 w-96 bg-white rounded-lg shadow-xl z-50 border border-gray-200"
          >
            {/* Chatbot Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">Stock Market Assistant</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className={`flex ${message.type === 'user' ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === 'user' 
                      ? "bg-blue-500 text-white" 
                      : message.isDisclaimer || message.isPrompt
                        ? "bg-yellow-50 border border-yellow-200 text-gray-800" 
                        : message.isError
                          ? "bg-red-50 border border-red-200 text-gray-800"
                          : message.isInfo
                            ? "bg-blue-50 border border-blue-200 text-gray-800"
                            : "bg-gray-100 text-gray-800"
                    } ${message.isDisclaimer || message.isPrompt || message.isError || message.isInfo ? "flex items-start gap-2" : ""}`}
                  >
                    {message.isDisclaimer && <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5 text-yellow-500" />}
                    {message.isPrompt && <Camera className="h-5 w-5 flex-shrink-0 mt-0.5 text-blue-500" />}
                    {message.isError && <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-500" />}
                    {message.isInfo && <Info className="h-5 w-5 flex-shrink-0 mt-0.5 text-blue-500" />}
                    
                    <div>
                      {typeof message.content === 'object' 
                        ? renderAnalysisContent(message.content) 
                        : typeof message.content === 'string'
                          ? <div dangerouslySetInnerHTML={{ 
                              __html: message.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') 
                            }} />
                          : message.content}
                      
                      {message.hasScreenshot && screenshotImageRef.current && (
                        <div className="mt-2">
                          <img 
                            src={screenshotImageRef.current} 
                            alt="Chart Screenshot" 
                            className="w-full h-auto rounded-md border border-gray-200 mt-1" 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {/* Loading indicator */}
              {loading && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 text-gray-800 p-3 rounded-lg flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200" />
                  </div>
                </motion.div>
              )}
              
              {/* Capturing indicator */}
              {capturing && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="flex justify-start"
                >
                  <div className="bg-blue-50 border border-blue-200 text-gray-800 p-3 rounded-lg flex items-center space-x-2">
                    <Camera className="h-5 w-5 text-blue-500 animate-pulse" />
                    <span>Capturing your screen...</span>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Disclaimer */}
            <div className="p-2 border-t border-gray-200">
              <div className="bg-gray-50 rounded-lg p-2 text-xs text-gray-600 flex items-start gap-2">
                <Info className="h-4 w-4 flex-shrink-0 mt-0.5 text-yellow-500" />
                <span>Chart analysis and pattern recognition are educational only. Past patterns do not predict future results.</span>
              </div>
            </div>
            
            {/* Input Form */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input 
                  type="text" 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  placeholder="Ask about charts or say 'analyze chart'..." 
                  disabled={loading || capturing} 
                  className="flex-1 bg-gray-100 text-gray-800 rounded-lg px-4 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
                <motion.button 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }} 
                  type="submit" 
                  disabled={loading || capturing || !input.trim()} 
                  className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {capturing ? <Camera className="h-5 w-5" /> : <Send className="h-5 w-5" />}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FinanceChatbot;