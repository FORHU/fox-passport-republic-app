import api from "@/shared/lib/axios";

export interface ConversationSummary {
  id: string;
  unreadCount?: number;
}

export async function getConversations(): Promise<ConversationSummary[]> {
  const res = await api.get("/conversations");
  return res.data?.data ?? [];
}
