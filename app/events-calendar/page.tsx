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
  const [showFilters, setShowFilters] = useState(false);
  const [featuredEvent, setFeaturedEvent] = useState<EventItem | null>(null);

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

    // Filter by month and year for calendar view
    if (viewMode === "calendar") {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getMonth() === selectedMonth && eventDate.getFullYear() === selectedYear;
      });
    }

    setFilteredEvents(filtered);
  }, [events, searchQuery, selectedTypes, selectedMonth, selectedYear, viewMode]);

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
                </div>
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center bg-gray-900/80 px-4 py-2 rounded-lg border border-gray-800 text-gray-300 hover:border-[#00FF00] hover:text-[#00FF00] transition-all"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters {selectedTypes.length > 0 && `(${selectedTypes.length})`}
                </button>
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
                    <div className="p-4 bg-gray-900/50 border border-gray-800 rounded-lg">
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
function getMockEventsData(): EventItem[] {
  return [
    {
      id: "sans-cyber-2025",
      title: "SANS 2025",
      date: "2025-04-13",
      endDate: "2025-04-18",
      location: "Orlando, FL",
      url: "https://www.sans.org/event",
      description: "Join SANS for their premier cybersecurity training event featuring over 40 courses across all skill levels and disciplines. Learn from the best instructors in the industry and build practical skills to advance your career.",
      type: "conference",
      isPremium: true,
      tags: ["training", "networking", "certification", "workshops"]
    },
    {
      id: "sans-security-west",
      title: "SANS Security West",
      date: "2025-05-05",
      endDate: "2025-05-10",
      location: "San Diego, CA",
      url: "https://www.sans.org/security-west",
      description: "Attend SANS Security West for hands-on training and networking opportunities with industry leaders. This event features multiple tracks covering offensive operations, defensive strategies, and cloud security.",
      type: "training",
      isPremium: false,
      tags: ["training", "certification", "west coast", "cloud security"]
    },
    {
      id: "sans-amsterdam",
      title: "SANS Amsterdam",
      date: "2025-05-12",
      endDate: "2025-05-24",
      location: "Amsterdam, Netherlands",
      url: "https://www.sans.org/amsterdam",
      description: "SANS returns to Amsterdam for comprehensive cybersecurity training in Europe. This two-week event offers in-depth courses on security essentials, penetration testing, and digital forensics.",
      type: "training",
      isPremium: false,
      tags: ["europe", "certification", "forensics", "penetration testing"]
    },
    {
      id: "new2cyber-summit",
      title: "SANS New2Cyber Summit",
      date: "2025-03-13",
      location: "Online",
      url: "https://www.sans.org/cyber-summit",
      description: "Free live online summit for those new to cybersecurity. Learn from top experts as they share critical skills and knowledge to jump start your path to success in cybersecurity.",
      type: "webinar",
      isPremium: false,
      tags: ["beginners", "career development", "free", "online"]
    },
    {
      id: "sans-cyber-defense-miami",
      title: "SANS Cyber Defense Miami",
      date: "2025-06-09",
      endDate: "2025-06-14",
      location: "Miami, FL",
      url: "https://www.sans.org/cyber-defense-miami",
      description: "Focus on defensive cybersecurity skills and strategies at SANS Cyber Defense Miami. This specialized event offers courses on security operations, incident handling, and building defensible networks.",
      type: "training",
      isPremium: false,
      tags: ["defense", "blue team", "incident response", "certification"]
    },
    {
      id: "sans-rocky-mountain",
      title: "SANS Rocky Mountain",
      date: "2025-06-23",
      endDate: "2025-06-28",
      location: "Denver, CO",
      url: "https://www.sans.org/rocky-mountain",
      description: "Experience SANS training in the Rocky Mountains with courses ranging from security essentials to advanced penetration testing and secure DevOps practices.",
      type: "training",
      isPremium: false,
      tags: ["devops", "cloud security", "mountain region", "certification"]
    },
    {
      id: "sansfire-2025",
      title: "SANSFIRE 2025",
      date: "2025-07-14",
      endDate: "2025-07-19",
      location: "Washington, D.C.",
      url: "https://www.sans.org/sansfire",
      description: "SANSFIRE is one of SANS' largest training events, featuring over 50 courses across all cybersecurity domains. This flagship event brings together practitioners, instructors, and vendors for a week of intensive learning and networking.",
      type: "conference",
      isPremium: true,
      tags: ["flagship event", "all levels", "government", "networking"]
    },
    {
      id: "sans-aws-workshop",
      title: "SANS AWS Security Workshop",
      date: "2025-04-05",
      location: "Online",
      url: "https://www.sans.org/aws-workshop",
      description: "Learn to build and secure AWS environments in this hands-on workshop. Participants will gain practical skills for protecting cloud infrastructure and implementing security best practices.",
      type: "workshop",
      isPremium: false,
      tags: ["cloud", "aws", "hands-on", "practical"]
    },
    {
      id: "sans-security-leadership",
      title: "SANS Security Leadership Summit",
      date: "2025-05-19",
      endDate: "2025-05-23",
      location: "Nashville, TN",
      url: "https://www.sans.org/leadership-summit",
      description: "Designed for CISOs and security leaders, this summit addresses strategic challenges in cybersecurity leadership. Sessions cover risk management, team building, and communicating security value to executives.",
      type: "conference",
      isPremium: false,
      tags: ["leadership", "executive", "strategic", "management"]
    },
    {
      id: "sans-offensive-ops",
      title: "SANS Offensive Operations East",
      date: "2025-06-09",
      endDate: "2025-06-14",
      location: "Boston, MA",
      url: "https://www.sans.org/offensive-ops",
      description: "Focus on offensive security techniques and red team operations. This specialized event offers advanced courses on penetration testing, exploit development, and adversary emulation.",
      type: "training",
      isPremium: false,
      tags: ["red team", "offensive security", "penetration testing", "advanced"]
    },
    {
      id: "sans-ai-cybersecurity",
      title: "SANS AI Cybersecurity Summit",
      date: "2025-03-31",
      endDate: "2025-04-01",
      location: "Denver, CO",
      url: "https://www.sans.org/ai-summit",
      description: "Learn to leverage AI in your cybersecurity operations with this specialized summit. Sessions cover AI threat detection, machine learning for security, and defending against AI-powered attacks.",
      type: "webinar",
      isPremium: true,
      tags: ["artificial intelligence", "machine learning", "emerging tech"]
    }
  ];
}
