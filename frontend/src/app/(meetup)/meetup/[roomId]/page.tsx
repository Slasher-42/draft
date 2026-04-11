"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
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
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
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

  const [connected, setConnected] = useState(false);
  const [remoteConnected, setRemoteConnected] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [roomError, setRoomError] = useState<string | null>(null);

  const sendSignal = useCallback((msg: Omit<SignalMessage, "from" | "roomId">) => {
    if (!stompRef.current?.connected || !user) return;
    stompRef.current.publish({
      destination: `/app/signal/${roomId}`,
      body: JSON.stringify({ ...msg, roomId, from: user.id }),
    });
  }, [roomId, user]);

  const createPeer = useCallback(() => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        sendSignal({ type: "ice-candidate", candidate: JSON.stringify(candidate) });
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setRemoteConnected(true);
      }
    };

    pc.onnegotiationneeded = async () => {
      try {
        makingOfferRef.current = true;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        sendSignal({ type: "offer", sdp: JSON.stringify(pc.localDescription) });
      } catch {
        toast.error("Failed to create offer");
      } finally {
        makingOfferRef.current = false;
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        setRemoteConnected(false);
      }
    };

    return pc;
  }, [sendSignal]);

  const handleSignal = useCallback(async (msg: SignalMessage) => {
    if (!user || msg.from === user.id) return;

    if (msg.type === "join") {
      if (!peerRef.current) return;
      localStreamRef.current?.getTracks().forEach((track) => {
        peerRef.current!.addTrack(track, localStreamRef.current!);
      });
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
      ignoreOfferRef.current = offerCollision;
      if (ignoreOfferRef.current) return;

      isSettingRemoteRef.current = true;
      await pc.setRemoteDescription(offerDesc);
      isSettingRemoteRef.current = false;

      localStreamRef.current?.getTracks().forEach((track) => {
        if (!pc.getSenders().find((s) => s.track === track)) {
          pc.addTrack(track, localStreamRef.current!);
        }
      });

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
      }
    }
  }, [user, sendSignal]);

  useEffect(() => {
    if (!user || !roomId) return;

    let mounted = true;

    const init = async () => {
      try {
        await followupService.getMeetupByRoom(roomId);
      } catch {
        setRoomError("This meeting room does not exist or you don't have access.");
        setIsLoading(false);
        return;
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      } catch {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
          setVideoEnabled(false);
        } catch {
          setRoomError("Camera and microphone access is required to join this call.");
          setIsLoading(false);
          return;
        }
      }

      if (!mounted) { stream.getTracks().forEach((t) => t.stop()); return; }

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const pc = createPeer();
      peerRef.current = pc;

      const stomp = new Client({
        webSocketFactory: () => new SockJS("http://localhost:8088/ws/signaling"),
        reconnectDelay: 3000,
        onConnect: () => {
          if (!mounted) return;
          setConnected(true);
          setIsLoading(false);

          stomp.subscribe(`/topic/room/${roomId}`, (frame) => {
            try {
              const msg: SignalMessage = JSON.parse(frame.body);
              handleSignal(msg);
            } catch {
            }
          });

          sendSignal({ type: "join" });

          stream.getTracks().forEach((track) => {
            pc.addTrack(track, stream);
          });
        },
        onDisconnect: () => {
          if (mounted) setConnected(false);
        },
        onStompError: () => {
          if (mounted) toast.error("Signaling connection error");
        },
      });

      stomp.activate();
      stompRef.current = stomp;
    };

    init();

    return () => {
      mounted = false;
      sendSignal({ type: "leave" });
      stompRef.current?.deactivate();
      peerRef.current?.close();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [user, roomId, createPeer, handleSignal, sendSignal]);

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
    sendSignal({ type: "leave" });
    stompRef.current?.deactivate();
    peerRef.current?.close();
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    router.back();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-950 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-white" />
        <p className="text-white/70 text-sm">Joining meeting room…</p>
      </div>
    );
  }

  if (roomError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-950 gap-4 px-4">
        <div className="h-16 w-16 rounded-full bg-red-500/20 flex items-center justify-center">
          <PhoneOff className="h-8 w-8 text-red-400" />
        </div>
        <p className="text-white font-semibold text-lg text-center">{roomError}</p>
        <Button variant="outline" className="mt-2 text-white border-white/20 hover:bg-white/10" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">
      <div className="flex items-center justify-between px-6 py-3 bg-gray-900 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className={`h-2 w-2 rounded-full ${connected ? "bg-green-400" : "bg-red-400"}`} />
          <span className="text-sm font-medium">Room: {roomId}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/50">
          <Users className="h-4 w-4" />
          <span>{remoteConnected ? "2" : "1"} participant{remoteConnected ? "s" : ""}</span>
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
            You
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
          {remoteConnected ? (
            <>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-black/50 text-xs text-white px-2 py-1 rounded-md">
                Remote
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="h-16 w-16 rounded-full bg-gray-700 flex items-center justify-center">
                <Users className="h-7 w-7 text-white/30" />
              </div>
              <p className="text-sm text-white/40">Waiting for other participant…</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 py-5 bg-gray-900 border-t border-white/10">
        <button
          onClick={toggleAudio}
          className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
            audioEnabled ? "bg-gray-700 hover:bg-gray-600" : "bg-red-500 hover:bg-red-400"
          }`}
          title={audioEnabled ? "Mute" : "Unmute"}
        >
          {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </button>

        <button
          onClick={toggleVideo}
          className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
            videoEnabled ? "bg-gray-700 hover:bg-gray-600" : "bg-red-500 hover:bg-red-400"
          }`}
          title={videoEnabled ? "Stop video" : "Start video"}
        >
          {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </button>

        <button
          onClick={leaveCall}
          className="h-12 w-12 rounded-full flex items-center justify-center bg-red-600 hover:bg-red-500 transition-colors"
          title="Leave call"
        >
          <PhoneOff className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
