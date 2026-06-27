"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Send, MapPin, Calendar, Users, Wand2 } from "lucide-react";

const suggestedPrompts = [
  "Plan a 5-day trip to Bali for a couple",
  "Family vacation in Europe for 2 weeks",
  "Adventure trip to Swiss Alps with activities",
  "Budget-friendly beach holiday for 4 people",
];

export default function AiPlannerPage() {
  const [prompt, setPrompt] = React.useState("");
  const [messages, setMessages] = React.useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);

  const handleSend = () => {
    if (!prompt.trim()) return;
    setMessages((prev) => [
      ...prev,
      { role: "user", content: prompt },
      {
        role: "assistant",
        content:
          "I'd love to help you plan that trip! Based on your preferences, here are some recommendations I'm putting together. This is a demo — in the full version, I'll provide detailed itineraries, hotel options, and activity suggestions tailored to your needs.",
      },
    ]);
    setPrompt("");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">AI Trip Planner</h1>
        <p className="mt-2 text-gray-500">
          Tell me about your dream trip and I&apos;ll create a personalized itinerary
        </p>
      </div>

      {/* Quick Info Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <MapPin className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Any Destination</p>
              <p className="text-xs text-gray-500">Worldwide coverage</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Calendar className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Flexible Dates</p>
              <p className="text-xs text-gray-500">Plan for any timeline</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Users className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Any Group Size</p>
              <p className="text-xs text-gray-500">Solo to large groups</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat Area */}
      <Card className="mb-6">
        <CardContent className="p-6">
          {messages.length === 0 ? (
            <div className="py-12 text-center">
              <Wand2 className="mx-auto mb-4 h-10 w-10 text-gray-300" />
              <p className="text-sm text-gray-500">Start a conversation to plan your trip</p>

              {/* Suggested Prompts */}
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {suggestedPrompts.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setPrompt(suggestion)}
                    className="rounded-full border border-gray-200 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Input */}
      <div className="flex gap-3">
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your ideal trip..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1"
        />
        <Button onClick={handleSend} disabled={!prompt.trim()}>
          <Send className="h-4 w-4" />
          Send
        </Button>
      </div>
    </div>
  );
}
