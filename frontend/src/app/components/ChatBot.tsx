import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { chatAPI } from "../../services/api";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hi there! I'm your FitAI coach. Ask me anything about fitness, nutrition, or your goals!" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput("");

        // Add user message to UI
        const updatedMessages: Message[] = [...messages, { role: "user", content: userMsg }];
        setMessages(updatedMessages);
        setIsLoading(true);

        try {
            // Send to backend
            const response = await chatAPI.sendMessage(userMsg, messages);

            // Add AI response to UI
            setMessages([...updatedMessages, { role: "assistant", content: response.reply }]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages([...updatedMessages, { role: "assistant", content: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            {!isOpen && (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl z-50 bg-primary hover:bg-primary/90 transition-transform hover:scale-110 active:scale-95 flex items-center justify-center p-0"
                >
                    <MessageSquare className="w-6 h-6 text-primary-foreground" />
                </Button>
            )}

            {/* Chat Window */}
            <div
                className={`fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[550px] max-h-[85vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col z-50 transition-all duration-300 transform origin-bottom-right ${isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
                    }`}
            >
                {/* Header */}
                <div className="bg-primary p-4 rounded-t-2xl flex items-center justify-between shadow-md z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-xl">
                            <Bot className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                            <h3 className="font-bold text-primary-foreground tracking-tight">AI FitGuide</h3>
                            <p className="text-[10px] uppercase text-primary-foreground/80 font-semibold tracking-widest">Personal Coach</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsOpen(false)}
                        className="text-primary-foreground hover:bg-white/20 h-8 w-8 p-0 rounded-full"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Messages Layout */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary border border-border"
                                }`}>
                                {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                            </div>
                            <div
                                className={`max-w-[75%] p-3 rounded-2xl text-sm shadow-sm ${msg.role === "user"
                                        ? "bg-primary text-primary-foreground rounded-br-sm"
                                        : "bg-card border border-border text-card-foreground rounded-bl-sm"
                                    }`}
                            >
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-end gap-2">
                            <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0">
                                <Bot className="w-4 h-4" />
                            </div>
                            <div className="bg-card border border-border p-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                                <span className="text-xs text-muted-foreground font-medium">Thinking...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-card border-t border-border rounded-b-2xl">
                    <form onSubmit={handleSend} className="relative flex items-center">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about workouts, nutrition..."
                            className="pr-12 bg-secondary/50 border-transparent focus-visible:ring-primary h-12 rounded-xl"
                            disabled={isLoading}
                        />
                        <Button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="absolute right-1 h-10 w-10 rounded-lg p-0 bg-primary hover:bg-primary/90 shadow-none disabled:opacity-50"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </form>
                </div>
            </div>
        </>
    );
}
