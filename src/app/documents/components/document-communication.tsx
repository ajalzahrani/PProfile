"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import {
  sendDocumentMessage,
  getDocumentMessages,
} from "../../../actions/documents";
import { useToast } from "@/components/ui/use-toast";
const messageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
});

type MessageFormValues = z.infer<typeof messageSchema>;

interface DocumentCommunicationProps {
  documentId: string;
}

export function DocumentCommunication({
  documentId,
}: DocumentCommunicationProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: { message: "" },
  });

  // Fetch messages
  const fetchMessages = async () => {
    setLoading(true);
    const res = await getDocumentMessages(documentId);
    if (res.success) {
      setMessages(res.messages ?? []);
    } else {
      setMessages([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 100000); // Poll every 100s
    return () => clearInterval(interval);
  }, [documentId]);

  //   useEffect(() => {
  //     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  //   }, [messages]);

  const onSubmit = async (data: MessageFormValues) => {
    setSending(true);
    const res = await sendDocumentMessage({
      documentId,
      message: data.message,
    });
    if (res.success) {
      form.reset();
      fetchMessages();
    }
    if (res.error) {
      toast({
        title: "Error",
        description: res.error,
        variant: "destructive",
      });
    }
    setSending(false);
  };

  return (
    <Card className="mt-3">
      <CardHeader>
        <CardTitle>Document Review</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-y-auto space-y-4 mb-4 bg-muted/50 p-4 rounded-md h-[calc(100vh-25rem)]">
          {loading ? (
            <div>Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-muted-foreground">No messages yet.</div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{msg.sender.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{msg.sender.name}</span>
                    {msg.sender.department && (
                      <span className="text-xs text-muted-foreground">
                        ({msg.sender.department.name})
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(msg.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <div className="bg-white dark:bg-gray-900 rounded px-3 py-2 mt-1 border text-sm">
                    {msg.message}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex gap-2 items-end">
          <Textarea
            {...form.register("message")}
            placeholder="Type your message..."
            className="min-h-[40px]"
            disabled={sending}
          />
          <Button
            type="submit"
            disabled={sending || form.formState.isSubmitting}>
            {sending ? "Sending..." : "Send"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
