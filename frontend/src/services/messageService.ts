import axios from "axios";
import { api } from "@/lib/api";
import { Message, ConversationSummary, BondStatus } from "@/types/message";

const BASE_URL = "https://followup-service.onrender.com";

function authHeader() {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token")
    ?? (api.defaults.headers.common["Authorization"] as string | undefined)?.replace("Bearer ", "");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const messageService = {
  sendMessage: (receiverId: number, content: string) =>
    axios.post<{ data: Message }>(
      `${BASE_URL}/api/messages/send`,
      { receiverId, content },
      { headers: authHeader() }
    ),

  getConversation: (otherUserId: number) =>
    axios.get<{ data: Message[] }>(
      `${BASE_URL}/api/messages/conversation/${otherUserId}`,
      { headers: authHeader() }
    ),

  getConversations: () =>
    axios.get<{ data: ConversationSummary[] }>(
      `${BASE_URL}/api/messages/conversations`,
      { headers: authHeader() }
    ),

  countUnread: () =>
    axios.get<{ data: number }>(
      `${BASE_URL}/api/messages/unread/count`,
      { headers: authHeader() }
    ),

  getBondStatus: (investorUserId: number, startupUserId: number) =>
    axios.get<{ data: BondStatus }>(
      `${BASE_URL}/api/messages/admin/bond-status`,
      { params: { investorUserId, startupUserId }, headers: authHeader() }
    ),

  getConversationForAdmin: (user1: number, user2: number) =>
    axios.get<{ data: Message[] }>(
      `${BASE_URL}/api/messages/admin/conversation`,
      { params: { user1, user2 }, headers: authHeader() }
    ),
};

export const investmentMonitorService = {
  askForFund: (payload: {
    investorUserId: number;
    executionId: number;
    investorName: string;
    investorEmail: string;
    startupName?: string;
    fundingAmount?: number;
    executionTitle?: string;
  }) =>
    axios.post(
      "https://reporting-notification-service.onrender.com/api/notifications/ask-for-fund",
      payload,
      { headers: authHeader(), timeout: 65000 }
    ),

  markAsFunded: (executionId: number) =>
    axios.patch(
      `https://startup-application-service.onrender.com/api/executions/investor/${executionId}/fund`,
      {},
      { headers: authHeader() }
    ),
};
