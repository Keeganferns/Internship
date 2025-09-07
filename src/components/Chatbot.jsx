import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaTimes, FaPaperPlane, FaUser, FaCalendarAlt, FaPhone, FaQuestionCircle, FaHome, FaStar } from 'react-icons/fa';
import { db, auth } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [chatbotResponses, setChatbotResponses] = useState({});
  const [userBookings, setUserBookings] = useState([]);
  const messagesEndRef = useRef(null);

  // Initialize user and welcome message
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      const welcomeMessage = {
        id: 1,
        text: currentUser 
          ? `Hello ${currentUser.displayName || 'there'}! 👋 I'm your GovStay assistant. How can I help you today?`
          : "Welcome to GovStay! 🏨 I'm your booking assistant. How can I help you today?",
        isBot: true,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    });
    return () => unsubscribe();
  }, []);

  // Fetch user bookings if logged in
  useEffect(() => {
    if (user) {
      const fetchUserBookings = async () => {
        try {
          const q = query(collection(db, 'bookings'), where('userId', '==', user.uid));
          const snapshot = await getDocs(q);
          const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setUserBookings(bookings);
        } catch (error) {
          console.error('Error fetching user bookings:', error);
        }
      };
      fetchUserBookings();
    }
  }, [user]);

  // Fetch chatbot responses from Firestore
  useEffect(() => {
    const fetchChatbotResponses = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'chatbot_responses'));
        const responses = {};
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          responses[data.intent] = data.responses;
        });
        setChatbotResponses(responses);
      } catch (error) {
        console.error('Error fetching chatbot responses:', error);
      }
    };
    fetchChatbotResponses();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const defaultResponses = {
    greeting: [
      "Hello! Welcome to GovStay. I'm here to help you with your booking needs. 🏨",
      "Hi there! How can I assist you with your hotel reservation today? ✨",
      "Welcome! I'm your booking assistant. What would you like to know? 😊"
    ],
    booking: [
      "To make a booking:\n1️⃣ Select check-in/check-out dates\n2️⃣ Choose your preferred floor\n3️⃣ Pick an available room (green)\n4️⃣ Complete your details\n\nNeed help with any step? 🤝",
      "You can book by navigating to the hotel page, selecting dates, and choosing from available rooms (shown in green). Want me to guide you? 📅",
      "Booking is easy! Select dates → Choose room → Enter details → Confirm. Available rooms show in green, occupied in red. 🟢🔴"
    ],
    rooms: [
      "🏠 **Our Rooms:**\n• Floor 1 & 2 available\n• Standard rooms: ₹1000/night\n• Dormitories: ₹2000/night\n• All with modern amenities\n\nWhich type interests you?",
      "We have various room options with real-time availability. Green = available, red = occupied, blue = selected. Room prices range ₹1000-₹2000. 💰",
      "Each floor offers multiple room choices with competitive pricing. All rooms include essential amenities for comfortable stays. 🛏️"
    ],
    pricing: [
      "💰 **Pricing Info:**\n• Rooms from ₹1000/night\n• +18% GST included\n• Total shown before booking\n• No hidden charges\n\nWant to see current rates?",
      "All prices are per night with 18% GST added automatically. You'll see the complete breakdown before confirming your booking. Transparent pricing! 📊",
      "Room rates vary by type and dates. Final amount includes GST. Check the booking receipt for detailed cost breakdown. 🧾"
    ],
    availability: [
      "🟢 **Real-time Availability:**\n• Green = Available\n• Red = Occupied\n• Updates automatically\n\nSelect your dates to check! 📅",
      "Availability updates instantly when you select dates. No manual refresh needed! The system shows live room status. ⚡",
      "Check availability by picking your check-in/out dates. The system automatically displays which rooms are free for your stay. 🗓️"
    ],
    mybookings: [
      user && userBookings.length > 0 
        ? `📋 **Your Bookings (${userBookings.length}):**\n${userBookings.slice(0, 3).map((b, i) => `${i+1}. Room ${b.selectedRooms?.[0]} - ${new Date(b.checkIn).toLocaleDateString()}`).join('\n')}\n\nView all in 'My Bookings' section!`
        : user 
          ? "You don't have any bookings yet. Ready to make your first reservation? 🎉"
          : "Please log in to view your bookings. I can help you with the booking process! 🔐",
      "Visit 'My Bookings' to manage your reservations, view details, or contact support for changes. 📱",
      "Your booking history and current reservations are available in the My Bookings section. Need help finding it? 🔍"
    ],
    cancellation: [
      "🔄 **Cancellation & Changes:**\n• Visit 'My Bookings' section\n• Contact admin for assistance\n• Email: admin@govstay.goa.gov.in\n\nNeed immediate help?",
      "For booking modifications, check 'My Bookings' or contact our admin team. We're here to help with any changes! 📞",
      "Booking changes handled through your dashboard or admin support. Quick and hassle-free process! ⚡"
    ],
    amenities: [
      "🏨 **Room Amenities:**\n• Clean bedding & linens\n• Attached bathrooms\n• 24/7 security\n• Government standard facilities\n\nPerfect for official visits! 🛡️",
      "All accommodations meet government standards with essential facilities for comfortable stays. Designed for officials and visitors. 🏛️",
      "Our facilities ensure comfortable stays with all necessary amenities. Clean, secure, and well-maintained properties. ✨"
    ],
    contact: [
      "📞 **Contact Support:**\n• Email: admin@govstay.goa.gov.in\n• Available 24/7\n• Quick response guaranteed\n\nHow else can I help?",
      "Need human assistance? Contact our admin team for personalized support with your booking needs. 👥",
      "For urgent queries or special requests, reach out to hotel management or admin support directly. 🚨"
    ],
    default: [
      "I'm here to help! Ask me about:\n🏨 Room availability\n💰 Pricing info\n📅 Booking process\n🛏️ Amenities\n📋 Your bookings\n\nWhat interests you?",
      "I can assist with rooms, bookings, prices, and availability. What would you like to explore? 🤔",
      "Ready to help with reservations, room info, pricing, or any booking questions! What's on your mind? 💭"
    ]
  };

  const getRandomResponse = (category) => {
    // Try Firestore responses first, then fall back to default
    const firestoreResponses = chatbotResponses[category];
    const responses = firestoreResponses || defaultResponses[category] || defaultResponses.default;
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const quickReplies = [
    { text: "Check Availability", icon: FaCalendarAlt, intent: "availability" },
    { text: "Room Prices", icon: FaStar, intent: "pricing" },
    { text: "My Bookings", icon: FaHome, intent: "mybookings" },
    { text: "Contact Support", icon: FaPhone, intent: "contact" }
  ];

  const generateBotResponse = (userMessage, intent = null) => {
    if (intent) {
      return getRandomResponse(intent);
    }

    const message = userMessage.toLowerCase().trim();
    console.log('Processing user message:', message);
    
    // More comprehensive pattern matching with specific responses
    if (message.match(/\b(hello|hi|hey|good morning|good evening|greetings|namaste)\b/)) {
      const greetings = [
        `Hello! 👋 Welcome to GovStay. I'm here to help you with your booking needs.`,
        `Hi there! ✨ How can I assist you with your hotel reservation today?`,
        `Welcome to GovStay! 🏨 I'm your booking assistant. What would you like to know?`
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    } 
    
    else if (message.match(/\b(book|booking|reservation|reserve|make.*booking|how.*book)\b/)) {
      return `🏨 **How to Book a Room:**\n\n1️⃣ Select your check-in and check-out dates\n2️⃣ Choose Floor 1 or Floor 2\n3️⃣ Pick an available room (shown in green)\n4️⃣ Fill in your details and confirm\n\n✅ Available rooms are green, occupied rooms are red!\n\nNeed help with any specific step?`;
    }
    
    else if (message.match(/\b(my booking|my reservation|my bookings|booking history|view.*booking)\b/)) {
      if (!user) {
        return `🔐 Please log in to view your bookings!\n\nOnce logged in, you can:\n• View all your reservations\n• Check booking details\n• Contact support for changes\n\nWould you like help with the login process?`;
      } else if (userBookings.length === 0) {
        return `📋 You don't have any bookings yet, ${user.displayName || 'there'}!\n\n🎉 Ready to make your first reservation?\n\nI can guide you through:\n• Selecting dates\n• Choosing rooms\n• Completing your booking\n\nShall we start?`;
      } else {
        return `📋 **Your Bookings (${userBookings.length}):**\n\n${userBookings.slice(0, 3).map((b, i) => `${i+1}. Room ${b.selectedRooms?.[0]} - ${new Date(b.checkIn).toLocaleDateString()}`).join('\n')}\n\n${userBookings.length > 3 ? '...and more!\n\n' : ''}Visit 'My Bookings' section for full details!`;
      }
    }
    
    else if (message.match(/\b(room|rooms|floor|accommodation|what.*rooms)\b/)) {
      return `🏠 **Our Room Options:**\n\n**Floor 1 & Floor 2:**\n• Standard Rooms: ₹1,000/night\n• Dormitories: ₹2,000/night\n• All rooms with modern amenities\n\n🟢 Green = Available\n🔴 Red = Occupied\n🔵 Blue = Selected\n\nWhich floor would you prefer?`;
    }
    
    else if (message.match(/\b(price|cost|rate|pricing|charges|gst|payment|fee|how much)\b/)) {
      return `💰 **Pricing Details:**\n\n🏠 **Room Rates:**\n• Standard Rooms: ₹1,000/night\n• Dormitories: ₹2,000/night\n\n📊 **Additional Charges:**\n• GST: 18% (automatically added)\n• No hidden fees!\n\n💳 **Total Cost Example:**\nRoom (₹1,000) + GST (₹180) = ₹1,180/night\n\nWant to check availability for specific dates?`;
    }
    
    else if (message.match(/\b(available|availability|free|vacant|check.*availability|when.*available)\b/)) {
      return `🟢 **Room Availability:**\n\n✅ **Real-time Updates:**\n• Green rooms = Available\n• Red rooms = Occupied\n• Updates automatically\n\n📅 **To Check Availability:**\n1. Select your check-in date\n2. Select your check-out date\n3. View live room status\n\nWhich dates are you planning to visit?`;
    }
    
    else if (message.match(/\b(cancel|modify|change|update|edit.*booking|refund)\b/)) {
      return `🔄 **Booking Changes & Cancellations:**\n\n📱 **Self-Service:**\n• Visit 'My Bookings' section\n• View your reservations\n\n📞 **Need Help?**\n• Contact: admin@govstay.goa.gov.in\n• Available 24/7\n• Quick response guaranteed\n\nWhat type of change do you need?`;
    }
    
    else if (message.match(/\b(amenities|facilities|services|features|what.*included)\b/)) {
      return `🏨 **Room Amenities & Facilities:**\n\n🛏️ **In Every Room:**\n• Clean bedding & fresh linens\n• Attached private bathrooms\n• Basic furniture & storage\n\n🛡️ **Property Features:**\n• 24/7 security\n• Government standard facilities\n• Safe & clean environment\n\n🏛️ Perfect for official visits and government staff!\n\nAny specific amenity questions?`;
    }
    
    else if (message.match(/\b(contact|support|help|admin|phone|email|call|reach)\b/)) {
      return `📞 **Contact & Support:**\n\n✉️ **Admin Email:**\nadmin@govstay.goa.gov.in\n\n⏰ **Availability:**\n• 24/7 support\n• Quick response time\n• Dedicated assistance\n\n🆘 **For Urgent Issues:**\n• Booking problems\n• Payment queries\n• Special requests\n\nHow else can I assist you?`;
    }
    
    else if (message.match(/\b(location|address|where|directions|how.*reach)\b/)) {
      return `📍 **Our Locations:**\n\n🏨 **Government Accommodations:**\n• Goa Niwas\n• Goa Sadan  \n• Goa Bhavan\n\n📍 All located in Goa for government officials and visitors.\n\n🗺️ Exact addresses and directions available on each hotel's detail page.\n\nWhich property are you interested in?`;
    }
    
    else if (message.match(/\b(thank|thanks|appreciate|grateful)\b/)) {
      return `😊 You're very welcome!\n\nI'm always here to help with your GovStay booking needs. Feel free to ask me anything about:\n\n🏨 Room bookings\n💰 Pricing\n📅 Availability\n🛏️ Amenities\n\nHave a wonderful stay! 🌟`;
    }
    
    else {
      const helpfulResponses = [
        `I'm here to help with your GovStay booking needs! 🏨\n\n**I can assist with:**\n🟢 Room availability\n💰 Pricing information\n📅 Booking process\n🛏️ Amenities & facilities\n📋 Your bookings\n📞 Contact support\n\nWhat would you like to know?`,
        `Hi! I can help you with booking rooms at Goa Niwas, Goa Sadan, and Goa Bhavan! 🏛️\n\n**Popular questions:**\n• "How do I book a room?"\n• "What are the prices?"\n• "Check availability"\n• "My bookings"\n\nWhat can I help you with today?`,
        `Welcome! I'm your GovStay booking assistant! 🤖\n\n**Quick help:**\n📅 Select dates to see availability\n🏠 Choose from Floor 1 or 2\n💳 Transparent pricing with GST\n📱 Manage bookings easily\n\nHow can I assist you?`
      ];
      return helpfulResponses[Math.floor(Math.random() * helpfulResponses.length)];
    }
  };

  const handleQuickReply = (intent) => {
    const quickReplyMessage = {
      id: Date.now(),
      text: quickReplies.find(q => q.intent === intent)?.text || 'Quick reply',
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, quickReplyMessage]);
    setShowQuickReplies(false);
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: generateBotResponse('', intent),
        isBot: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 800 + Math.random() * 800);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setShowQuickReplies(false);
    setIsTyping(true);

    // Generate response with better logic
    const response = generateBotResponse(currentInput);
    console.log('Generated response:', response);
    
    // More realistic typing delay
    const typingDelay = Math.min(response.length * 25, 2500) + 800;

    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: response,
        isBot: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, typingDelay);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110 animate-pulse"
          aria-label="Open chat"
        >
          <FaRobot className="text-2xl" />
        </button>
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-ping"></div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[32rem] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <FaRobot className="text-2xl" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h3 className="font-bold text-lg">GovStay AI Assistant</h3>
            <p className="text-xs opacity-90 flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Online • Ready to help
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200 hover:rotate-90"
        >
          <FaTimes className="text-lg" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} animate-in slide-in-from-bottom-2 duration-300`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div
              className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-sm ${
                message.isBot
                  ? 'bg-white text-gray-800 border border-gray-200'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
              }`}
            >
              <div className="flex items-start gap-3">
                {message.isBot && (
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <FaRobot className="text-blue-600 text-sm" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm leading-relaxed whitespace-pre-line">{message.text}</p>
                  <p className={`text-xs mt-2 ${
                    message.isBot ? 'text-gray-500' : 'text-white/70'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Quick Replies */}
        {showQuickReplies && messages.length <= 1 && (
          <div className="space-y-2 animate-in fade-in duration-500">
            <p className="text-xs text-gray-500 text-center">Quick actions:</p>
            <div className="grid grid-cols-2 gap-2">
              {quickReplies.map((reply) => {
                const IconComponent = reply.icon;
                return (
                  <button
                    key={reply.intent}
                    onClick={() => handleQuickReply(reply.intent)}
                    className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 text-sm font-medium text-gray-700 hover:text-blue-600"
                  >
                    <IconComponent className="text-blue-500" />
                    <span>{reply.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        
        {isTyping && (
          <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white border border-gray-200 max-w-[85%] px-4 py-3 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaRobot className="text-blue-600 text-sm" />
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-xs text-gray-500">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-100 bg-white">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about bookings..."
              className="w-full border border-gray-300 rounded-2xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              maxLength={500}
            />
            <div className="absolute right-3 bottom-3 text-xs text-gray-400">
              {inputText.length}/500
            </div>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isTyping}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-2xl p-3 transition-all duration-200 hover:scale-105 disabled:hover:scale-100 shadow-lg"
          >
            <FaPaperPlane className="text-sm" />
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-500 text-center">
          Powered by GovStay AI • {user ? `Welcome ${user.displayName || 'back'}!` : 'Login for personalized help'}
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
