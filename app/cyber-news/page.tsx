"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { 
  ArrowLeft, 
  ExternalLink, 
  RefreshCw, 
  Filter, 
  Clock, 
  Search, 
  Share2, 
  X, 
  Globe, 
  Zap, 
  Shield, 
  Bookmark,
  Calendar,
  Bell
} from "lucide-react"
import { Suspense } from "react"

// Types for our news data
interface NewsItem {
  title: string
  description: string
  url: string
  urlToImage: string | null
  publishedAt: string
  source: {
    name: string
  }
  category?: string // Optional category field
  region?: string // Optional region field
  severity?: 'low' | 'medium' | 'high' | 'critical' // Optional severity field
  saved?: boolean // For bookmarking functionality
}

// Filter options type
interface FilterOptions {
  sort: "latest" | "popular" | "source"
  category: string
  region: string
  timeframe: string
  severity: string
  search: string
}

// Category definitions with icon mapping
const categories = [
  { id: "all", name: "All Categories", icon: <Filter className="h-4 w-4" /> },
  { id: "breach", name: "Data Breaches", icon: <Shield className="h-4 w-4" /> },
  { id: "ransomware", name: "Ransomware", icon: <Zap className="h-4 w-4" /> },
  { id: "vulnerability", name: "Vulnerabilities", icon: <Shield className="h-4 w-4" /> },
  { id: "threats", name: "Emerging Threats", icon: <Zap className="h-4 w-4" /> }
]

// Time frame options
const timeframes = [
  { id: "all", name: "All Time" },
  { id: "today", name: "Today" },
  { id: "week", name: "This Week" },
  { id: "month", name: "This Month" }
]

// Region options
const regions = [
  { id: "all", name: "Global", icon: <Globe className="h-4 w-4" /> },
  { id: "us", name: "United States" },
  { id: "eu", name: "Europe" },
  { id: "asia", name: "Asia" }
]

// Severity levels
const severityLevels = [
  { id: "all", name: "All Alerts" },
  { id: "low", name: "Low", color: "bg-blue-500" },
  { id: "medium", name: "Medium", color: "bg-yellow-500" },
  { id: "high", name: "High", color: "bg-orange-500" },
  { id: "critical", name: "Critical", color: "bg-red-500" }
]

