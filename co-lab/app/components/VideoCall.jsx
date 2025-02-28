"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { rtdb } from "../firebase";
import { ref, onValue, set, push, remove } from "firebase/database";

const RemoteVideo = ({ stream, participant }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="border p-2 rounded-md">
      <p className="text-center">{participant.displayName}</p>
      <video ref={videoRef} autoPlay playsInline className="w-full h-auto border" />
    </div>
  );
};

export default function VideoCall({ roomId, onLeaveCall }) {
  const { user } = useAuth();
  const [participants, setParticipants] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const localVideoRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const peerConnectionsRef = useRef({});
  const [remoteStreams, setRemoteStreams] = useState({});
  const screenTrackRef = useRef(null);

  const configuration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  const callRef = ref(rtdb, `calls/${roomId}`);
  const participantsRef = ref(rtdb, `calls/${roomId}/participants`);

  useEffect(() => {
    const getLocalStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing media devices.", error);
      }
    };
    getLocalStream();
  }, []);

  const toggleMute = () => {
    localStream.getAudioTracks().forEach(track => (track.enabled = !isMuted));
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    localStream.getVideoTracks().forEach(track => (track.enabled = !isVideoOff));
    setIsVideoOff(!isVideoOff);
  };

  const shareScreen = async () => {
    if (isScreenSharing) {

      if (screenTrackRef.current) {
        screenTrackRef.current.stop();
      }

      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
      const cameraTrack = cameraStream.getVideoTracks()[0];

      Object.values(peerConnectionsRef.current).forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track.kind === "video");
        if (sender) sender.replaceTrack(cameraTrack);
      });

      localStream.removeTrack(localStream.getVideoTracks()[0]); 
      localStream.addTrack(cameraTrack); 

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream; 
      }

      setIsScreenSharing(false);
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        screenTrackRef.current = screenTrack;

        Object.values(peerConnectionsRef.current).forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track.kind === "video");
          if (sender) sender.replaceTrack(screenTrack);
        });

        localStream.removeTrack(localStream.getVideoTracks()[0]); 
        localStream.addTrack(screenTrack); 

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream; 
        }

        setIsScreenSharing(true);

        screenTrack.onended = () => {
          shareScreen(); 
        };
      } catch (error) {
        console.error("Error sharing screen", error);
      }
    }
  };

  const leaveCall = async () => {
    Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
    remove(participantsRef);
    onLeaveCall();
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen flex flex-col items-center text-white">
      <h2 className="text-2xl font-bold bg-gray-800 px-4 py-2 rounded-lg shadow-md">Room ID: {roomId}</h2>

      <div className="mt-6 flex space-x-6 w-full max-w-4xl">
        <div className="relative w-1/3">
          <video ref={localVideoRef} autoPlay playsInline className="w-full rounded-xl border-2 border-gray-700 shadow-lg" />
          <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-sm px-2 py-1 rounded-md">You</span>
        </div>

        <div className="grid grid-cols-2 gap-4 flex-grow">
          {participants.map(id => (
            <div key={id} className="relative bg-gray-800 rounded-xl p-2 shadow-lg">
              <RemoteVideo stream={remoteStreams[id]} participant={{ displayName: id }} />
              <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-sm px-2 py-1 rounded-md">{id}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex space-x-4">
        <button onClick={toggleMute} className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg">
          {isMuted ? "mute" : "Unmute"}
        </button>
        <button onClick={toggleVideo} className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-lg">
          {isVideoOff ? "Turn Video Off" : "Turn Video On"}
        </button>
        <button onClick={shareScreen} className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg">
          {isScreenSharing ? "Stop Sharing" : "Share Screen"}
        </button>
        <button onClick={leaveCall} className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg">
          Leave Call
        </button>
      </div>
    </div>
  );
}