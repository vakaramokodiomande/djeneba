"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/DashboardHeader";

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    name: string;
  };
  receiver: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

interface Conversation {
  conversationId: string;
  lastMessage: Message;
  unreadCount: number;
}

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/connexion");
    } else if (status === "authenticated") {
      fetchConversations();
    }
  }, [status, router]);

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/messages");
      const data = await response.json();

      if (response.ok) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/messages?conversationId=${conversationId}`);
      const data = await response.json();

      if (response.ok) {
        setMessages(data.messages);
        setSelectedConversation(conversationId);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);

    // Extraire le receiverId du conversationId
    const [userId1, userId2] = selectedConversation.split("_");
    const receiverId = userId1 === session?.user.id ? userId2 : userId1;

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverId,
          content: newMessage,
        }),
      });

      if (response.ok) {
        setNewMessage("");
        fetchMessages(selectedConversation);
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
    } finally {
      setSending(false);
    }
  };

  const getOtherUser = (message: Message) => {
    return message.sender._id === session?.user.id
      ? message.receiver
      : message.sender;
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">⏳</div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Messagerie 💬
        </h2>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: "600px" }}>
          <div className="grid grid-cols-3 h-full">
            {/* Liste des conversations */}
            <div className="col-span-1 border-r overflow-y-auto">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-semibold">Conversations</h3>
              </div>

              {conversations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-2">💬</div>
                  <p className="text-gray-600 text-sm">Aucune conversation</p>
                </div>
              ) : (
                <div>
                  {conversations.map((conv) => {
                    const otherUser = getOtherUser(conv.lastMessage);
                    return (
                      <div
                        key={conv.conversationId}
                        onClick={() => fetchMessages(conv.conversationId)}
                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${
                          selectedConversation === conv.conversationId ? "bg-tomato-50" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm">{otherUser.name}</span>
                          {conv.unreadCount > 0 && (
                            <span className="bg-tomato-600 text-white text-xs rounded-full px-2 py-1">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-xs truncate">
                          {conv.lastMessage.content}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Zone de messages */}
            <div className="col-span-2 flex flex-col">
              {!selectedConversation ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl mb-4">👈</div>
                    <p className="text-gray-600">Sélectionnez une conversation</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => {
                      const isSender = message.sender._id === session?.user.id;
                      return (
                        <div
                          key={message._id}
                          className={`flex ${isSender ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-sm rounded-lg px-4 py-2 ${
                              isSender
                                ? "bg-tomato-600 text-white"
                                : "bg-gray-200 text-gray-900"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                isSender ? "text-tomato-100" : "text-gray-500"
                              }`}
                            >
                              {new Date(message.createdAt).toLocaleTimeString("fr-FR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Zone de saisie */}
                  <div className="border-t p-4">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                        placeholder="Écrivez votre message..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-tomato-500 focus:border-tomato-500"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={sending || !newMessage.trim()}
                        className="bg-tomato-600 text-white px-6 py-2 rounded-md hover:bg-tomato-700 transition disabled:opacity-50"
                      >
                        Envoyer
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
