import React, { useState } from 'react';

const ExpertAdvice = () => {
  const [activeTab, setActiveTab] = useState('nifty');
  
  const expertAdvice = {
    nifty: [
      {
        expert: "Dr. Priya Sharma",
        title: "Market Strategist",
        advice: "NIFTY 50 is showing strong technical support at 24,500 levels. Investors could consider accumulating quality large-caps in the IT and banking sectors during market dips. The short-term outlook remains bullish with targets of 25,800 in the next quarter.",
        date: "March 28, 2025"
      },
      {
        expert: "Rajiv Mehta",
        title: "Chief Investment Officer",
        advice: "With Q4 earnings season approaching, NIFTY is likely to experience sector rotation. Consider reducing exposure to overvalued consumer stocks and increasing allocation to infrastructure and energy sectors which are trading at attractive valuations.",
        date: "March 30, 2025"
      },
      {
        expert: "Ananya Desai",
        title: "Technical Analyst",
        advice: "NIFTY has formed a bullish consolidation pattern after breaking out from its previous resistance. The 50-day moving average is trending upward, suggesting continued momentum. Risk-averse investors should wait for pullbacks to 24,300 for entry points.",
        date: "March 31, 2025"
      }
    ],
    sensex: [
      {
        expert: "Vikram Joshi",
        title: "Equity Research Head",
        advice: "SENSEX is trading at a P/E of 22.5, slightly above historical averages. However, with expected earnings growth of 15% for FY26, valuations remain reasonable. Focus on high-quality financial stocks which may benefit from the credit growth cycle.",
        date: "March 29, 2025"
      },
      {
        expert: "Meera Patel",
        title: "Portfolio Manager",
        advice: "SENSEX looks overbought in the short term with RSI above 70. Investors should exercise caution and consider partial profit booking. Healthy correction of 5-7% could present better entry opportunities in the coming weeks.",
        date: "March 30, 2025"
      },
      {
        expert: "Sunil Kapoor",
        title: "Economic Advisor",
        advice: "Recent policy announcements and stable macroeconomic indicators support a positive long-term outlook for SENSEX. Companies with strong export potential and low debt may outperform as interest rates stabilize. Target 86,000 by year-end.",
        date: "March 31, 2025"
      }
    ]
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-64 flex-shrink-0">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Expert Market Insights</h2>
      
      {/* Tab Navigation */}
      <div className="flex border-b mb-4">
        <button 
          className={`py-2 px-4 font-medium ${activeTab === 'nifty' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('nifty')}
        >
          NIFTY 50
        </button>
        <button 
          className={`py-2 px-4 font-medium ${activeTab === 'sensex' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('sensex')}
        >
          SENSEX
        </button>
      </div>
      
      {/* Expert Advice Content */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {expertAdvice[activeTab].map((item, index) => (
          <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-800">{item.expert}</h3>
                <p className="text-sm text-gray-600">{item.title}</p>
              </div>
              <span className="text-xs text-gray-500">{item.date}</span>
            </div>
            <p className="mt-2 text-sm text-gray-700">{item.advice}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-6 text-xs text-gray-500 italic">
        
      </div>
    </div>
  );
};

export default ExpertAdvice;