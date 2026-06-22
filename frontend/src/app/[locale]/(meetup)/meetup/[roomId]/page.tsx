"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuth } from "@/context/AuthContext";
import { followupService } from "@/services/followupService";
import { toast } from "react-toastify";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Loader2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    {
      urls: "stun:stun.relay.metered.ca:80",
    },
    {
      urls: "turn:global.relay.metered.ca:80",
      username: "b660e9e04d2f73b9587aa5f3",
      credential: "1y3bf01VWUWoPTyV",
    },
    {
      urls: "turn:global.relay.metered.ca:80?transport=tcp",
      username: "b660e9e04d2f73b9587aa5f3",
      credential: "1y3bf01VWUWoPTyV",
    },
    {
      urls: "turn:global.relay.metered.ca:443",
      username: "b660e9e04d2f73b9587aa5f3",
      credential: "1y3bf01VWUWoPTyV",
    },
    {
      urls: "turns:global.relay.metered.ca:443?transport=tcp",
      username: "b660e9e04d2f73b9587aa5f3",
      credential: "1y3bf01VWUWoPTyV",
    },
  ],
};

type SignalType = "offer" | "answer" | "ice-candidate" | "join" | "leave";

interface SignalMessage {
  type: SignalType;
  roomId: string;
  from: number;
  sdp?: string;
  candidate?: string;
}