export default function CyberNewsPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cursorVisible, setCursorVisible] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [highlightedNews, setHighlightedNews] = useState<NewsItem | null>(null)
  
  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    sort: "latest",
    category: "all",
    region: "all",
    timeframe: "all",
    severity: "all",
    search: ""
  })
  
  // Blinking cursor effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible(prev => !prev)
    }, 800)
    return () => clearInterval(cursorInterval)
  }, [])

  // Fetch news data
  useEffect(() => {
    async function fetchNews() {
      setIsLoading(true)
      try {
        // In a real implementation, you'd use an actual API key
        const response = await fetch(
          `https://newsapi.org/v2/everything?q=cybersecurity+hacking+security+breach&language=en&sortBy=publishedAt&apiKey=${process.env.NEXT_PUBLIC_NEWS_API_KEY || 'demo-api-key'}`
        )
        
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        
        const data = await response.json()
        
        // If the API is unavailable, use mock data
        if (!data.articles || data.status === 'error') {
          setNews(getMockNewsData())
        } else {
          setNews(data.articles.slice(0, 15))
        }
      } catch (error) {
        console.error('Error fetching news:', error)
        setNews(getMockNewsData())
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchNews()
  }, [])

  // Apply filters to news data
  useEffect(() => {
    if (!news.length) return
    
    // Deep copy of news to manipulate
    let result = [...news]
    
    // Filter by search term
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(item => 
        item.title.toLowerCase().includes(searchLower) || 
        (item.description && item.description.toLowerCase().includes(searchLower))
      )
    }
    
    // Filter by category
    if (filters.category !== 'all' && result.length) {
      // In a real implementation, you'd filter by actual category data
      // For demo, we'll simulate category filtering using title/description matching
      const categoryTerms: {[key: string]: string[]} = {
        'breach': ['breach', 'leak', 'exposed', 'data'],
        'ransomware': ['ransomware', 'ransom', 'encrypt', 'decrypt'],
        'vulnerability': ['vulnerability', 'flaw', 'exploit', 'patch', 'cve'],
        'threats': ['threat', 'attack', 'hacker', 'malware']
      }
      
      const terms = categoryTerms[filters.category] || []
      if (terms.length) {
        result = result.filter(item => {
          const text = (item.title + ' ' + (item.description || '')).toLowerCase()
          return terms.some(term => text.includes(term))
        })
      }
    }
    
    // Filter by timeframe
    if (filters.timeframe !== 'all') {
      const now = new Date()
      let cutoff = new Date()
      
      switch(filters.timeframe) {
        case 'today':
          cutoff.setHours(0, 0, 0, 0)
          break
        case 'week':
          cutoff = new Date(now.setDate(now.getDate() - 7))
          break
        case 'month':
          cutoff = new Date(now.setMonth(now.getMonth() - 1))
          break
      }
      
      result = result.filter(item => new Date(item.publishedAt) >= cutoff)
    }
    
    // Sort the results
    result.sort((a, b) => {
      if (filters.sort === 'latest') {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      } else if (filters.sort === 'source') {
        return a.source.name.localeCompare(b.source.name)
      } else {
        // 'popular' sort - in a real app, this would use actual view/popularity metrics
        // For demo, we'll randomize with consistent results by using the title hash
        const hashA = a.title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
        const hashB = b.title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
        return hashB - hashA
      }
    })
    
    // Set featured news
    if (result.length && !highlightedNews) {
      setHighlightedNews(result[0])
    }
    
    setFilteredNews(result)
  }, [news, filters, highlightedNews])

  // Function to get formatted date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }
  
  // Function to determine severity color
  const getSeverityColor = (item: NewsItem) => {
    // In real implementation, this would use the item's actual severity
    // For demo, we'll simulate severity based on title keywords
    const title = item.title.toLowerCase()
    
    if (title.includes('critical') || title.includes('ransomware') || title.includes('breach')) {
      return 'bg-red-500'
    } else if (title.includes('warning') || title.includes('vulnerability')) {
      return 'bg-orange-500'
    } else if (title.includes('update') || title.includes('patch')) {
      return 'bg-yellow-500'
    } else {
      return 'bg-blue-500'
    }
  }
  
  // Function to handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }))
  }
  
  // Function to toggle bookmarking (in a real app, this would persist)
  const toggleBookmark = (index: number) => {
    const updatedNews = [...news]
    updatedNews[index] = { ...updatedNews[index], saved: !updatedNews[index].saved }
    setNews(updatedNews)
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="relative">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden z-0">
          <div className="absolute w-[500px] h-[500px] top-0 left-1/4 bg-[#00FF00]/5 blur-[150px] rounded-full"></div>
          <div className="absolute w-[300px] h-[300px] bottom-1/4 right-1/3 bg-blue-500/5 blur-[150px] rounded-full"></div>
          
          {/* Terminal-inspired background pattern */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 255, 0, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 0, 0.1) 1px, transparent 1px)`,
              backgroundSize: '20px 20px'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/30 to-black/80"></div>
          
          {/* Scan line effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div 
              className="absolute inset-0 opacity-[0.03] z-0"
              style={{
                backgroundImage: `linear-gradient(transparent 50%, rgba(0, 0, 0, 0.8) 50%)`,
                backgroundSize: '100% 4px',
                animation: 'scanlines 0.2s linear infinite'
              }}
            />
          </div>
        </div>

        {/* Main content */}
        <div className="relative z-10 p-4 md:p-8" style={{
          fontFamily: "Menlo, Monaco, Consolas, 'Courier New', monospace"
        }}>
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
              <div className="flex flex-col items-start">
                <Link
                  href="/what-you-want-to-know"
                  className="inline-flex items-center text-[#00FF00] hover:text-[#00FF00]/80 transition-colors"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Resources
                </Link>
                <div className="text-[#00FF00]/70 text-xs font-mono mt-2 mb-1">
                  <span className="mr-1">$</span>
                  <span className="typing-animation">fetch-news --category=cybersecurity --latest</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-[#00FF00] font-mono tracking-tight mt-2">
                  Cyber<span className="text-white">News</span>
                  <motion.span
                    animate={{ opacity: cursorVisible ? 1 : 0 }}
                    transition={{ duration: 0.4 }}
                    className="ml-1 text-[#00FF00]"
                  >
                    _
                  </motion.span>
                </h1>
                <p className="text-gray-400 mt-2 font-mono">
                  Stay informed about the latest cybersecurity threats and updates from around the world
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative max-w-md w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search cyber news..."
                    value={filters.search}
                    onChange={handleSearch}
                    className="bg-gray-900/80 w-full py-2 pl-10 pr-4 rounded-lg text-sm text-white border border-gray-700 focus:border-[#00FF00] focus:outline-none focus:ring-1 focus:ring-[#00FF00]"
                  />
                </div>
                
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center px-4 py-2 bg-gray-900/80 border border-gray-700 hover:border-[#00FF00] rounded-lg text-sm text-gray-300 hover:text-[#00FF00] transition-colors"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </button>
              </div>
            </div>
            
            {/* Filters Panel - Animated */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden mb-8"
                >
                  <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-white font-bold">Advanced Filters</h3>
                      <button 
                        onClick={() => setShowFilters(false)}
                        className="text-gray-400 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Sort options */}
                      <div className="space-y-2">
                        <label className="text-sm text-gray-400">Sort by</label>
                        <div className="flex flex-wrap gap-2">
                          {['latest', 'popular', 'source'].map((sort) => (
                            <button
                              key={sort}
                              onClick={() => setFilters(prev => ({ ...prev, sort: sort as 'latest' | 'popular' | 'source' }))}
                              className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                                filters.sort === sort 
                                  ? 'bg-[#00FF00]/20 text-[#00FF00] border border-[#00FF00]/50' 
                                  : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
                              }`}
                            >
                              {sort.charAt(0).toUpperCase() + sort.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Categories */}
                      <div className="space-y-2">
                        <label className="text-sm text-gray-400">Category</label>
                        <div className="flex flex-wrap gap-2">
                          {categories.map((category) => (
                            <button
                              key={category.id}
                              onClick={() => setFilters(prev => ({ ...prev, category: category.id }))}
                              className={`px-3 py-1.5 text-xs rounded-full flex items-center transition-colors ${
                                filters.category === category.id 
                                  ? 'bg-[#00FF00]/20 text-[#00FF00] border border-[#00FF00]/50' 
                                  : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
                              }`}
                            >
                              <span className="mr-1">{category.icon}</span>
                              {category.name}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Time Frame */}
                      <div className="space-y-2">
                        <label className="text-sm text-gray-400">Time Period</label>
                        <div className="flex flex-wrap gap-2">
                          {timeframes.map((time) => (
                            <button
                              key={time.id}
                              onClick={() => setFilters(prev => ({ ...prev, timeframe: time.id }))}
                              className={`px-3 py-1.5 text-xs rounded-full flex items-center transition-colors ${
                                filters.timeframe === time.id 
                                  ? 'bg-[#00FF00]/20 text-[#00FF00] border border-[#00FF00]/50' 
                                  : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
                              }`}
                            >
                              {time.name}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Region */}
                      <div className="space-y-2">
                        <label className="text-sm text-gray-400">Region</label>
                        <div className="flex flex-wrap gap-2">
                          {regions.map((region) => (
                            <button
                              key={region.id}
                              onClick={() => setFilters(prev => ({ ...prev, region: region.id }))}
                              className={`px-3 py-1.5 text-xs rounded-full flex items-center transition-colors ${
                                filters.region === region.id 
                                  ? 'bg-[#00FF00]/20 text-[#00FF00] border border-[#00FF00]/50' 
                                  : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
                              }`}
                            >
                              {region.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Featured News Section (first item or highlighted) */}
            {!isLoading && highlightedNews && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 overflow-hidden rounded-xl border-2 border-dashed border-[#00FF00]/60 group relative shadow-lg shadow-[#00FF00]/5"
              >
                <div className="relative h-80 md:h-96 overflow-hidden">
                  {highlightedNews.urlToImage ? (
                    <img
                      src={highlightedNews.urlToImage}
                      alt={highlightedNews.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                      <span className="text-[#00FF00] font-mono text-2xl">FEATURED_CYBER_NEWS</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-90" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                    <div className="flex gap-2 mb-3">
                      <div className={`h-2 w-2 rounded-full ${getSeverityColor(highlightedNews)} mt-1.5`}></div>
                      <div className="text-sm font-medium px-2 py-1 rounded bg-[#00FF00]/20 text-[#00FF00] inline-block mb-3">
                        {highlightedNews.source.name}
                      </div>
                      <div className="text-sm font-medium px-2 py-1 rounded bg-gray-800/80 text-gray-300 inline-block mb-3">
                        FEATURED
                      </div>
                    </div>
                    
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                      {highlightedNews.title}
                    </h2>
                    
                    <p className="text-gray-300 mb-4 max-w-3xl">
                      {highlightedNews.description}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">
                        {formatDate(highlightedNews.publishedAt)}
                      </span>
                      
                      <div className="flex space-x-3">
                        <button className="bg-gray-800/80 hover:bg-gray-700 p-2 rounded-full text-gray-300 hover:text-white transition-colors">
                          <Share2 className="h-4 w-4" />
                        </button>
                        
                        <a
                          href={highlightedNews.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center bg-[#00FF00]/20 px-4 py-2 rounded-lg text-[#00FF00] hover:bg-[#00FF00]/30 transition-colors"
                        >
                          <span className="mr-2">Read Full Story</span>
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* News grid */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <RefreshCw className="animate-spin h-12 w-12 text-[#00FF00] mb-4" />
                <p className="text-gray-400 font-mono">Loading cyber intelligence...</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-semibold text-lg">Latest Cybersecurity News</h3>
                  <p className="text-gray-400 text-sm">{filteredNews.length} results</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredNews.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className="bg-gray-900/50 backdrop-blur-sm rounded-lg overflow-hidden border border-gray-800 hover:border-[#00FF00]/50 transition-all group"
                    >
                      <div className="relative h-48 overflow-hidden bg-gray-800">
                        {item.urlToImage ? (
                          <img
                            src={item.urlToImage}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-800">
                            <span className="text-[#00FF00] font-mono text-lg">CYBER_NEWS</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        
                        <div className="absolute top-3 right-3">
                          <button 
                            onClick={() => toggleBookmark(index)}
                            className="p-1.5 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors"
                          >
                            <Bookmark className={`h-4 w-4 ${item.saved ? 'text-[#00FF00] fill-[#00FF00]' : 'text-gray-300'}`} />
                          </button>
                        </div>
                        
                        <div className="absolute bottom-3 left-4 right-4 flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <div className={`h-2 w-2 rounded-full ${getSeverityColor(item)}`}></div>
                            <div className="text-xs font-medium px-2 py-1 rounded bg-[#00FF00]/20 text-[#00FF00] inline-block">
                              {item.source.name}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h2 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-[#00FF00] transition-colors">
                          {item.title}
                        </h2>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                          {item.description || "Read the full article for more details..."}
                        </p>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">
                            {formatDate(item.publishedAt)}
                          </span>
                          
                          <div className="flex space-x-2">
                            <button className="text-gray-400 hover:text-white transition-colors">
                              <Share2 className="h-3.5 w-3.5" />
                            </button>
                            
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-[#00FF00] hover:text-white transition-colors"
                            >
                              <span className="mr-1 text-sm">Read</span>
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
            
            {!isLoading && filteredNews.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-400 mb-4">No cybersecurity news found matching your filters.</p>
                <button 
                  onClick={() => setFilters({
                    sort: "latest",
                    category: "all",
                    region: "all",
                    timeframe: "all",
                    severity: "all",
                    search: ""
                  })}
                  className="px-4 py-2 bg-[#00FF00]/20 text-[#00FF00] rounded-md hover:bg-[#00FF00]/30 transition-colors"
                >
                  <RefreshCw className="h-4 w-4 mr-2 inline" />
                  Reset Filters
                </button>
              </div>
            )}
            
            {/* Newsletter Signup */}
            <div className="mt-16 mb-8 bg-gray-900/30 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-white font-bold text-lg flex items-center">
                    <Bell className="mr-2 h-5 w-5 text-[#00FF00]" />
                    Get Cyber Alerts
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Subscribe to our newsletter for the latest cybersecurity news and alerts
                  </p>
                </div>
                
                <div className="flex w-full md:w-auto">
                  <input
                    type="email"
                    placeholder="your-email@example.com"
                    className="bg-black/50 px-4 py-2 rounded-l-lg text-white border border-gray-700 focus:border-[#00FF00] focus:outline-none w-full md:w-64"
                  />
                  <button className="bg-[#00FF00] hover:bg-[#00DD00] text-black font-medium px-4 py-2 rounded-r-lg transition-colors">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add scan line animation */}
      <style jsx global>{`
        @keyframes scanlines {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(4px);
          }
        }
        
        @keyframes typing {
          from { width: 0 }
          to { width: 100% }
        }
        
        .typing-animation {
          display: inline-block;
          overflow: hidden;
          white-space: nowrap;
          border-right: 2px solid #00FF00;
          animation: 
            typing 3.5s steps(40, end),
            blink-caret 0.75s step-end infinite;
        }
        
        @keyframes blink-caret {
          from, to { border-color: transparent }
          50% { border-color: #00FF00 }
        }
      `}</style>
    </div>
  )
}

// Mock data for fallback or demo
function getMockNewsData(): NewsItem[] {
  return [
    {
      title: "Major Healthcare Provider Hit by Ransomware Attack",
      description: "A leading healthcare provider has been hit by a sophisticated ransomware attack, potentially exposing patient data and disrupting services across multiple hospitals.",
      url: "#",
      urlToImage: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
      source: {
        name: "CyberSecurity Today"
      },
      severity: "critical",
      category: "ransomware",
      region: "us"
    },
    {
      title: "New Zero-Day Vulnerability Discovered in Popular Operating System",
      description: "Security researchers have identified a critical zero-day vulnerability affecting millions of devices worldwide. The flaw could allow attackers to gain complete system access.",
      url: "#",
      urlToImage: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      publishedAt: new Date(Date.now() - 7200000).toISOString(),
      source: {
        name: "Security Week"
      },
      severity: "high",
      category: "vulnerability",
      region: "global"
    },
    {
      title: "Government Agency Issues Warning About Targeted Phishing Campaign",
      description: "A national cybersecurity agency has alerted organizations to a sophisticated phishing campaign targeting government contractors and critical infrastructure providers.",
      url: "#",
      urlToImage: "https://images.unsplash.com/photo-1563237023-b1e970526dcb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      publishedAt: new Date(Date.now() - 10800000).toISOString(),
      source: {
        name: "Threat Post"
      },
      severity: "medium",
      category: "threats",
      region: "us"
    },
    {
      title: "Tech Giant Patches Critical Security Flaw in Cloud Platform",
      description: "A major technology company has released an emergency patch for a critical vulnerability in its cloud platform that could have allowed unauthorized access to sensitive data.",
      url: "#",
      urlToImage: "https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      publishedAt: new Date(Date.now() - 14400000).toISOString(),
      source: {
        name: "The Cyber Wire"
      },
      severity: "high",
      category: "vulnerability",
      region: "global"
    },
    {
      title: "New Malware Strain Targets Banking Applications on Mobile Devices",
      description: "Cybersecurity researchers have discovered a sophisticated new malware strain specifically designed to target banking applications on Android and iOS devices.",
      url: "#",
      urlToImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      publishedAt: new Date(Date.now() - 18000000).toISOString(),
      source: {
        name: "Dark Reading"
      },
      severity: "high",
      category: "threats",
      region: "global"
    },
    {
      title: "International Operation Takes Down Major Cybercrime Network",
      description: "Law enforcement agencies from multiple countries have successfully disrupted a major cybercrime network responsible for stealing millions through business email compromise attacks.",
      url: "#",
      urlToImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      publishedAt: new Date(Date.now() - 21600000).toISOString(),
      source: {
        name: "Krebs on Security"
      },
      severity: "medium",
      category: "threats",
      region: "eu"
    },
    {
      title: "Security Researchers Identify Backdoor in Popular IoT Devices",
      description: "A team of security researchers has identified a backdoor in widely used IoT devices that could be exploited to gain unauthorized access to home and business networks.",
      url: "#",
      urlToImage: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      publishedAt: new Date(Date.now() - 25200000).toISOString(),
      source: {
        name: "Wired Security"
      },
      severity: "high",
      category: "vulnerability",
      region: "asia"
    },
    {
      title: "Critical Infrastructure Operators Warned About State-Sponsored Attacks",
      description: "Government officials have issued an alert warning critical infrastructure operators about an increase in state-sponsored cyber attacks targeting energy, water, and transportation sectors.",
      url: "#",
      urlToImage: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      publishedAt: new Date(Date.now() - 28800000).toISOString(),
      source: {
        name: "CyberScoop"
      },
      severity: "critical",
      category: "threats",
      region: "global"
    },
    {
      title: "Financial Institutions Targeted in Massive DDoS Attack Campaign",
      description: "Several major financial institutions have been hit by a coordinated campaign of distributed denial-of-service attacks, causing temporary disruptions to online banking services.",
      url: "#",
      urlToImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      publishedAt: new Date(Date.now() - 32400000).toISOString(),
      source: {
        name: "BleepingComputer"
      },
      severity: "high",
      category: "threats",
      region: "global"
    }
  ]
}
