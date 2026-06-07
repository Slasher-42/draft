import axios from "axios";
import { api } from "@/lib/api";
import { Message, ConversationSummary, BondStatus } from "@/types/message";

const BASE_URL = "https://followup-service.onrender.com";

function authHeader() {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token")
    ?? (api.defaults.headers.common["Authorization"] as string | undefined)?.replace("Bearer ", "");
  // Send token in both Authorization and X-Token headers.
  // Render's reverse proxy strips Authorization on some services, so X-Token is the fallback.
  return token ? { Authorization: `Bearer ${token}`, "X-Token": token } : {};
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
  }) => {
    // Render strips the Authorization/X-Token headers before they reach this service,
    // so the token rides along in the JSON body instead — bodies pass through untouched.
    // The backend validates it manually (see NotificationController#askForFund).
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return axios.post(
      "https://reporting-notification-service.onrender.com/api/notifications/ask-for-fund",
      { ...payload, token },
      { timeout: 65000 }
    );
  },

  markAsFunded: (executionId: number) =>
    axios.patch(
      `https://startup-application-service.onrender.com/api/executions/investor/${executionId}/fund`,
      {},
      { headers: authHeader() }
    ),
};
