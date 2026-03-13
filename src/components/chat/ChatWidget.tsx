import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Chat01Icon, 
  Cancel01Icon, 
  SentIcon, 
  Loading01Icon, 
  AiChat01Icon, 
  UserIcon,
  Delete02Icon
} from '@hugeicons/core-free-icons';
import { generateChatResponse } from '@/src/services/geminiService';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
}

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      content: 'Assalamu alaikum! How can I help you today with your Islamic journey?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "Prayer times today?",
    "Dua for patience?",
    "How to perform Wudu?",
    "Importance of Ramadan?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (overrideInput?: string) => {
    const messageText = overrideInput || input;
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }));
      
      const responseText = await generateChatResponse(userMessage.content, history);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: responseText
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error generating chat response:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: "I'm sorry, I encountered an error while trying to respond. Please try again later."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        className="fixed bottom-6 right-6 p-4 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 z-50 flex items-center justify-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: isOpen ? 'none' : 'flex' }}
      >
        <HugeiconsIcon icon={Chat01Icon} className="w-6 h-6" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-full max-w-[350px] sm:max-w-[400px] h-[500px] max-h-[80vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 border border-slate-200 dark:border-slate-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-emerald-600 text-white">
              <div className="flex items-center space-x-2">
                <HugeiconsIcon icon={AiChat01Icon} className="w-6 h-6" />
                <h3 className="font-semibold text-lg">Islamic Assistant</h3>
              </div>
              <div className="flex items-center space-x-1">
                {messages.length > 1 && (
                  <button
                    onClick={() => setMessages([messages[0]])}
                    className="p-1.5 hover:bg-emerald-700 rounded-full transition-colors"
                    title="Clear chat"
                  >
                    <HugeiconsIcon icon={Delete02Icon} className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-emerald-700 rounded-full transition-colors"
                  aria-label="Close chat"
                >
                  <HugeiconsIcon icon={Cancel01Icon} className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex max-w-[80%] ${
                      msg.role === 'user'
                        ? 'bg-emerald-600 text-white rounded-l-2xl rounded-tr-2xl'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-r-2xl rounded-tl-2xl border border-slate-200 dark:border-slate-700'
                    } p-3 shadow-sm`}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm whitespace-pre-wrap">{msg.content}</span>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-r-2xl rounded-tl-2xl border border-slate-200 dark:border-slate-700 p-3 shadow-sm flex items-center space-x-2">
                    <HugeiconsIcon icon={Loading01Icon} className="w-4 h-4 animate-spin text-emerald-600" />
                    <span className="text-sm text-slate-500">Thinking...</span>
                  </div>
                </div>
              )}

              {messages.length === 1 && !isLoading && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        handleSend(q);
                      }}
                      className="text-xs bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 px-3 py-1.5 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors shadow-sm"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 rounded-full outline-none transition-colors text-slate-900 dark:text-white placeholder-slate-500"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Send message"
                >
                  <HugeiconsIcon icon={SentIcon} className="w-5 h-5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
