import React, { useState, useEffect, useRef } from 'react';
import { 
  subscribeToMessages, 
  subscribeToUsers, 
  sendChatMessage, 
  isUsernameAvailable, 
  registerUsername, 
  updateUserPresence,
  ChatMessage,
  UserPresence
} from '../lib/firebase';

export default function SigLiveChat() {
  const [username, setUsername] = useState<string | null>(
    localStorage.getItem('siglivechat_username')
  );
  const [usernameInput, setUsernameInput] = useState('');
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const [showDevVerification, setShowDevVerification] = useState(false);
  const [devNameInput, setDevNameInput] = useState('');

  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [allUsers, setAllUsers] = useState<UserPresence[]>([]);
  const [currentTime, setCurrentTime] = useState(Date.now());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Subscribe to real-time messages and users
  useEffect(() => {
    const unsubscribeMsgs = subscribeToMessages((fetched) => {
      setMessages(fetched);
    });

    const unsubscribeUsers = subscribeToUsers((fetched) => {
      setAllUsers(fetched);
    });

    // Update time every 10 seconds for online/offline calculations
    const timeInterval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 10000);

    return () => {
      unsubscribeMsgs();
      unsubscribeUsers();
      clearInterval(timeInterval);
    };
  }, []);

  // Send periodic heartbeat presence when a username is logged in
  useEffect(() => {
    if (!username) return;

    // Send initial presence
    updateUserPresence(username).catch(console.error);

    // Update presence every 30 seconds
    const interval = setInterval(() => {
      updateUserPresence(username).catch(console.error);
    }, 30000);

    return () => clearInterval(interval);
  }, [username]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle register/login username
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = usernameInput.trim();
    if (!cleanName) {
      setUsernameError("Username cannot be empty");
      return;
    }

    if (cleanName.length < 2 || cleanName.length > 20) {
      setUsernameError("Username must be between 2 and 20 characters");
      return;
    }

    // Alphabetic, numeric, and underscores only
    if (!/^[a-zA-Z0-9_]+$/.test(cleanName)) {
      setUsernameError("Username can only contain letters, numbers, and underscores");
      return;
    }

    if (cleanName.toLowerCase() === 'developer2') {
      const isRainbow = localStorage.getItem('siglivechat_is_rainbow') === 'true';
      if (!isRainbow) {
        setShowDevVerification(true);
        setUsernameError(null);
        return;
      }
    }

    setCheckingUsername(true);
    setUsernameError(null);

    try {
      const isAvailable = await isUsernameAvailable(cleanName);
      if (!isAvailable) {
        setUsernameError("Username already taken! Please choose another.");
        setCheckingUsername(false);
        return;
      }

      const success = await registerUsername(cleanName);
      if (success) {
        localStorage.setItem('siglivechat_username', cleanName);
        if (cleanName.toLowerCase() === 'rainbow_sigeon_7726' || cleanName.toLowerCase() === 'rainbow') {
          localStorage.setItem('siglivechat_is_rainbow', 'true');
        }
        setUsername(cleanName);
      } else {
        setUsernameError("Registration failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setUsernameError("Connection error. Is your internet active?");
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleVerifyDev = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDevName = devNameInput.trim().toLowerCase();
    if (cleanDevName === 'rainbow_sigeon_7726') {
      localStorage.setItem('siglivechat_is_rainbow', 'true');
      setShowDevVerification(false);
      setUsernameError(null);
      
      // Automatically register the developer2 username since they are verified
      setCheckingUsername(true);
      const cleanName = usernameInput.trim();
      try {
        const isAvailable = await isUsernameAvailable(cleanName);
        if (!isAvailable) {
          setUsernameError("Username already taken! Please choose another.");
          setCheckingUsername(false);
          return;
        }

        const success = await registerUsername(cleanName);
        if (success) {
          localStorage.setItem('siglivechat_username', cleanName);
          setUsername(cleanName);
        } else {
          setUsernameError("Registration failed. Please try again.");
        }
      } catch (err) {
        console.error(err);
        setUsernameError("Connection error. Is your internet active?");
      } finally {
        setCheckingUsername(false);
      }
    } else {
      setUsernameError("Incorrect developer verification name.");
    }
  };

  // Handle message sending
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = messageText.trim();
    if (!text || !username) return;

    setMessageText('');
    try {
      await sendChatMessage(username, text);
      // Update our presence immediately on sending a message
      await updateUserPresence(username);
    } catch (err) {
      console.error("Failed to send message: ", err);
    }
  };

  // Change username / sign out
  const handleSignOut = () => {
    localStorage.removeItem('siglivechat_username');
    setUsername(null);
    setUsernameInput('');
    setUsernameError(null);
  };

  // Online / Offline stats calculations
  // Active threshold: last active in the last 2 minutes (120,000 ms)
  const ONLINE_THRESHOLD = 120000;
  
  const onlineUsers = allUsers.filter(u => {
    if (!u.lastActive) return false;
    const lastActiveMs = u.lastActive.toMillis();
    return currentTime - lastActiveMs < ONLINE_THRESHOLD;
  });

  const offlineUsersCount = Math.max(0, allUsers.length - onlineUsers.length);

  return (
    <div className="flex flex-col h-full bg-[#f3f3f3] text-black font-sans select-none">
      
      {/* Menu Bar / Status Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-2 py-1.5 gap-2 sm:gap-0 border-b-[3px] border-black bg-[#00ffff] text-[10px] sm:text-xs font-bold font-mono shrink-0">
        <div className="flex items-center gap-2">
          <span>CHAT:</span>
          {username && (
            <button 
              onClick={handleSignOut}
              className="bg-white hover:bg-black hover:text-white text-black border border-black px-1.5 py-0.5 cursor-pointer active:scale-95 truncate max-w-[120px] sm:max-w-none"
            >
              CHANGE USER ({username})
            </button>
          )}
        </div>
        
        {/* Statistics requested: How many users, offline, and online */}
        <div className="flex items-center gap-1 sm:gap-3 flex-wrap">
          <span className="text-black bg-white px-2 py-0.5 border border-black">
            ONLINE: <span className="text-[#00aa00]">{onlineUsers.length}</span>
          </span>
          <span className="text-black bg-white px-2 py-0.5 border border-black">
            OFFLINE: <span className="text-gray-500">{offlineUsersCount}</span>
          </span>
          <span className="text-black bg-white px-2 py-0.5 border border-black">
            TOTAL: {allUsers.length}
          </span>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-white">
        
        {/* Username Setup Popup/Overlay */}
        {!username ? (
          <div className="absolute inset-0 bg-[#0000aa]/10 flex items-center justify-center p-4 z-40 backdrop-blur-sm">
            <div className="w-full max-w-sm bg-white border-[3px] border-black p-4 shadow-[4px_4px_0px_#000000]">
              <div className="bg-[#0000aa] text-white font-bold px-2 py-1 border-b-[3px] border-black text-center tracking-wide font-mono text-sm">
                {showDevVerification ? "DEVELOPER VERIFICATION" : "SIGLIVECHAT LOGIN"}
              </div>
              
              {showDevVerification ? (
                <form onSubmit={handleVerifyDev} className="mt-4 flex flex-col gap-3">
                  <p className="text-xs font-bold leading-relaxed font-mono">
                    The username <span className="text-red-600 font-extrabold">DEVELOPER2</span> is reserved. Please verify your developer name to continue:
                  </p>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold font-mono">ENTER DEVELOPER NAME:</label>
                    <input
                      type="password"
                      value={devNameInput}
                      onChange={(e) => setDevNameInput(e.target.value)}
                      placeholder="Developer Name"
                      className="w-full border-2 border-black px-2 py-1 font-mono text-sm bg-white text-black focus:outline-none focus:ring-1 focus:ring-black"
                      autoFocus
                    />
                  </div>

                  {usernameError && (
                    <div className="text-xs text-red-600 font-bold font-mono border border-red-600 p-1 bg-red-50">
                      ⚠ {usernameError}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowDevVerification(false);
                        setDevNameInput('');
                        setUsernameError(null);
                      }}
                      className="flex-1 py-1.5 font-bold font-mono text-sm bg-gray-200 text-black hover:bg-black hover:text-white border-2 border-black cursor-pointer active:translate-y-0.5 transition-transform"
                    >
                      CANCEL
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-1.5 font-bold font-mono text-sm bg-[#00ffff] text-black hover:bg-black hover:text-white border-2 border-black cursor-pointer active:translate-y-0.5 transition-transform"
                    >
                      VERIFY
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="mt-4 flex flex-col gap-3">
                  <p className="text-xs font-bold leading-relaxed font-mono">
                    Welcome to SIGLIVECHAT.pex! Please register a unique username to start chatting with other users online.
                  </p>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold font-mono">ENTER DESIRED USERNAME:</label>
                    <input
                      type="text"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="e.g. Sigeon1"
                      disabled={checkingUsername}
                      maxLength={20}
                      className="w-full border-2 border-black px-2 py-1 font-mono text-sm bg-white text-black focus:outline-none focus:ring-1 focus:ring-black"
                      autoFocus
                    />
                  </div>

                  {usernameError && (
                    <div className="text-xs text-red-600 font-bold font-mono border border-red-600 p-1 bg-red-50">
                      ⚠ {usernameError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={checkingUsername}
                    className="w-full py-1.5 font-bold font-mono text-sm bg-[#00ffff] text-black hover:bg-black hover:text-white border-2 border-black cursor-pointer active:translate-y-0.5 transition-transform"
                  >
                    {checkingUsername ? "CHECKING AVAILABILITY..." : "CONNECT TO SIGCHAT"}
                  </button>
                </form>
              )}
            </div>
          </div>
        ) : (
          /* Chat Area */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Messages Display Box */}
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5 font-mono text-xs select-text selection:bg-[#0000aa] selection:text-white scrollbar-thin"
            >
              {messages.length === 0 ? (
                <div className="text-gray-400 text-center italic mt-10">
                  No messages yet. Say hello to Sigeon network!
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.username.toLowerCase() === username.toLowerCase();
                  const isDev = msg.username.toLowerCase() === 'rainbow' || msg.username.toLowerCase() === 'developer2';
                  return (
                    <div 
                      key={msg.id} 
                      className={`py-1 px-2 border-b border-dashed border-gray-200 hover:bg-gray-50 flex flex-col gap-0.5`}
                    >
                      <div className="flex items-baseline justify-between">
                        {/* Format requested: [Username]: [Your Message] */}
                        {isDev ? (
                          <span className="font-bold flex items-center gap-1">
                            <span className="text-[#ff0000] font-extrabold">{msg.username}</span>
                            <span className="text-[9px] bg-[#ff0000] text-white font-bold px-1 py-[1.5px] border border-black rounded-sm uppercase tracking-wider scale-90">DEV</span>
                            <span className="text-gray-900 font-bold">:</span>
                          </span>
                        ) : (
                          <span className={`font-bold ${isMe ? 'text-[#0000aa]' : 'text-gray-900'}`}>
                            {msg.username}:
                          </span>
                        )}
                        {msg.timestamp && (
                          <span className="text-[9px] text-gray-400 font-normal">
                            {new Date(msg.timestamp.toMillis()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        )}
                      </div>
                      <p className="text-black break-words select-text font-sans font-medium text-sm mt-0.5">
                        {msg.text}
                      </p>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer Box */}
            <form 
              onSubmit={handleSendMessage} 
              className="border-t-[3px] border-black p-2 bg-[#e1e1e1] flex gap-2"
            >
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message here..."
                className="flex-1 border-2 border-black bg-white text-black px-2 py-1 font-mono text-sm focus:outline-none"
              />
              <button
                type="submit"
                className="bg-[#00ffff] hover:bg-black hover:text-white text-black border-2 border-black font-bold px-4 py-1 text-sm font-mono cursor-pointer active:scale-95"
              >
                SEND
              </button>
            </form>

          </div>
        )}
      </div>
    </div>
  );
}
