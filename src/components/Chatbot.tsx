import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';

const Chatbot = () => {
  const [messages] = useState([
    {
      type: 'info',
      content: {
        trend: 'The overall trend is bullish, with a significant upward move over the past few sessions.',
        resistance: 'Around 23,400 (where the price is consolidating)',
        support: 'Recent levels near 23,200',
        advice: [
          'Buy: If Nifty breaks above 23,375-23,400 with strong volume, it could continue the uptrend.',
          'Sell: If Nifty falls below 23,300, it could indicate a pullback towards 23,200.'
        ]
      }
    }
  ]);

  return (
    <div className="w-[400px] p-4">
      <div className="bg-white rounded-lg shadow-lg h-full">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-600">please advise</span>
          </div>
        </div>
        
        <div className="p-4 space-y-4">
          {messages.map((message, index) => (
            <div key={index} className="space-y-2">
              <div className="font-medium">Trend:</div>
              <p className="text-sm text-gray-600">{message.content.trend}</p>
              
              <div className="font-medium mt-4">Resistance & Support:</div>
              <div className="text-sm text-gray-600">
                <div>Resistance: {message.content.resistance}</div>
                <div>Support: {message.content.support}</div>
              </div>
              
              <div className="font-medium mt-4">Day Trading Advice:</div>
              <ul className="text-sm text-gray-600 list-disc pl-4">
                {message.content.advice.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t">
          <input
            type="text"
            placeholder="Ask anything"
            className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>
    </div>
  );
};

export default Chatbot;