export default function MeetupRoomPage() {
  const t = useTranslations("meetup.room");
  const { roomId } = useParams<{ roomId: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const stompRef = useRef<Client | null>(null);
  const makingOfferRef = useRef(false);
  const ignoreOfferRef = useRef(false);
  const isSettingRemoteRef = useRef(false);
  const politeRef = useRef(false);
  const subscribedRef = useRef(false);

  const [connected, setConnected] = useState(false);
  const [remoteConnected, setRemoteConnected] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [roomError, setRoomError] = useState<string | null>(null);

  const sendSignal = useCallback(
    (msg: Omit<SignalMessage, "from" | "roomId">) => {
      if (!stompRef.current?.connected || !user) return;
      stompRef.current.publish({
        destination: `/app/signal/${roomId}`,
        body: JSON.stringify({ ...msg, roomId, from: Number(user.id) }),
      });
    },
    [roomId, user]
  );

  const addLocalTracks = useCallback(() => {
    const pc = peerRef.current;
    const stream = localStreamRef.current;
    if (!pc || !stream) return;
    const existingSenders = pc.getSenders();
    stream.getTracks().forEach((track) => {
      const alreadyAdded = existingSenders.some((s) => s.track === track);
      if (!alreadyAdded) pc.addTrack(track, stream);
    });
  }, []);

  const createPeer = useCallback(() => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        sendSignal({
          type: "ice-candidate",
          candidate: JSON.stringify(candidate),
        });
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setRemoteConnected(true);
      }
    };

    pc.onnegotiationneeded = async () => {
      // Only the impolite peer (higher user ID) creates the offer.
      // The polite peer waits to receive an offer.
      if (politeRef.current) return;
      try {
        makingOfferRef.current = true;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        sendSignal({ type: "offer", sdp: JSON.stringify(pc.localDescription) });
      } catch {
        toast.error(t("toastOfferFailed"));
      } finally {
        makingOfferRef.current = false;
      }
    };

    pc.onconnectionstatechange = () => {
      if (
        pc.connectionState === "disconnected" ||
        pc.connectionState === "failed"
      ) {
        setRemoteConnected(false);
      }
      if (pc.connectionState === "connected") {
        setRemoteConnected(true);
      }
    };

    return pc;
  }, [sendSignal]);

  const handleSignal = useCallback(
    async (msg: SignalMessage) => {
      if (!user || msg.from === Number(user.id)) return;

      if (msg.type === "join") {
        // Lower ID = polite peer (answers).
        // Higher ID = impolite peer (sends offer).
        politeRef.current = Number(user.id) < msg.from;
        addLocalTracks();
        return;
      }

      if (msg.type === "leave") {
        setRemoteConnected(false);
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        return;
      }

      if (!peerRef.current) return;
      const pc = peerRef.current;

      if (msg.type === "offer" && msg.sdp) {
        const offerDesc = JSON.parse(msg.sdp) as RTCSessionDescriptionInit;
        const offerCollision =
          makingOfferRef.current || pc.signalingState !== "stable";
        ignoreOfferRef.current = !politeRef.current && offerCollision;
        if (ignoreOfferRef.current) return;

        if (offerCollision) {
          await Promise.all([
            pc.setLocalDescription({ type: "rollback" }),
            pc.setRemoteDescription(offerDesc),
          ]);
        } else {
          isSettingRemoteRef.current = true;
          await pc.setRemoteDescription(offerDesc);
          isSettingRemoteRef.current = false;
        }

        addLocalTracks();

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendSignal({ type: "answer", sdp: JSON.stringify(pc.localDescription) });
      } else if (msg.type === "answer" && msg.sdp) {
        const answerDesc = JSON.parse(msg.sdp) as RTCSessionDescriptionInit;
        if (pc.signalingState !== "have-local-offer") return;
        await pc.setRemoteDescription(answerDesc);
      } else if (msg.type === "ice-candidate" && msg.candidate) {
        try {
          if (!isSettingRemoteRef.current && !ignoreOfferRef.current) {
            await pc.addIceCandidate(JSON.parse(msg.candidate));
          }
        } catch {
          // Silently ignore invalid ICE candidates
        }
      }
    },
    [user, sendSignal, addLocalTracks]
  );

  useEffect(() => {
    if (!user || !roomId) return;

    let mounted = true;
    subscribedRef.current = false;

    const init = async () => {
      try {
        await followupService.getMeetupByRoom(roomId);
      } catch {
        setRoomError(t("roomNotFound"));
        setIsLoading(false);
        return;
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
      } catch {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true,
          });
          setVideoEnabled(false);
        } catch {
          setRoomError(t("accessRequired"));
          setIsLoading(false);
          return;
        }
      }

      if (!mounted) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const pc = createPeer();
      peerRef.current = pc;

      const stomp = new Client({
        webSocketFactory: () =>
          new SockJS("https://followup-service-c1jp.onrender.com/ws/signaling"),
        reconnectDelay: 3000,
        onConnect: () => {
          if (!mounted) return;
          // Prevent duplicate subscriptions on reconnect
          if (subscribedRef.current) return;
          subscribedRef.current = true;

          setConnected(true);
          setIsLoading(false);

          stomp.subscribe(`/topic/room/${roomId}`, (frame) => {
            try {
              const msg: SignalMessage = JSON.parse(frame.body);
              handleSignal(msg);
            } catch {
              // Silently ignore malformed signal messages
            }
          });

          // Add local tracks BEFORE sending join so tracks are ready
          // when onnegotiationneeded fires after the other peer joins.
          addLocalTracks();

          // Announce presence to the room
          sendSignal({ type: "join" });
        },
        onDisconnect: () => {
          if (mounted) {
            setConnected(false);
            subscribedRef.current = false;
          }
        },
        onStompError: () => {
          if (mounted) toast.error(t("toastSignalError"));
        },
      });

      stomp.activate();
      stompRef.current = stomp;
    };

    init();

    return () => {
      mounted = false;
      // Use stompRef directly in cleanup — sendSignal closure may be stale
      if (stompRef.current?.connected && user) {
        stompRef.current.publish({
          destination: `/app/signal/${roomId}`,
          body: JSON.stringify({ type: "leave", roomId, from: Number(user.id) }),
        });
      }
      stompRef.current?.deactivate();
      peerRef.current?.close();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, roomId]);

  const toggleAudio = () => {
    localStreamRef.current?.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setAudioEnabled((v) => !v);
  };

  const toggleVideo = () => {
    localStreamRef.current?.getVideoTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setVideoEnabled((v) => !v);
  };

  const leaveCall = () => {
    if (stompRef.current?.connected && user) {
      stompRef.current.publish({
        destination: `/app/signal/${roomId}`,
        body: JSON.stringify({ type: "leave", roomId, from: Number(user.id) }),
      });
    }
    stompRef.current?.deactivate();
    peerRef.current?.close();
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    router.back();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-950 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-white" />
        <p className="text-white/70 text-sm">{t("joiningRoom")}</p>
      </div>
    );
  }

  if (roomError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-950 gap-4 px-4">
        <div className="h-16 w-16 rounded-full bg-red-500/20 flex items-center justify-center">
          <PhoneOff className="h-8 w-8 text-red-400" />
        </div>
        <p className="text-white font-semibold text-lg text-center">
          {roomError}
        </p>
        <Button
          variant="outline"
          className="mt-2 text-white border-white/20 hover:bg-white/10"
          onClick={() => router.back()}
        >
          {t("goBack")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">
      <div className="flex items-center justify-between px-6 py-3 bg-gray-900 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div
            className={`h-2 w-2 rounded-full ${
              connected ? "bg-green-400" : "bg-red-400"
            }`}
          />
          <span className="text-sm font-medium">{t("roomLabel")} {roomId}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/50">
          <Users className="h-4 w-4" />
          <span>
            {remoteConnected ? t("twoParticipants") : t("oneParticipant")}
          </span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 overflow-hidden">
        <div className="relative rounded-2xl overflow-hidden bg-gray-800">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-3 left-3 bg-black/50 text-xs text-white px-2 py-1 rounded-md">
            {t("youLabel")}
          </div>
          {!videoEnabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="h-16 w-16 rounded-full bg-gray-700 flex items-center justify-center">
                <VideoOff className="h-7 w-7 text-white/50" />
              </div>
            </div>
          )}
        </div>

        <div className="relative rounded-2xl overflow-hidden bg-gray-800">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          {remoteConnected && (
            <div className="absolute bottom-3 left-3 bg-black/50 text-xs text-white px-2 py-1 rounded-md">
              {t("remoteLabel")}
            </div>
          )}
          {!remoteConnected && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-800">
              <div className="h-16 w-16 rounded-full bg-gray-700 flex items-center justify-center">
                <Users className="h-7 w-7 text-white/30" />
              </div>
              <p className="text-sm text-white/40">
                {t("waitingForParticipant")}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 py-5 bg-gray-900 border-t border-white/10">
        <button
          onClick={toggleAudio}
          className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
            audioEnabled
              ? "bg-gray-700 hover:bg-gray-600"
              : "bg-red-500 hover:bg-red-400"
          }`}
          title={audioEnabled ? t("mute") : t("unmute")}
        >
          {audioEnabled ? (
            <Mic className="h-5 w-5" />
          ) : (
            <MicOff className="h-5 w-5" />
          )}
        </button>

        <button
          onClick={toggleVideo}
          className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
            videoEnabled
              ? "bg-gray-700 hover:bg-gray-600"
              : "bg-red-500 hover:bg-red-400"
          }`}
          title={videoEnabled ? t("stopVideo") : t("startVideo")}
        >
          {videoEnabled ? (
            <Video className="h-5 w-5" />
          ) : (
            <VideoOff className="h-5 w-5" />
          )}
        </button>

        <button
          onClick={leaveCall}
          className="h-12 w-12 rounded-full flex items-center justify-center bg-red-600 hover:bg-red-500 transition-colors"
          title={t("leaveCall")}
        >
          <PhoneOff className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}