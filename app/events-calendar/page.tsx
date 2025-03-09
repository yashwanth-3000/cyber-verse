"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  Calendar, 
  MapPin, 
  ExternalLink, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter, 
  Tag, 
  Globe, 
  Users,
  Clock,
  ArrowLeft
} from "lucide-react";

// Types for event data
interface EventItem {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  location: string;
  url: string;
  description: string;
  type: "conference" | "webinar" | "training" | "workshop";
  isPremium: boolean;
  tags: string[];
}

// Month names for the calendar
const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

// Event types with colors
const EVENT_TYPES = {
  conference: { label: "Conference", color: "bg-purple-500" },
  webinar: { label: "Webinar", color: "bg-blue-500" },
  training: { label: "Training", color: "bg-green-500" },
  workshop: { label: "Workshop", color: "bg-orange-500" },
};

export default function EventsCalendarPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "calendar">("grid");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [featuredEvent, setFeaturedEvent] = useState<EventItem | null>(null);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);

  // Calculate current month
  const currentMonthDisplay = MONTHS[selectedMonth];

  // Fetch events data
  useEffect(() => {
    async function fetchEvents() {
      setIsLoading(true);
      try {
        // Simulate fetching data from SANS
        const data = getMockEventsData();
        setEvents(data);
        
        // Set featured event (first premium event or first event)
        const premium = data.find(event => event.isPremium);
        setFeaturedEvent(premium || data[0]);
        
        // Extract unique tags and locations
        const allTags = data.flatMap(event => event.tags);
        const uniqueTags = [...new Set(allTags)].sort();
        setAvailableTags(uniqueTags);
        
        const allLocations = data.map(event => {
          // Extract city from location string
          const locationParts = event.location.split(',');
          return locationParts[0].trim();
        });
        const uniqueLocations = [...new Set(allLocations)].sort();
        setAvailableLocations(uniqueLocations);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvents();
  }, []);

  // Filter events based on search query and filters
  useEffect(() => {
    if (!events.length) return;

    let filtered = [...events];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        event => 
          event.title.toLowerCase().includes(query) || 
          event.description.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query)
      );
    }

    // Apply event type filter
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(event => selectedTypes.includes(event.type));
    }
    
    // Apply tags filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(event => 
        event.tags.some(tag => selectedTags.includes(tag))
      );
    }
    
    // Apply location filter
    if (selectedLocations.length > 0) {
      filtered = filtered.filter(event => {
        const cityPart = event.location.split(',')[0].trim();
        return selectedLocations.includes(cityPart);
      });
    }

    // Filter by month and year for calendar view
    if (viewMode === "calendar") {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getMonth() === selectedMonth && eventDate.getFullYear() === selectedYear;
      });
    }

    setFilteredEvents(filtered);
  }, [events, searchQuery, selectedTypes, selectedTags, selectedLocations, selectedMonth, selectedYear, viewMode]);

  // Handle month navigation
  const navigateMonth = (direction: "prev" | "next") => {
    if (direction === "prev") {
      if (selectedMonth === 0) {
        setSelectedMonth(11);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    } else {
      if (selectedMonth === 11) {
        setSelectedMonth(0);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    }
  };

  // Handle event type toggle
  const toggleEventType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };
  
  // Toggle location selection
  const toggleLocation = (location: string) => {
    setSelectedLocations(prev => 
      prev.includes(location) 
        ? prev.filter(l => l !== location)
        : [...prev, location]
    );
  };

  // Format date range for display
  const formatDateRange = (startDate: string, endDate?: string) => {
    const start = new Date(startDate);
    const startMonth = start.toLocaleString('default', { month: 'short' });
    const startDay = start.getDate();
    
    if (!endDate) return `${startMonth} ${startDay}, ${start.getFullYear()}`;
    
    const end = new Date(endDate);
    
    // Same year
    if (start.getFullYear() === end.getFullYear()) {
      // Same month
      if (start.getMonth() === end.getMonth()) {
        return `${startMonth} ${startDay}-${end.getDate()}, ${start.getFullYear()}`;
      } 
      // Different month
      return `${startMonth} ${startDay} - ${end.toLocaleString('default', { month: 'short' })} ${end.getDate()}, ${start.getFullYear()}`;
    }
    
    // Different year
    return `${startMonth} ${startDay}, ${start.getFullYear()} - ${end.toLocaleString('default', { month: 'short' })} ${end.getDate()}, ${end.getFullYear()}`;
  };

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

        {/* Main content */}
        <div className="relative z-10 p-4 md:p-8" style={{
          fontFamily: "Menlo, Monaco, Consolas, 'Courier New', monospace"
        }}>
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col mb-8">
              <div className="flex items-center mb-2">
                <Link
                  href="/what-you-want-to-know"
                  className="inline-flex items-center text-[#00FF00] hover:text-[#00FF00]/80 transition-colors mr-4"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Resources
                </Link>
                <div className="h-px flex-grow bg-gradient-to-r from-[#00FF00]/0 via-[#00FF00]/40 to-[#00FF00]/0"></div>
              </div>
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="text-[#00FF00]/70 text-xs font-mono mb-1">
                    <span className="mr-1">$</span>
                    <span className="typing-animation">display --events --sources=sans.org</span>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-bold text-[#00FF00] font-mono tracking-tight">
                    Cyber<span className="text-white">Events</span>
                  </h1>
                  <p className="text-gray-400 mt-2 font-mono max-w-2xl">
                    Stay updated with the latest cybersecurity conferences, webinars, and training opportunities from SANS and other leading organizations.
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  <button 
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md ${viewMode === "grid" ? "bg-[#00FF00]/20 text-[#00FF00]" : "bg-gray-800 text-gray-400"}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7"></rect>
                      <rect x="14" y="3" width="7" height="7"></rect>
                      <rect x="14" y="14" width="7" height="7"></rect>
                      <rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                  </button>
                  <button 
                    onClick={() => setViewMode("calendar")} 
                    className={`p-2 rounded-md ${viewMode === "calendar" ? "bg-[#00FF00]/20 text-[#00FF00]" : "bg-gray-800 text-gray-400"}`}
                  >
                    <Calendar className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Search and filters */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-gray-900/80 w-full pl-10 pr-4 py-2 rounded-lg text-white border border-gray-800 focus:border-[#00FF00] focus:outline-none focus:ring-1 focus:ring-[#00FF00]"
                  />
                  
                  {/* Search tips tooltip */}
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 group">
                    <div className="text-gray-400 cursor-help">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                      </svg>
                    </div>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-3 bg-gray-800 rounded-lg shadow-xl z-10 border border-gray-700 text-xs">
                      <p className="text-white font-medium mb-1">Search Tips:</p>
                      <ul className="text-gray-300 list-disc pl-4 space-y-1">
                        <li>Search by event title, location, or description</li>
                        <li>Use specific terms like "Workshop" or "SANS"</li>
                        <li>Combine with filters for best results</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`inline-flex items-center px-4 py-2 rounded-lg border transition-all ${
                      showFilters 
                        ? "bg-[#00FF00]/20 text-[#00FF00] border-[#00FF00]/30" 
                        : "bg-gray-900/80 border-gray-800 text-gray-300 hover:border-[#00FF00] hover:text-[#00FF00]"
                    }`}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {(selectedTypes.length > 0 || selectedTags.length > 0 || selectedLocations.length > 0) && 
                      <span className="ml-1.5 flex items-center justify-center bg-[#00FF00] text-black rounded-full h-5 w-5 text-xs font-medium">
                        {selectedTypes.length + selectedTags.length + selectedLocations.length}
                      </span>
                    }
                  </button>
                  
                  <button 
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md ${viewMode === "grid" ? "bg-[#00FF00]/20 text-[#00FF00]" : "bg-gray-800 text-gray-400"}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7"></rect>
                      <rect x="14" y="3" width="7" height="7"></rect>
                      <rect x="14" y="14" width="7" height="7"></rect>
                      <rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                  </button>
                  
                  <button 
                    onClick={() => setViewMode("calendar")} 
                    className={`p-2 rounded-md ${viewMode === "calendar" ? "bg-[#00FF00]/20 text-[#00FF00]" : "bg-gray-800 text-gray-400"}`}
                  >
                    <Calendar className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {/* Filter panel */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden mt-4"
                  >
                    <div className="p-4 bg-gray-900/50 border border-gray-800 rounded-lg space-y-4">
                      {/* Event Type Filter */}
                      <div>
                        <h3 className="text-white font-medium mb-3">Event Type</h3>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(EVENT_TYPES).map(([type, { label, color }]) => (
                            <button
                              key={type}
                              onClick={() => toggleEventType(type)}
                              className={`flex items-center px-3 py-1.5 rounded-full text-xs ${
                                selectedTypes.includes(type)
                                  ? `${color.replace('bg-', 'bg-opacity-20 text-')} border border-${color.replace('bg-', '')}`
                                  : 'bg-gray-800 text-gray-400 border border-gray-700'
                              }`}
                            >
                              <span className={`h-2 w-2 rounded-full ${color} mr-1.5`}></span>
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Popular Tags Filter */}
                      <div>
                        <h3 className="text-white font-medium mb-3">Popular Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {availableTags.slice(0, 10).map((tag) => (
                            <button
                              key={tag}
                              onClick={() => toggleTag(tag)}
                              className={`flex items-center px-3 py-1.5 rounded-full text-xs ${
                                selectedTags.includes(tag)
                                  ? `bg-blue-500/20 text-blue-400 border border-blue-500/50`
                                  : 'bg-gray-800 text-gray-400 border border-gray-700'
                              }`}
                            >
                              <Tag className="h-3 w-3 mr-1.5" />
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Locations Filter */}
                      <div>
                        <h3 className="text-white font-medium mb-3">Locations</h3>
                        <div className="flex flex-wrap gap-2">
                          {availableLocations.slice(0, 10).map((location) => (
                            <button
                              key={location}
                              onClick={() => toggleLocation(location)}
                              className={`flex items-center px-3 py-1.5 rounded-full text-xs ${
                                selectedLocations.includes(location)
                                  ? `bg-green-500/20 text-green-400 border border-green-500/50`
                                  : 'bg-gray-800 text-gray-400 border border-gray-700'
                              }`}
                            >
                              <MapPin className="h-3 w-3 mr-1.5" />
                              {location}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Reset Filters */}
                      {(selectedTypes.length > 0 || selectedTags.length > 0 || selectedLocations.length > 0) && (
                        <div className="flex justify-end mt-2">
                          <button
                            onClick={() => {
                              setSelectedTypes([]);
                              setSelectedTags([]);
                              setSelectedLocations([]);
                            }}
                            className="text-xs text-gray-400 hover:text-white flex items-center"
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Reset Filters
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Calendar mode header */}
            {viewMode === "calendar" && (
              <div className="flex justify-between items-center mb-6">
                <button 
                  onClick={() => navigateMonth("prev")}
                  className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                <h2 className="text-xl font-bold text-white">
                  {currentMonthDisplay} {selectedYear}
                </h2>
                
                <button 
                  onClick={() => navigateMonth("next")}
                  className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
            
            {/* Featured event (only in grid view) */}
            {viewMode === "grid" && featuredEvent && !isLoading && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 bg-gradient-to-br from-gray-900/80 to-black border-2 border-dashed border-[#00FF00]/60 rounded-xl overflow-hidden shadow-lg shadow-[#00FF00]/5"
              >
                <div className="p-6 md:p-8 relative">
                  {featuredEvent.isPremium && (
                    <div className="absolute top-4 right-4 bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-xs font-medium border border-amber-500/30">
                      Featured Event
                    </div>
                  )}
                  
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-grow">
                      <div className="flex items-center mb-4 space-x-2">
                        <div className={`h-2.5 w-2.5 rounded-full ${EVENT_TYPES[featuredEvent.type].color}`}></div>
                        <span className="text-sm text-gray-300">{EVENT_TYPES[featuredEvent.type].label}</span>
                      </div>
                      
                      <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                        {featuredEvent.title}
                      </h2>
                      
                      <p className="text-gray-400 mb-4 max-w-3xl">
                        {featuredEvent.description}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-[#00FF00] mr-2" />
                          <span className="text-sm text-gray-300">
                            {formatDateRange(featuredEvent.date, featuredEvent.endDate)}
                          </span>
                        </div>
                        
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-[#00FF00] mr-2" />
                          <span className="text-sm text-gray-300">
                            {featuredEvent.location}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2">
                          {featuredEvent.tags.map((tag, i) => (
                            <span key={i} className="bg-gray-800 text-xs px-2 py-1 rounded text-gray-300">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <a
                        href={featuredEvent.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center bg-[#00FF00]/20 text-[#00FF00] px-4 py-2 rounded-lg hover:bg-[#00FF00]/30 transition-colors"
                      >
                        View Event Details
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Loading state */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <RefreshCw className="animate-spin h-12 w-12 text-[#00FF00] mb-4" />
                <p className="text-gray-400 font-mono">Loading events...</p>
              </div>
            ) : (
              <>
                {/* Empty state */}
                {filteredEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Calendar className="h-16 w-16 text-gray-700 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No events found</h3>
                    <p className="text-gray-400 max-w-md">
                      {searchQuery || selectedTypes.length > 0 
                        ? "Try adjusting your filters or search query to see more events." 
                        : "There are no events scheduled for this period."}
                    </p>
                    {(searchQuery || selectedTypes.length > 0) && (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedTypes([]);
                        }}
                        className="mt-4 text-[#00FF00] hover:underline"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Grid view */}
                    {viewMode === "grid" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEvents.map((event, index) => (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            className="bg-gray-900/40 backdrop-blur-sm rounded-lg overflow-hidden border border-gray-800 hover:border-[#00FF00]/50 transition-all group"
                          >
                            <div className="p-5">
                              <div className="flex justify-between items-start mb-3">
                                <div className={`px-2 py-1 rounded text-xs ${EVENT_TYPES[event.type].color.replace('bg-', 'bg-opacity-20 text-')}`}>
                                  {EVENT_TYPES[event.type].label}
                                </div>
                                {event.isPremium && (
                                  <div className="bg-amber-500/10 text-amber-400 px-2 py-1 rounded-full text-xs">
                                    Featured
                                  </div>
                                )}
                              </div>
                              
                              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#00FF00] transition-colors">
                                {event.title}
                              </h3>
                              
                              <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                                {event.description}
                              </p>
                              
                              <div className="flex flex-wrap gap-1 mb-3">
                                {event.tags.slice(0, 3).map((tag, i) => (
                                  <span key={i} className="bg-gray-800 text-xs px-2 py-0.5 rounded text-gray-300">
                                    {tag}
                                  </span>
                                ))}
                                {event.tags.length > 3 && (
                                  <span className="bg-gray-800 text-xs px-2 py-0.5 rounded text-gray-300">
                                    +{event.tags.length - 3}
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center text-xs text-gray-500">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {formatDateRange(event.date, event.endDate)}
                                </div>
                                
                                <div className="flex items-center text-xs text-gray-500">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {event.location}
                                </div>
                              </div>
                              
                              <a
                                href={event.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-center bg-gray-800 hover:bg-[#00FF00]/20 text-gray-300 hover:text-[#00FF00] px-4 py-2 rounded-lg transition-colors"
                              >
                                View Event
                              </a>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                    
                    {/* Calendar view */}
                    {viewMode === "calendar" && (
                      <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
                        <div className="grid grid-cols-7 border-b border-gray-800">
                          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
                            <div key={i} className="p-3 text-center text-gray-400 text-sm font-medium">
                              {day}
                            </div>
                          ))}
                        </div>
                        
                        <div className="grid grid-cols-7 auto-rows-fr">
                          {generateCalendarDays(selectedMonth, selectedYear).map((day, i) => (
                            <div 
                              key={i} 
                              className={`min-h-[100px] border-b border-r border-gray-800 p-2 ${
                                day.isCurrentMonth ? 'bg-transparent' : 'bg-gray-900/70 opacity-50'
                              }`}
                            >
                              <div className="flex justify-between items-center mb-2">
                                <span className={`text-sm ${
                                  day.isToday 
                                    ? 'bg-[#00FF00]/20 text-[#00FF00] h-6 w-6 rounded-full flex items-center justify-center' 
                                    : 'text-gray-500'
                                }`}>
                                  {day.day}
                                </span>
                              </div>
                              
                              {/* Events for this day */}
                              <div className="space-y-1.5">
                                {getEventsForDay(filteredEvents, day).map((event, idx) => (
                                  <a
                                    key={idx}
                                    href={event.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-xs p-1 rounded truncate hover:bg-gray-800 transition-colors"
                                    style={{ 
                                      backgroundColor: `${EVENT_TYPES[event.type].color.replace('bg-', 'rgba(').replace('500', `, 0.1)`)}`,
                                      borderLeft: `2px solid ${EVENT_TYPES[event.type].color.replace('bg-', 'var(--').replace('500', ')')}`,
                                    }}
                                  >
                                    {event.title}
                                  </a>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
            
            {/* Event type legend (only show when there are events) */}
            {!isLoading && filteredEvents.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-3 justify-center">
                {Object.entries(EVENT_TYPES).map(([type, { label, color }]) => (
                  <div key={type} className="flex items-center">
                    <div className={`h-3 w-3 rounded-full ${color} mr-1`}></div>
                    <span className="text-xs text-gray-400">{label}</span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Newsletter signup */}
            <div className="mt-16 p-6 bg-gradient-to-br from-gray-900/60 to-black/60 border border-gray-800 rounded-xl">
              <div className="max-w-2xl mx-auto text-center">
                <h3 className="text-xl font-bold text-[#00FF00] mb-2">Never Miss a Cyber Event</h3>
                <p className="text-gray-400 mb-6">Subscribe to our newsletter to receive updates on the latest cybersecurity events and training opportunities.</p>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="email" 
                    placeholder="your-email@example.com" 
                    className="flex-grow px-4 py-2 bg-black/50 rounded-lg border border-gray-700 focus:border-[#00FF00] focus:outline-none text-white"
                  />
                  <button className="bg-[#00FF00] hover:bg-[#00FF00]/90 text-black font-medium px-6 py-2 rounded-lg transition-colors">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to generate calendar days
function generateCalendarDays(month: number, year: number) {
  const result = [];
  const today = new Date();
  
  // First day of the month
  const firstDay = new Date(year, month, 1);
  // Last day of the month
  const lastDay = new Date(year, month + 1, 0);
  
  // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
  const firstDayOfWeek = firstDay.getDay();
  
  // Add days from previous month
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    result.push({
      day: prevMonthLastDay - i,
      isCurrentMonth: false,
      isToday: false,
      date: new Date(year, month - 1, prevMonthLastDay - i)
    });
  }
  
  // Add days of current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i);
    result.push({
      day: i,
      isCurrentMonth: true,
      isToday: 
        today.getDate() === i && 
        today.getMonth() === month && 
        today.getFullYear() === year,
      date
    });
  }
  
  // Add days from next month to complete the grid
  const remainingDays = 42 - result.length; // 6 rows * 7 days = 42
  for (let i = 1; i <= remainingDays; i++) {
    result.push({
      day: i,
      isCurrentMonth: false,
      isToday: false,
      date: new Date(year, month + 1, i)
    });
  }
  
  return result;
}

// Helper function to get events for a specific day
function getEventsForDay(events: EventItem[], day: { date: Date }) {
  return events.filter(event => {
    const eventStartDate = new Date(event.date);
    const eventEndDate = event.endDate ? new Date(event.endDate) : eventStartDate;
    
    // Check if day is within event date range
    return (
      day.date.getTime() >= new Date(eventStartDate.setHours(0, 0, 0, 0)).getTime() &&
      day.date.getTime() <= new Date(eventEndDate.setHours(23, 59, 59, 999)).getTime()
    );
  });
}

// Mock data for events
// Mock data for 100 SANS training events
function getMockEventsData(): EventItem[] {
  return [
    {
      id: "sans-singapore-april-2025",
      title: "SANS Singapore April 2025",
      date: "2025-04-07",
      endDate: "2025-04-12",
      location: "Singapore, SG",
      url: "https://www.sans.org/cyber-security-training-events/singapore-april-2025/",
      description: "1 Course",
      type: "training",
      isPremium: true,
      tags: ["SANS", "Training", "Singapore"]
    },
    {
      id: "sans-2025",
      title: "SANS 2025",
      date: "2025-04-13",
      endDate: "2025-04-18",
      location: "Orlando, FL, US and Virtual (ET)",
      url: "https://www.sans.org/cyber-security-training-events/sans-2025/",
      description: "48 Courses, 2 Cyber Ranges",
      type: "training",
      isPremium: true,
      tags: ["SANS", "Training", "Orlando", "Virtual", "Cyber Ranges"]
    },
    {
      id: "sans-autumn-sydney-2025",
      title: "SANS Autumn Sydney 2025",
      date: "2025-05-05",
      endDate: "2025-05-10",
      location: "Sydney, NSW, AU and Virtual (AEST)",
      url: "https://www.sans.org/cyber-security-training-events/autumn-australia-2025/",
      description: "5 Courses",
      type: "training",
      isPremium: true,
      tags: ["SANS", "Training", "Sydney", "Virtual"]
    },
    {
      id: "sans-london-may-2025",
      title: "SANS London May 2025",
      date: "2025-05-05",
      endDate: "2025-05-10",
      location: "London, GB and Virtual (BST)",
      url: "https://www.sans.org/cyber-security-training-events/london-may-2025/",
      description: "8 Courses, 1 Cyber Range",
      type: "training",
      isPremium: true,
      tags: ["SANS", "Training", "London", "Virtual"]
    },
    {
      id: "sans-security-west-2025",
      title: "SANS Security West 2025",
      date: "2025-05-05",
      endDate: "2025-05-10",
      location: "San Diego, CA, US and Virtual (PT)",
      url: "https://www.sans.org/cyber-security-training-events/sans-security-west-2025/",
      description: "32 Courses, 1 Cyber Range",
      type: "training",
      isPremium: true,
      tags: ["SANS", "Training", "San Diego", "Virtual"]
    },
    {
      id: "sans-amsterdam-may-2025",
      title: "SANS Amsterdam May 2025",
      date: "2025-05-12",
      endDate: "2025-05-24",
      location: "Amsterdam, NL and Virtual (CEST)",
      url: "https://www.sans.org/cyber-security-training-events/amsterdam-may-2025/",
      description: "17 Courses, 2 Cyber Ranges",
      type: "training",
      isPremium: true,
      tags: ["SANS", "Training", "Amsterdam", "Virtual"]
    },

    // Additional Training Events and Summits (Events 7-100)
    {
      id: "sans-security-east-baltimore-2025",
      title: "SANS Security East Baltimore 2025",
      date: "2025-03-03",
      endDate: "2025-03-08",
      location: "Baltimore, MD, US and Virtual (ET)",
      url: "https://www.sans.org/cyber-security-training-events/security-east-2025/",
      description: "23 Courses, 2 Cyber Ranges",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Baltimore", "Virtual"]
    },
    {
      id: "sans-london-march-2025",
      title: "SANS London March 2025",
      date: "2025-03-03",
      endDate: "2025-03-08",
      location: "London, GB and Virtual (GMT)",
      url: "https://www.sans.org/cyber-security-training-events/london-march-2025/",
      description: "7 Courses, 1 Cyber Range",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "London", "Virtual"]
    },
    {
      id: "sans-secure-japan-2025",
      title: "SANS Secure Japan 2025",
      date: "2025-03-03",
      endDate: "2025-03-15",
      location: "Tokyo, JP and Virtual (JST)",
      url: "https://www.sans.org/cyber-security-training-events/secure-japan-2025/",
      description: "12 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Tokyo", "Japan", "Virtual"]
    },
    {
      id: "sans-secure-singapore-2025",
      title: "SANS Secure Singapore 2025",
      date: "2025-03-10",
      endDate: "2025-03-22",
      location: "Singapore, SG and Virtual (SGT)",
      url: "https://www.sans.org/cyber-security-training-events/secure-singapore-2025/",
      description: "14 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Singapore", "Virtual"]
    },
    {
      id: "sans-secure-korea-2025",
      title: "SANS Secure Korea 2025",
      date: "2025-03-10",
      endDate: "2025-03-22",
      location: "Seoul, KR",
      url: "https://www.sans.org/cyber-security-training-events/secure-korea-2025/",
      description: "3 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Seoul", "Korea"]
    },
    {
      id: "sans-san-antonio-spring-2025",
      title: "SANS San Antonio Spring 2025",
      date: "2025-03-17",
      endDate: "2025-03-22",
      location: "San Antonio, TX, US and Virtual (CT)",
      url: "https://www.sans.org/cyber-security-training-events/san-antonio-spring-2025/",
      description: "7 Courses, 1 Cyber Range",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "San Antonio", "Virtual"]
    },
    {
      id: "sans-secure-south-asia-2025",
      title: "SANS Secure South Asia 2025",
      date: "2025-03-17",
      endDate: "2025-03-22",
      location: "Delhi, IN and Virtual (IST)",
      url: "https://www.sans.org/cyber-security-training-events/secure-south-asia-2025/",
      description: "4 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Delhi", "South Asia", "Virtual"]
    },
    {
      id: "sans-adelaide-2025",
      title: "SANS Adelaide 2025",
      date: "2025-03-17",
      endDate: "2025-03-22",
      location: "Adelaide, SA, AU and Virtual (ACDT)",
      url: "https://www.sans.org/cyber-security-training-events/adelaide-2025/",
      description: "2 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Adelaide", "Virtual"]
    },
    {
      id: "sans-paris-march-2025",
      title: "SANS Paris March 2025",
      date: "2025-03-17",
      endDate: "2025-03-22",
      location: "Paris, FR",
      url: "https://www.sans.org/cyber-security-training-events/paris-march-2025/",
      description: "5 Courses, 1 Cyber Range",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Paris"]
    },
    {
      id: "sans-dfir-dallas-2025",
      title: "SANS DFIR Dallas 2025",
      date: "2025-03-24",
      endDate: "2025-03-29",
      location: "Dallas, TX, US and Virtual (CT)",
      url: "https://www.sans.org/cyber-security-training-events/dfir-dallas-2025/",
      description: "7 Courses, 1 Cyber Range",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Dallas", "Virtual"]
    },
    {
      id: "sans-munich-march-2025",
      title: "SANS Munich March 2025",
      date: "2025-03-24",
      endDate: "2025-03-29",
      location: "Munich, DE",
      url: "https://www.sans.org/cyber-security-training-events/munich-march-2025/",
      description: "4 Courses, 1 Cyber Range",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Munich"]
    },
    {
      id: "sans-human-risk-europe-online-march-2025",
      title: "SANS Human Risk Europe Online March 2025",
      date: "2025-03-26",
      endDate: "2025-03-28",
      location: "Virtual (Greenwich Mean Time, NL)",
      url: "https://www.sans.org/cyber-security-training-events/human-risk-europe-online-march-2025/",
      description: "1 Course",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Online", "Europe"]
    },
    {
      id: "ai-cybersecurity-summit-2025",
      title: "AI Cybersecurity Summit 2025",
      date: "2025-03-31",
      endDate: "2025-04-07",
      location: "Denver, CO, US and Virtual (MT)",
      url: "https://www.sans.org/cyber-security-training-events/ai-summit-2025/",
      description: "4 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "AI", "Cybersecurity", "Denver", "Virtual"]
    },
    {
      id: "sans-amsterdam-march-2025",
      title: "SANS Amsterdam March 2025",
      date: "2025-03-31",
      endDate: "2025-04-05",
      location: "Amsterdam, NL and Virtual (CEST)",
      url: "https://www.sans.org/cyber-security-training-events/amsterdam-march-2025/",
      description: "8 Courses, 1 Cyber Range",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Amsterdam", "Virtual"]
    },
    {
      id: "sans-secure-canberra-2025",
      title: "SANS Secure Canberra 2025",
      date: "2025-03-31",
      endDate: "2025-04-05",
      location: "Canberra, ACT, AU and Virtual (AEDT)",
      url: "https://www.sans.org/cyber-security-training-events/secure-australia-2025/",
      description: "5 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Canberra", "Virtual"]
    },
    {
      id: "sans-cyber-security-mountain-mar-2025",
      title: "SANS Cyber Security Mountain: Mar 2025",
      date: "2025-03-31",
      endDate: "2025-04-05",
      location: "Virtual (US Mountain)",
      url: "https://www.sans.org/cyber-security-training-events/cyber-security-mtn-mar-2025/",
      description: "4 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Mountain", "Virtual"]
    },
    {
      id: "sans-sec595-europe-online-april-2025",
      title: "SANS SEC595 Europe Online April 2025",
      date: "2025-04-07",
      endDate: "2025-04-12",
      location: "Virtual (British Summer Time, NL)",
      url: "https://www.sans.org/cyber-security-training-events/sec595-europe-online-april-2025/",
      description: "1 Course",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Europe", "Online"]
    },
    {
      id: "sans-london-april-2025",
      title: "SANS London April 2025",
      date: "2025-04-07",
      endDate: "2025-04-12",
      location: "London, GB and Virtual (BST)",
      url: "https://www.sans.org/cyber-security-training-events/london-april-2025/",
      description: "7 Courses, 1 Cyber Range",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "London", "Virtual"]
    },
    {
      id: "sans-live-online-europe-april-2025",
      title: "SANS Live Online Europe April 2025",
      date: "2025-04-28",
      endDate: "2025-05-03",
      location: "Virtual (British Summer Time, NL)",
      url: "https://www.sans.org/cyber-security-training-events/live-online-europe-april-2025/",
      description: "5 Courses, 1 Cyber Range",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Live Online", "Europe", "Virtual"]
    },
    {
      id: "sans-chicago-spring-2025",
      title: "SANS Chicago Spring 2025",
      date: "2025-04-28",
      endDate: "2025-05-03",
      location: "Chicago, IL, US and Virtual (CT)",
      url: "https://www.sans.org/cyber-security-training-events/chicago-spring-2025/",
      description: "9 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Chicago", "Virtual"]
    },
    {
      id: "sans-stay-sharp-april-2025",
      title: "SANS Stay Sharp: April 2025",
      date: "2025-04-28",
      endDate: "2025-05-02",
      location: "Virtual (US Central)",
      url: "https://www.sans.org/cyber-security-training-events/stay-sharp-april-2025/",
      description: "6 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Stay Sharp", "Virtual"]
    },
    {
      id: "sans-cairo-may-2025",
      title: "SANS Cairo May 2025",
      date: "2025-05-03",
      endDate: "2025-05-08",
      location: "Cairo, EG and Virtual (EEST)",
      url: "https://www.sans.org/cyber-security-training-events/cairo-may-2025/",
      description: "2 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Cairo", "Virtual"]
    },
    {
      id: "sans-riyadh-may-2025",
      title: "SANS Riyadh May 2025",
      date: "2025-05-10",
      endDate: "2025-05-22",
      location: "Riyadh, SA and Virtual (AST)",
      url: "https://www.sans.org/cyber-security-training-events/riyadh-may-2025/",
      description: "8 Courses, 1 Cyber Range",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Riyadh", "Virtual"]
    },
    {
      id: "sans-doha-may-2025",
      title: "SANS Doha May 2025",
      date: "2025-05-10",
      endDate: "2025-05-15",
      location: "Doha, QA and Virtual (AST)",
      url: "https://www.sans.org/cyber-security-training-events/doha-may-2025/",
      description: "4 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Doha", "Virtual"]
    },
    {
      id: "sans-sec530-canberra-2025",
      title: "SANS SEC530 Canberra 2025",
      date: "2025-05-12",
      endDate: "2025-05-17",
      location: "Canberra, ACT, AU and Virtual (AEST)",
      url: "https://www.sans.org/cyber-security-training-events/sec530-canberra-2025/",
      description: "1 Course",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Canberra", "Virtual"]
    },
    {
      id: "sec504-part-time-may-june-2025",
      title: "SEC504: Part-Time Schedule (ET)",
      date: "2025-05-13",
      endDate: "2025-06-12",
      location: "Virtual (US Eastern)",
      url: "https://www.sans.org/cyber-security-training-events/sec504-part-time-may-june-2025/",
      description: "1 Course",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "SEC504", "Part-Time", "Virtual"]
    },
    {
      id: "sec588-part-time-may-june-2025",
      title: "SEC588: Part-Time Schedule (ET)",
      date: "2025-05-13",
      endDate: "2025-06-12",
      location: "Virtual (US Eastern)",
      url: "https://www.sans.org/cyber-security-training-events/sec588-part-time-may-june-2025/",
      description: "1 Course",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "SEC588", "Part-Time", "Virtual"]
    },
    {
      id: "sans-abu-dhabi-may-2025",
      title: "SANS Abu Dhabi May 2025",
      date: "2025-05-18",
      endDate: "2025-05-23",
      location: "Abu Dhabi, AE and Virtual (GST)",
      url: "https://www.sans.org/cyber-security-training-events/abu-dhabi-may-2025/",
      description: "3 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Abu Dhabi", "Virtual"]
    },
    {
      id: "sans-auscert-gold-coast-2025",
      title: "SANS at AusCERT Gold Coast",
      date: "2025-05-19",
      endDate: "2025-05-20",
      location: "Gold Coast, QLD, AU",
      url: "https://www.sans.org/cyber-security-training-events/sans-at-auscert-2025/",
      description: "1 Course",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Gold Coast"]
    },
    {
      id: "sans-security-leadership-nashville-2025",
      title: "SANS Security Leadership Nashville 2025",
      date: "2025-05-19",
      endDate: "2025-05-23",
      location: "Nashville, TN, US and Virtual (CT)",
      url: "https://www.sans.org/cyber-security-training-events/security-leadership-nashville-2025/",
      description: "9 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Nashville", "Virtual"]
    },
    {
      id: "sans-live-online-europe-may-2025",
      title: "SANS Live Online Europe May 2025",
      date: "2025-05-19",
      endDate: "2025-05-23",
      location: "Virtual (British Summer Time, NL)",
      url: "https://www.sans.org/cyber-security-training-events/live-online-europe-may-2025/",
      description: "2 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Live Online", "Europe", "Virtual"]
    },
    {
      id: "sans-philippines-sec504-2025",
      title: "SANS Philippines SEC504",
      date: "2025-05-19",
      endDate: "2025-05-24",
      location: "Manila, PH",
      url: "https://www.sans.org/cyber-security-training-events/philippines-sec504-2025/",
      description: "1 Course",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Philippines", "SEC504"]
    },
    {
      id: "sans-dubai-may-2025",
      title: "SANS Dubai May 2025",
      date: "2025-05-25",
      endDate: "2025-05-30",
      location: "Dubai, AE and Virtual (GST)",
      url: "https://www.sans.org/cyber-security-training-events/dubai-may-2025/",
      description: "3 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Dubai", "Virtual"]
    },
    {
      id: "sans-madrid-june-2025",
      title: "SANS Madrid June 2025",
      date: "2025-06-02",
      endDate: "2025-06-07",
      location: "Madrid, ES",
      url: "https://www.sans.org/cyber-security-training-events/madrid-june-2025/",
      description: "4 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Madrid"]
    },
    {
      id: "sans-zurich-june-2025",
      title: "SANS Zurich June 2025",
      date: "2025-06-02",
      endDate: "2025-06-07",
      location: "Zurich, CH",
      url: "https://www.sans.org/cyber-security-training-events/zurich-june-2025/",
      description: "2 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Zurich"]
    },
    {
      id: "sans-cyber-defense-miami-2025",
      title: "SANS Cyber Defense Miami 2025",
      date: "2025-06-02",
      endDate: "2025-06-07",
      location: "Coral Gables, FL, US and Virtual (ET)",
      url: "https://www.sans.org/cyber-security-training-events/cyber-defense-miami-2025/",
      description: "13 Courses, 1 Cyber Range",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Miami", "Virtual"]
    },
    {
      id: "sans-baltimore-spring-2025",
      title: "SANS Baltimore Spring 2025",
      date: "2025-06-02",
      endDate: "2025-06-07",
      location: "Baltimore, MD, US and Virtual (ET)",
      url: "https://www.sans.org/cyber-security-training-events/baltimore-spring-2025/",
      description: "15 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Baltimore", "Virtual"]
    },
    {
      id: "sans-offensive-operations-east-2025",
      title: "SANS Offensive Operations East 2025",
      date: "2025-06-08",
      endDate: "2025-06-14",
      location: "Baltimore, MD, US and Virtual (ET)",
      url: "https://www.sans.org/cyber-security-training-events/offensive-operations-east-2025/",
      description: "16 Courses, 1 Cyber Range",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Baltimore", "Virtual", "Offensive Operations"]
    },
    {
      id: "sans-london-june-2025",
      title: "SANS London June 2025",
      date: "2025-06-09",
      endDate: "2025-06-14",
      location: "London, GB and Virtual (BST)",
      url: "https://www.sans.org/cyber-security-training-events/london-june-2025/",
      description: "8 Courses, 1 Cyber Range",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "London", "Virtual"]
    },
    {
      id: "sans-cyber-defence-south-asia-2025",
      title: "SANS Cyber Defence South Asia 2025",
      date: "2025-06-09",
      endDate: "2025-06-14",
      location: "Virtual (India Standard Time, IN)",
      url: "https://www.sans.org/cyber-security-training-events/cyber-defence-south-asia-2025/",
      description: "4 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "South Asia", "Virtual"]
    },
    {
      id: "ics-security-summit-2025",
      title: "ICS Security Summit & Training 2025",
      date: "2025-06-15",
      endDate: "2025-06-23",
      location: "Lake Buena Vista, FL, US and Virtual (ET)",
      url: "https://www.sans.org/cyber-security-training-events/ics-security-summit-2025/",
      description: "9 Courses, 1 Cyber Range",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "ICS", "Summit", "Virtual"]
    },
    {
      id: "sans-amsterdam-june-2025",
      title: "SANS Amsterdam June 2025",
      date: "2025-06-16",
      endDate: "2025-06-21",
      location: "Amsterdam, NL and Virtual (CEST)",
      url: "https://www.sans.org/cyber-security-training-events/amsterdam-june-2025/",
      description: "8 Courses, 1 Cyber Range",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Amsterdam", "Virtual"]
    },
    {
      id: "sans-cyber-defence-japan-2025",
      title: "SANS Cyber Defence Japan 2025",
      date: "2025-06-16",
      endDate: "2025-06-28",
      location: "Tokyo, JP and Virtual (JST)",
      url: "https://www.sans.org/cyber-security-training-events/cyber-defence-japan-2025/",
      description: "9 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Tokyo", "Japan", "Virtual"]
    },
    {
      id: "sans-paris-june-2025",
      title: "SANS Paris June 2025",
      date: "2025-06-23",
      endDate: "2025-06-28",
      location: "Paris, FR",
      url: "https://www.sans.org/cyber-security-training-events/paris-june-2025/",
      description: "7 Courses, 1 Cyber Range",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Paris"]
    },
    {
      id: "sans-cyber-defence-canberra-2025",
      title: "SANS Cyber Defence Canberra 2025",
      date: "2025-06-23",
      endDate: "2025-07-05",
      location: "Canberra, ACT, AU and Virtual (AEST)",
      url: "https://www.sans.org/cyber-security-training-events/cyber-defence-australia-2025/",
      description: "8 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Canberra", "Virtual"]
    },
    {
      id: "sans-rocky-mountain-2025",
      title: "SANS Rocky Mountain 2025",
      date: "2025-06-23",
      endDate: "2025-06-28",
      location: "Denver, CO, US and Virtual (MT)",
      url: "https://www.sans.org/cyber-security-training-events/rocky-mountain-2025/",
      description: "15 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Denver", "Virtual", "Rocky Mountain"]
    },
    {
      id: "sans-riyadh-june-2025",
      title: "SANS Riyadh June 2025",
      date: "2025-06-28",
      endDate: "2025-07-03",
      location: "Riyadh, SA and Virtual (AST)",
      url: "https://www.sans.org/cyber-security-training-events/riyadh-june-2025/",
      description: "2 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Riyadh", "Virtual"]
    },
    {
      id: "sans-munich-june-2025",
      title: "SANS Munich June 2025",
      date: "2025-06-30",
      endDate: "2025-07-05",
      location: "Munich, DE",
      url: "https://www.sans.org/cyber-security-training-events/munich-june-2025/",
      description: "7 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Munich"]
    },
    {
      id: "sans-cloud-singapore-june-2025",
      title: "SANS Cloud Singapore June 2025",
      date: "2025-06-30",
      endDate: "2025-07-05",
      location: "Singapore, SG and Virtual (SGT)",
      url: "https://www.sans.org/cyber-security-training-events/cloud-singapore-june-2025/",
      description: "10 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Singapore", "Cloud", "Virtual"]
    },
    {
      id: "sans-human-risk-london-july-2025",
      title: "SANS Human Risk London July 2025",
      date: "2025-07-07",
      endDate: "2025-07-09",
      location: "London, GB",
      url: "https://www.sans.org/cyber-security-training-events/human-risk-london-july-2025/",
      description: "1 Course",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "London", "Human Risk"]
    },
    {
      id: "sans-london-july-2025",
      title: "SANS London July 2025",
      date: "2025-07-07",
      endDate: "2025-07-12",
      location: "London, GB and Virtual (BST)",
      url: "https://www.sans.org/cyber-security-training-events/london-july-2025/",
      description: "10 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "London", "Virtual"]
    },
    {
      id: "sans-riyadh-july-2025",
      title: "SANS Riyadh July 2025",
      date: "2025-07-12",
      endDate: "2025-07-17",
      location: "Riyadh, SA and Virtual (AST)",
      url: "https://www.sans.org/cyber-security-training-events/riyadh-july-2025/",
      description: "4 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Riyadh", "Virtual"]
    },
    {
      id: "sansfire-2025",
      title: "SANSFIRE 2025",
      date: "2025-07-14",
      endDate: "2025-07-19",
      location: "Washington, DC, US and Virtual (ET)",
      url: "https://www.sans.org/cyber-security-training-events/sansfire-2025/",
      description: "50 Courses, 2 Cyber Ranges",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Washington DC", "Virtual", "FIRE"]
    },
    {
      id: "sans-amsterdam-july-2025",
      title: "SANS Amsterdam July 2025",
      date: "2025-07-14",
      endDate: "2025-07-19",
      location: "Amsterdam, NL and Virtual (CEST)",
      url: "https://www.sans.org/cyber-security-training-events/amsterdam-july-2025/",
      description: "8 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Amsterdam", "Virtual"]
    },
    {
      id: "sans-pen-test-hackfest-europe-2025-amsterdam",
      title: "SANS Pen Test Hackfest Europe 2025 – Amsterdam",
      date: "2025-07-21",
      endDate: "2025-07-26",
      location: "Amsterdam, NL and Virtual (CEST)",
      url: "https://www.sans.org/cyber-security-training-events/pen-test-hackfest-europe-2025/",
      description: "8 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Pen Test", "Amsterdam", "Virtual"]
    },
    {
      id: "sans-anaheim-2025",
      title: "SANS Anaheim 2025",
      date: "2025-07-21",
      endDate: "2025-07-26",
      location: "Anaheim, CA, US and Virtual (PT)",
      url: "https://www.sans.org/cyber-security-training-events/anaheim-2025/",
      description: "8 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Anaheim", "Virtual"]
    },
    {
      id: "dfir-summit-training-2025",
      title: "DFIR Summit & Training 2025",
      date: "2025-07-24",
      endDate: "2025-07-31",
      location: "Salt Lake City, UT, US and Virtual (MT)",
      url: "https://www.sans.org/cyber-security-training-events/digital-forensics-summit-2025/",
      description: "14 Courses, 1 Cyber Range",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "DFIR", "Summit", "Virtual"]
    },
    {
      id: "sans-huntsville-2025",
      title: "SANS Huntsville 2025",
      date: "2025-07-28",
      endDate: "2025-08-02",
      location: "Huntsville, AL, US and Virtual (ET)",
      url: "https://www.sans.org/cyber-security-training-events/huntsville-2025/",
      description: "6 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Huntsville", "Virtual"]
    },
    {
      id: "sans-human-risk-europe-online-july-2025",
      title: "SANS Human Risk Europe Online July 2025",
      date: "2025-07-28",
      endDate: "2025-07-30",
      location: "Virtual (British Summer Time, NL)",
      url: "https://www.sans.org/cyber-security-training-events/human-risk-europe-online-july-2025/",
      description: "1 Course",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Human Risk", "Europe", "Online"]
    },
    {
      id: "sans-live-online-europe-july-2025",
      title: "SANS Live Online Europe July 2025",
      date: "2025-07-28",
      endDate: "2025-08-02",
      location: "Virtual (British Summer Time, NL)",
      url: "https://www.sans.org/cyber-security-training-events/live-online-europe-july-2025/",
      description: "9 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Live Online", "Europe", "Virtual"]
    },
    {
      id: "sans-san-antonio-2025",
      title: "SANS San Antonio 2025",
      date: "2025-08-04",
      endDate: "2025-08-09",
      location: "San Antonio, TX, US and Virtual (CT)",
      url: "https://www.sans.org/cyber-security-training-events/san-antonio-2025/",
      description: "15 Courses, 1 Cyber Range",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "San Antonio", "Virtual"]
    },
    {
      id: "sans-london-august-2025",
      title: "SANS London August 2025",
      date: "2025-08-04",
      endDate: "2025-08-09",
      location: "London, GB and Virtual (BST)",
      url: "https://www.sans.org/cyber-security-training-events/london-august-2025/",
      description: "7 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "London", "Virtual"]
    },
    {
      id: "sans-security-awareness-summit-training-2025",
      title: "SANS Security Awareness Summit & Training 2025",
      date: "2025-08-11",
      endDate: "2025-08-15",
      location: "Chicago, IL, US and Virtual (CT)",
      url: "https://www.sans.org/cyber-security-training-events/security-awareness-summit-2025/",
      description: "2 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Chicago", "Security Awareness", "Virtual"]
    },
    {
      id: "sans-chicago-2025",
      title: "SANS Chicago 2025",
      date: "2025-08-11",
      endDate: "2025-08-16",
      location: "Chicago, IL, US and Virtual (CT)",
      url: "https://www.sans.org/cyber-security-training-events/chicago-2025/",
      description: "8 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Chicago", "Virtual"]
    },
    {
      id: "sans-boston-2025",
      title: "SANS Boston 2025",
      date: "2025-08-11",
      endDate: "2025-08-16",
      location: "Boston, MA, US and Virtual (ET)",
      url: "https://www.sans.org/cyber-security-training-events/boston-2025/",
      description: "11 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Boston", "Virtual"]
    },
    {
      id: "sans-cyber-defence-singapore-2025",
      title: "SANS Cyber Defence Singapore 2025",
      date: "2025-08-18",
      endDate: "2025-08-30",
      location: "Singapore, SG and Virtual (SGT)",
      url: "https://www.sans.org/cyber-security-training-events/sans-cyber-defence-singapore-2025/",
      description: "7 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Singapore", "Cyber Defence", "Virtual"]
    },
    {
      id: "sans-amsterdam-august-2025",
      title: "SANS Amsterdam August 2025",
      date: "2025-08-18",
      endDate: "2025-08-23",
      location: "Amsterdam, NL and Virtual (CEST)",
      url: "https://www.sans.org/cyber-security-training-events/amsterdam-august-2025/",
      description: "8 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Amsterdam", "Virtual"]
    },
    {
      id: "sans-virginia-beach-2025",
      title: "SANS Virginia Beach 2025",
      date: "2025-08-18",
      endDate: "2025-08-23",
      location: "Virginia Beach, VA, US and Virtual (ET)",
      url: "https://www.sans.org/cyber-security-training-events/virginia-beach-2025/",
      description: "12 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Virginia Beach", "Virtual"]
    },
    {
      id: "sans-melbourne-2025",
      title: "SANS Melbourne 2025",
      date: "2025-08-18",
      endDate: "2025-08-23",
      location: "Melbourne, VIC, AU and Virtual (AEST)",
      url: "https://www.sans.org/cyber-security-training-events/melbourne-2025/",
      description: "4 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Melbourne", "Virtual"]
    },
    {
      id: "sans-august-south-asia-2025",
      title: "SANS August South Asia 2025",
      date: "2025-08-18",
      endDate: "2025-08-23",
      location: "Virtual (India Standard Time, IN)",
      url: "https://www.sans.org/cyber-security-training-events/august-south-asia-2025/",
      description: "3 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "South Asia", "Virtual"]
    },
    {
      id: "sans-riyadh-cyber-leaders-2025",
      title: "SANS Riyadh Cyber Leaders 2025",
      date: "2025-08-24",
      endDate: "2025-08-28",
      location: "Riyadh, SA and Virtual (AST)",
      url: "https://www.sans.org/cyber-security-training-events/riyadh-cyber-leaders-2025/",
      description: "3 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Riyadh", "Cyber Leaders", "Virtual"]
    },
    {
      id: "sans-copenhagen-august-2025",
      title: "SANS Copenhagen August 2025",
      date: "2025-08-25",
      endDate: "2025-08-30",
      location: "Copenhagen, DK",
      url: "https://www.sans.org/cyber-security-training-events/copenhagen-august-2025/",
      description: "5 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Copenhagen"]
    },
    {
      id: "sans-emerging-threats-leadership-response-2025",
      title: "SANS Emerging Threats: Leadership Response 2025",
      date: "2025-08-25",
      endDate: "2025-08-29",
      location: "Virginia Beach, VA, US and Virtual (ET)",
      url: "https://www.sans.org/cyber-security-training-events/leadership-response-2025/",
      description: "10 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Emerging Threats", "Leadership", "Virtual"]
    },
    {
      id: "sans-brussels-september-2025",
      title: "SANS Brussels September 2025",
      date: "2025-09-01",
      endDate: "2025-09-06",
      location: "Brussels, BE",
      url: "https://www.sans.org/cyber-security-training-events/brussels-september-2025/",
      description: "4 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Brussels"]
    },
    {
      id: "sans-tallinn-september-2025",
      title: "SANS Tallinn September 2025",
      date: "2025-09-08",
      endDate: "2025-09-13",
      location: "Tallinn, EE",
      url: "https://www.sans.org/cyber-security-training-events/tallinn-september-2025/",
      description: "3 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Tallinn"]
    },
    {
      id: "sans-stay-sharp-sept-2025",
      title: "SANS Stay Sharp: Sept 2025",
      date: "2025-09-08",
      endDate: "2025-09-10",
      location: "Virtual (US Eastern)",
      url: "https://www.sans.org/cyber-security-training-events/stay-sharp-sept-2025/",
      description: "7 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Stay Sharp", "Virtual"]
    },
    {
      id: "sans-philippines-for508-2025",
      title: "SANS Philippines FOR508",
      date: "2025-09-08",
      endDate: "2025-09-13",
      location: "Manila, PH",
      url: "https://www.sans.org/cyber-security-training-events/philippines-for508-2025/",
      description: "1 Course",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Philippines", "FOR508"]
    },
    {
      id: "sans-london-september-2025",
      title: "SANS London September 2025",
      date: "2025-09-08",
      endDate: "2025-09-13",
      location: "London, GB and Virtual (BST)",
      url: "https://www.sans.org/cyber-security-training-events/london-september-2025/",
      description: "8 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "London", "Virtual"]
    },
    {
      id: "sans-manama-september-2025",
      title: "SANS Manama September 2025",
      date: "2025-09-13",
      endDate: "2025-09-25",
      location: "Manama, BH and Virtual (AST)",
      url: "https://www.sans.org/cyber-security-training-events/manama-september-2025/",
      description: "5 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Manama", "Virtual"]
    },
    {
      id: "sans-doha-september-2025",
      title: "SANS Doha September 2025",
      date: "2025-09-13",
      endDate: "2025-09-18",
      location: "Doha, QA and Virtual (AST)",
      url: "https://www.sans.org/cyber-security-training-events/doha-september-2025/",
      description: "3 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Doha", "Virtual"]
    },
    {
      id: "sans-amsterdam-september-2025",
      title: "SANS Amsterdam September 2025",
      date: "2025-09-15",
      endDate: "2025-09-20",
      location: "Amsterdam, NL and Virtual (CEST)",
      url: "https://www.sans.org/cyber-security-training-events/amsterdam-september-2025/",
      description: "6 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Amsterdam", "Virtual"]
    },
    {
      id: "sans-malaga-september-2025",
      title: "SANS Malaga September 2025",
      date: "2025-09-15",
      endDate: "2025-09-20",
      location: "Malaga, ES",
      url: "https://www.sans.org/cyber-security-training-events/malaga-september-2025/",
      description: "4 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Malaga"]
    },
    {
      id: "sans-human-risk-amsterdam-september-2025",
      title: "SANS Human Risk Amsterdam September 2025",
      date: "2025-09-15",
      endDate: "2025-09-17",
      location: "Amsterdam, NL",
      url: "https://www.sans.org/cyber-security-training-events/human-risk-amsterdam-september-2025/",
      description: "1 Course",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Amsterdam", "Human Risk"]
    },
    {
      id: "sans-network-security-2025",
      title: "SANS Network Security 2025",
      date: "2025-09-22",
      endDate: "2025-09-27",
      location: "Las Vegas, NV, US and Virtual (PT)",
      url: "https://www.sans.org/cyber-security-training-events/network-security-2025/",
      description: "53 Courses, 2 Cyber Ranges",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Network Security", "Las Vegas", "Virtual"]
    },
    {
      id: "sans-rome-september-2025",
      title: "SANS Rome September 2025",
      date: "2025-09-22",
      endDate: "2025-09-27",
      location: "Rome, IT",
      url: "https://www.sans.org/cyber-security-training-events/rome-september-2025/",
      description: "6 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Rome"]
    },
    {
      id: "sans-paris-opera-september-2025",
      title: "SANS Paris Opera September 2025",
      date: "2025-09-22",
      endDate: "2025-09-27",
      location: "Paris, FR",
      url: "https://www.sans.org/cyber-security-training-events/paris-opera-september-2025/",
      description: "5 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Paris", "Opera"]
    },
    {
      id: "sans-istanbul-september-2025",
      title: "SANS Istanbul September 2025",
      date: "2025-09-22",
      endDate: "2025-09-27",
      location: "Istanbul, TR and Virtual (EEST)",
      url: "https://www.sans.org/cyber-security-training-events/istanbul-september-2025/",
      description: "2 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Istanbul", "Virtual"]
    },
    {
      id: "sans-dfir-europe-prague-2025",
      title: "SANS DFIR Europe Prague 2025",
      date: "2025-09-28",
      endDate: "2025-10-04",
      location: "Prague, CZ and Virtual (CET)",
      url: "https://www.sans.org/cyber-security-training-events/dfir-europe-prague-2025/",
      description: "7 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "DFIR", "Prague", "Virtual"]
    },
    {
      id: "sans-dc-metro-fall-2025",
      title: "SANS DC Metro Fall 2025",
      date: "2025-09-29",
      endDate: "2025-10-04",
      location: "Rockville, MD, US and Virtual (ET)",
      url: "https://www.sans.org/cyber-security-training-events/dc-metro-fall-2025/",
      description: "10 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "DC Metro", "Rockville", "Virtual"]
    },
    {
      id: "sans-paris-republique-september-2025",
      title: "SANS Paris Republique September 2025",
      date: "2025-09-29",
      endDate: "2025-10-04",
      location: "Paris, FR",
      url: "https://www.sans.org/cyber-security-training-events/paris-republique-september-2025/",
      description: "7 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Paris", "Republique"]
    },
    {
      id: "sans-cloudsecnext-summit-2025",
      title: "SANS CloudSecNext Summit & Training 2025",
      date: "2025-10-02",
      endDate: "2025-10-09",
      location: "Denver, CO, US and Virtual (MT)",
      url: "https://www.sans.org/cyber-security-training-events/cloudsecnext-summit-2025/",
      description: "10 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "CloudSecNext", "Denver", "Virtual"]
    },
    {
      id: "sans-cyber-safari-2025",
      title: "SANS Cyber Safari 2025",
      date: "2025-10-04",
      endDate: "2025-10-23",
      location: "Riyadh, SA and Virtual (AST)",
      url: "https://www.sans.org/cyber-security-training-events/cyber-safari-2025/",
      description: "10 Courses, 2 Cyber Ranges",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Cyber Safari", "Riyadh", "Virtual"]
    },
    {
      id: "sans-singapore-october-2025",
      title: "SANS Singapore October 2025",
      date: "2025-10-06",
      endDate: "2025-10-11",
      location: "Singapore, SG and Virtual (SGT)",
      url: "https://www.sans.org/cyber-security-training-events/october-singapore-2025/",
      description: "11 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "Singapore", "Virtual"]
    },
    {
      id: "sans-london-october-2025",
      title: "SANS London October 2025",
      date: "2025-10-06",
      endDate: "2025-10-11",
      location: "London, GB and Virtual (BST)",
      url: "https://www.sans.org/cyber-security-training-events/london-october-2025/",
      description: "10 Courses",
      type: "training",
      isPremium: false,
      tags: ["SANS", "Training", "London", "Virtual"]
    }
  ];
}
