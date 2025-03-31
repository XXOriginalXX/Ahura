import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LineChartIcon, RefreshCw, Search, X } from 'lucide-react';

const StockChart = () => {
  const [stockData, setStockData] = useState([]);
  const [symbol, setSymbol] = useState('RELIANCE.NS');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedStock, setSelectedStock] = useState('RELIANCE.NS');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [timeframe, setTimeframe] = useState('1mo'); // Default timeframe: 1 month
  const suggestionRef = useRef(null);

  // Timeframe options
  const timeframeOptions = [
    { value: '5m', label: '5 Min', interval: '1m' },
    { value: '1h', label: '1 Hour', interval: '5m' },
    { value: '1d', label: '1 Day', interval: '15m' },
    { value: '5d', label: '5 Days', interval: '30m' },
    { value: '1mo', label: '1 Month', interval: '1d' },
    { value: '3mo', label: '3 Months', interval: '1d' },
    { value: '6mo', label: '6 Months', interval: '1d' },
    { value: '1y', label: '1 Year', interval: '1wk' },
    { value: '5y', label: '5 Years', interval: '1mo' },
  ];

  // Get interval based on selected timeframe
  const getInterval = () => {
    const selected = timeframeOptions.find(option => option.value === timeframe);
    return selected ? selected.interval : '1d';
  };

  // Popular Indian stock symbols with NSE suffix and Market Indices
  const popularStocks = [
    { symbol: '^NSEI', name: 'NIFTY 50' },
    { symbol: '^BSESN', name: 'SENSEX' },
    { symbol: 'RELIANCE.NS', name: 'Reliance Industries' },
    { symbol: 'TCS.NS', name: 'Tata Consultancy Services' },
    { symbol: 'HDFCBANK.NS', name: 'HDFC Bank' },
    { symbol: 'INFY.NS', name: 'Infosys' },
    { symbol: 'ICICIBANK.NS', name: 'ICICI Bank' }
  ];

  // Common Indian stocks database including market indices
  const indianStocks = [
    // Market Indices
    { symbol: '^NSEI', name: 'NIFTY 50 Index' },
    { symbol: '^BSESN', name: 'S&P BSE SENSEX' },
    { symbol: '^NSEBANK', name: 'NIFTY Bank Index' },
    { symbol: '^CNXIT', name: 'NIFTY IT Index' },
    { symbol: '^CNXPHARMA', name: 'NIFTY Pharma Index' },
    { symbol: '^CNXAUTO', name: 'NIFTY Auto Index' },
    { symbol: '^CNXFMCG', name: 'NIFTY FMCG Index' },
    { symbol: '^CNXREALTY', name: 'NIFTY Realty Index' },
    { symbol: '^CNXMETAL', name: 'NIFTY Metal Index' },
    
    // Nifty 50 stocks and other popular stocks
    { symbol: 'RELIANCE.NS', name: 'Reliance Industries Ltd.' },
    { symbol: 'TCS.NS', name: 'Tata Consultancy Services Ltd.' },
    { symbol: 'HDFCBANK.NS', name: 'HDFC Bank Ltd.' },
    { symbol: 'INFY.NS', name: 'Infosys Ltd.' },
    { symbol: 'ICICIBANK.NS', name: 'ICICI Bank Ltd.' },
    { symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever Ltd.' },
    { symbol: 'SBIN.NS', name: 'State Bank of India' },
    { symbol: 'HDFC.NS', name: 'Housing Development Finance Corporation Ltd.' },
    { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel Ltd.' },
    { symbol: 'KOTAKBANK.NS', name: 'Kotak Mahindra Bank Ltd.' },
    
    // Adani Group Companies
    { symbol: 'ADANIENT.NS', name: 'Adani Enterprises Ltd.' },
    { symbol: 'ADANIPORTS.NS', name: 'Adani Ports and Special Economic Zone Ltd.' },
    { symbol: 'ADANIPOWER.NS', name: 'Adani Power Ltd.' },
    { symbol: 'ADANIGREEN.NS', name: 'Adani Green Energy Ltd.' },
    { symbol: 'ADANITRANS.NS', name: 'Adani Transmission Ltd.' },
    { symbol: 'ADANIGAS.NS', name: 'Adani Gas Ltd.' },
    { symbol: 'ADANITOTAL.NS', name: 'Adani Total Gas Ltd.' },
    { symbol: 'ADANIENERGYF.NS', name: 'Adani Energy Solutions Ltd.' },
    { symbol: 'ADANIPOWER.NS', name: 'Adani Power Ltd.' },
    { symbol: 'ADANICENT.NS', name: 'Adani Cement Industries Ltd.' },
    
    // Tata Group Companies
    { symbol: 'TATAMOTORS.NS', name: 'Tata Motors Ltd.' },
    { symbol: 'TATASTEEL.NS', name: 'Tata Steel Ltd.' },
    { symbol: 'TATAPOWER.NS', name: 'Tata Power Co. Ltd.' },
    { symbol: 'TATACHEM.NS', name: 'Tata Chemicals Ltd.' },
    { symbol: 'TATAELXSI.NS', name: 'Tata Elxsi Ltd.' },
    { symbol: 'TATACONSUM.NS', name: 'Tata Consumer Products Ltd.' },
    
    // Other Popular Sectors
    { symbol: 'SUNPHARMA.NS', name: 'Sun Pharmaceutical Industries Ltd.' },
    { symbol: 'DRREDDY.NS', name: 'Dr. Reddy\'s Laboratories Ltd.' },
    { symbol: 'CIPLA.NS', name: 'Cipla Ltd.' },
    { symbol: 'DIVISLAB.NS', name: 'Divi\'s Laboratories Ltd.' },
    
    { symbol: 'WIPRO.NS', name: 'Wipro Ltd.' },
    { symbol: 'TECHM.NS', name: 'Tech Mahindra Ltd.' },
    { symbol: 'LTI.NS', name: 'Larsen & Toubro Infotech Ltd.' },
    
    { symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance Ltd.' },
    { symbol: 'BAJAJFINSV.NS', name: 'Bajaj Finserv Ltd.' },
    { symbol: 'AXISBANK.NS', name: 'Axis Bank Ltd.' },
    
    { symbol: 'TITAN.NS', name: 'Titan Company Ltd.' },
    { symbol: 'ASIANPAINT.NS', name: 'Asian Paints Ltd.' },
    { symbol: 'MARUTI.NS', name: 'Maruti Suzuki India Ltd.' },
    { symbol: 'M&M.NS', name: 'Mahindra & Mahindra Ltd.' },
  ];

  // Function to search any stock symbol using Yahoo Finance API
  const searchAnyStock = async (query) => {
    if (!query || query.length < 2) return [];
    setLoading(true);
    
    try {
      // Using allorigins.win as a CORS proxy
      const proxyUrl = "https://api.allorigins.win/get?url=";
      const targetUrl = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0&listsCount=0`;
      
      const response = await fetch(proxyUrl + encodeURIComponent(targetUrl));
      
      if (!response.ok) {
        throw new Error(`Failed to fetch search results: ${response.status}`);
      }
      
      const responseData = await response.json();
      const data = JSON.parse(responseData.contents);
      
      if (!data.quotes || data.quotes.length === 0) {
        return [];
      }
      
      // Filter for Indian stocks and indices - include NSE, BSE, and indices
      const filteredResults = data.quotes
        .filter(quote => 
          quote.exchange === 'NSI' || 
          quote.exchange === 'BSE' || 
          (quote.quoteType === 'INDEX' && quote.market === 'in_market')
        )
        .map(quote => ({
          symbol: quote.symbol,
          name: quote.longname || quote.shortname || quote.symbol
        }));
      
      return filteredResults;
      
    } catch (error) {
      console.error("Error searching stocks:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch real stock data
  const fetchRealStockData = async (stockSymbol) => {
    setLoading(true);
    setError(null);
    
    try {
      // Using allorigins.win as a CORS proxy
      const proxyUrl = "https://api.allorigins.win/get?url=";
      const interval = getInterval();
      const targetUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${stockSymbol}?interval=${interval}&range=${timeframe}`;
      
      const response = await fetch(proxyUrl + encodeURIComponent(targetUrl));
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }
      
      const responseData = await response.json();
      
      // Parse the contents from the proxy response
      const data = JSON.parse(responseData.contents);
      
      // Check if we have valid data
      if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
        throw new Error("No data available for this symbol");
      }
      
      const result = data.chart.result[0];
      const quotes = result.indicators.quote[0];
      const timestamps = result.timestamp;
      const formattedData = [];
      
      // Format the data for our chart
      for (let i = 0; i < timestamps.length; i++) {
        if (quotes.close[i] !== null) {
          let dateFormat;
          // Format date based on timeframe
          if (timeframe === '5m' || timeframe === '1h' || timeframe === '1d') {
            dateFormat = new Date(timestamps[i] * 1000).toLocaleString();
          } else {
            dateFormat = new Date(timestamps[i] * 1000).toISOString().split('T')[0];
          }
          
          formattedData.push({
            date: dateFormat,
            timestamp: timestamps[i] * 1000,
            price: parseFloat(quotes.close[i].toFixed(2)),
            volume: quotes.volume[i],
            name: stockSymbol.replace('.NS', '')
          });
        }
      }
      
      setStockData(formattedData);
      setSelectedStock(stockSymbol);
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error("Error loading data:", error);
      setError(`Failed to fetch data: ${error.message}`);
      setStockData([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to search for stock symbols based on user input
  const searchStocks = async (query) => {
    if (!query || query.length < 2) return [];
    
    // First search in local database
    const lowerQuery = query.toLowerCase();
    const localResults = indianStocks.filter(stock => 
      stock.symbol.toLowerCase().replace('.ns', '').includes(lowerQuery) || 
      stock.name.toLowerCase().includes(lowerQuery)
    ).slice(0, 6); // Limit to 6 local results
    
    // Then, if needed, search via API for more stocks
    if (localResults.length < 6) {
      try {
        const apiResults = await searchAnyStock(query);
        // Combine results without duplicates
        const combinedResults = [...localResults];
        
        for (const apiStock of apiResults) {
          if (!combinedResults.some(stock => stock.symbol === apiStock.symbol)) {
            combinedResults.push(apiStock);
          }
          
          if (combinedResults.length >= 10) break; // Limit to 10 total results
        }
        
        return combinedResults;
      } catch (error) {
        console.error("Error in API search:", error);
        return localResults; // Fall back to local results if API fails
      }
    }
    
    return localResults;
  };

  // Handle input change for search
  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.trim() && value.length >= 2) {
      const matchedStocks = await searchStocks(value);
      setSuggestions(matchedStocks);
      setShowSuggestions(matchedStocks.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (stockSymbol) => {
    setSymbol(stockSymbol);
    setSearchTerm('');
    setShowSuggestions(false);
    fetchRealStockData(stockSymbol);
  };

  // Click outside handler to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Initial data load and set up refresh interval
  useEffect(() => {
    // Initial data load
    fetchRealStockData(symbol);
    
    // Set up interval for periodic refreshes (every 1 minutes)
    const refreshInterval = setInterval(() => {
      fetchRealStockData(symbol);
    }, 60000); // 1 minutes
    
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, [symbol, timeframe]); 

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      let formattedSymbol;
      
      // Check if it's in our local database
      const matchedStock = indianStocks.find(
        stock => stock.symbol.toLowerCase().replace('.ns', '') === searchTerm.toLowerCase() ||
                stock.name.toLowerCase() === searchTerm.toLowerCase()
      );
      
      if (matchedStock) {
        formattedSymbol = matchedStock.symbol;
      } else {
        // If not in local database, try to search online
        const searchResults = await searchAnyStock(searchTerm);
        
        if (searchResults && searchResults.length > 0) {
          formattedSymbol = searchResults[0].symbol;
        } else {
          // Fall back to direct symbol formatting if not found online
          formattedSymbol = searchTerm.trim().toUpperCase();
          
          // Add .NS suffix if not an index (indicated by ^) and doesn't already have a suffix
          if (!formattedSymbol.startsWith('^') && !formattedSymbol.includes('.')) {
            formattedSymbol += '.NS';
          }
        }
      }
      
      setSymbol(formattedSymbol);
      setSearchTerm('');
      fetchRealStockData(formattedSymbol);
    }
  };

  const selectStock = (stockSymbol) => {
    setSymbol(stockSymbol);
    setSearchTerm('');
    fetchRealStockData(stockSymbol);
  };

  
  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
    fetchRealStockData(symbol);
  };

  
  const formatCurrency = (value) => {
    // Check if it's an index (^) or a regular stock
    if (selectedStock.startsWith('^')) {
      return value.toLocaleString('en-IN');
    }
    return `₹${value.toLocaleString('en-IN')}`;
  };

  
  const calculateStats = () => {
    if (stockData.length === 0) return { current: 0, change: 0, changePercent: 0 };
    
    const firstPrice = stockData[0].price;
    const lastPrice = stockData[stockData.length - 1].price;
    const change = lastPrice - firstPrice;
    const changePercent = (change / firstPrice) * 100;
    
    return {
      current: lastPrice,
      change: change,
      changePercent: changePercent
    };
  };
  
  const stats = calculateStats();
  const isPositive = stats.change >= 0;

  
  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Not updated yet';
    
    return lastUpdated.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  
  const handleRefresh = () => {
    fetchRealStockData(symbol);
  };

  
  const getStockName = (symbol) => {
    // For indices that start with ^
    if (symbol.startsWith('^')) {
      const indexStock = indianStocks.find(s => s.symbol === symbol);
      return indexStock ? indexStock.name : symbol;
    }
    
    // For regular stocks
    const stock = indianStocks.find(s => s.symbol === symbol);
    return stock ? stock.name : symbol.replace('.NS', '');
  };

  
  const formatXAxisTick = (timestamp) => {
    const date = new Date(timestamp);
    if (timeframe === '5m' || timeframe === '1h') {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (timeframe === '1d' || timeframe === '5d') {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (timeframe === '1mo' || timeframe === '3mo') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  
  const formatTooltipLabel = (timestamp) => {
    const date = new Date(timestamp);
    if (timeframe === '5m' || timeframe === '1h' || timeframe === '1d') {
      return date.toLocaleString('en-US', { 
        weekday: 'short',
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      {/* Header with search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div className="flex items-center">
          <LineChartIcon className="w-5 h-5 text-emerald-500 mr-2" />
          <span className="text-lg font-semibold">INDIAN STOCKS</span>
          <span className="ml-2 px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full">
            Live Data
          </span>
        </div>
        
        <form onSubmit={handleSearch} className="flex w-full md:w-auto relative">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search any stock or index"
              className="w-full md:w-64 pl-10 pr-4 py-2 border rounded-l text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSuggestions([]);
                  setShowSuggestions(false);
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
            
            {/* Stock Suggestions */}
            {showSuggestions && (
              <div ref={suggestionRef} className="absolute z-10 mt-2 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-80 overflow-y-auto">
                {suggestions.map((stock) => (
                  <div
                    key={stock.symbol}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex flex-col"
                    onClick={() => handleSelectSuggestion(stock.symbol)}
                  >
                    <span className="font-medium">
                      {stock.symbol.startsWith('^') ? stock.symbol : stock.symbol.replace('.NS', '')}
                    </span>
                    <span className="text-sm text-gray-600">{stock.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button 
            type="submit" 
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-r text-sm transition-colors"
          >
            Search
          </button>
        </form>
      </div>
      
      {/* Stock selector buttons including indices */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Popular stocks and indices:</p>
        <div className="flex flex-wrap gap-2">
          {popularStocks.map((stock) => (
            <button
              key={stock.symbol}
              onClick={() => selectStock(stock.symbol)}
              className={`px-4 py-2 text-sm rounded-full transition-colors ${
                selectedStock === stock.symbol 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            >
              {stock.symbol.startsWith('^') ? stock.name : stock.symbol.replace('.NS', '')}
            </button>
          ))}
        </div>
      </div>
      
      {/* Timeframe selector */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-2">Timeframe:</p>
        <div className="flex flex-wrap gap-2">
          {timeframeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleTimeframeChange(option.value)}
              className={`px-4 py-2 text-sm rounded-full transition-colors ${
                timeframe === option.value 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Stock info and stats */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">
            {getStockName(selectedStock)}
          </h2>
          <p className="text-gray-500 text-sm">
            {selectedStock.startsWith('^') ? 'Index' : `NSE: ${selectedStock.replace('.NS', '')}`}
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold">{formatCurrency(stats.current)}</div>
          <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <span>{isPositive ? '▲' : '▼'}</span>
            <span className="ml-1">
              {selectedStock.startsWith('^') ? Math.abs(stats.change).toFixed(2) : formatCurrency(Math.abs(stats.change))} ({stats.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>
      
      {/* Last updated info and refresh button */}
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm text-gray-500">
          Last updated: {formatLastUpdated()}
        </div>
        <button 
          onClick={handleRefresh} 
          className="flex items-center text-sm text-emerald-600 hover:text-emerald-800"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
        </button>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-700 text-sm">{error}</p>
        </div>
      )}
      
      {/* Chart */}
      {loading ? (
        <div className="h-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <div className="h-80">
          {stockData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={stockData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="timestamp" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={formatXAxisTick}
                  minTickGap={20}
                />
                <YAxis 
                  domain={['auto', 'auto']} 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => selectedStock.startsWith('^') ? value.toLocaleString() : `₹${value}`}
                />
                <Tooltip 
                  formatter={(value) => [selectedStock.startsWith('^') ? value.toLocaleString() : `₹${value}`, 'Price']}
                  labelFormatter={(timestamp) => formatTooltipLabel(timestamp)}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  name={selectedStock.startsWith('^') ? getStockName(selectedStock) : selectedStock.replace('.NS', '')}
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                  isAnimationActive={false} // Disable animation for real-time updates
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">No data available for this timeframe</p>
            </div>
          )}
        </div>
      )}
      
      {/* Info notice */}
      <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
        <p className="text-emerald-800 text-sm">
          <strong>Live Data:</strong> Using Yahoo Finance API with dynamic stock search capability. 
          Search for any Indian stock symbol or browse market indices like SENSEX and NIFTY50.
          Updates every 1 minute to respect API rate limits.
        </p>
      </div>
    </div>
  );
};

export default StockChart;