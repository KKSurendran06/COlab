"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { rtdb } from "../firebase";
import { ref, onValue, set, push, remove, onChildAdded, onChildRemoved, get } from "firebase/database";

const RemoteVideo = ({ stream, participantName }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      console.log(`Setting stream for participant: ${participantName}`);
      videoRef.current.srcObject = stream;
    }
  }, [stream, participantName]);

  return (
    <div className="border p-2 rounded-md">
      <p className="text-center">{participantName || "Participant"}</p>
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        className="w-full h-auto border" 
      />
    </div>
  );
};

export default function VideoCall({ roomId, onLeaveCall }) {
  const { user } = useAuth();
  const [participants, setParticipants] = useState({});
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const localVideoRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const peerConnectionsRef = useRef({});
  const [remoteStreams, setRemoteStreams] = useState({});
  const screenTrackRef = useRef(null);
  const [connectionStatus, setConnectionStatus] = useState("Initializing");

  // STUN servers for WebRTC connection
  const configuration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun3.l.google.com:19302" },
      { urls: "stun:stun4.l.google.com:19302" },
    ],
  };

  // Firebase references
  const roomRef = ref(rtdb, `calls/${roomId}`);
  const participantsRef = ref(rtdb, `calls/${roomId}/participants`);

  // Debug function to check connections periodically
  const debugConnections = () => {
    Object.entries(peerConnectionsRef.current).forEach(([id, pc]) => {
      console.log(`Connection to ${id}:`, {
        iceConnectionState: pc.iceConnectionState,
        iceGatheringState: pc.iceGatheringState,
        signalingState: pc.signalingState,
        connectionState: pc.connectionState
      });
    });
  };

  // Initialize the call
  useEffect(() => {
    console.log("Initializing video call for room:", roomId);
    setConnectionStatus("Initializing");
    
    // Get local media stream
    const setupLocalMedia = async () => {
      try {
        console.log("Requesting user media...");
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        console.log("Got local stream with tracks:", 
          stream.getTracks().map(t => `${t.kind}: ${t.id} (${t.label})`).join(", "));
        
        setLocalStream(stream);
        setConnectionStatus("Media acquired");
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        // Register as a participant
        if (user) {
          console.log("Registering as participant:", user.uid);
          set(ref(rtdb, `calls/${roomId}/participants/${user.uid}`), {
            displayName: user.displayName || user.email || user.uid,
            joined: new Date().toISOString()
          });
          setConnectionStatus("Registered as participant");
        }
      } catch (error) {
        console.error("Error accessing media devices:", error);
        setConnectionStatus("Media error: " + error.message);
        alert("Could not access camera or microphone. Please check permissions.");
      }
    };
    
    setupLocalMedia();
    
    // Setup debug interval
    const debugInterval = setInterval(debugConnections, 5000);
    
    // Cleanup function
    return () => {
      console.log("Cleaning up video call...");
      clearInterval(debugInterval);
      
      if (localStream) {
        localStream.getTracks().forEach(track => {
          console.log(`Stopping track: ${track.kind}`);
          track.stop();
        });
      }
      
      // Remove participant entry
      if (user) {
        remove(ref(rtdb, `calls/${roomId}/participants/${user.uid}`));
      }
    };
  }, [roomId, user]);

  // Listen for participants
  useEffect(() => {
    if (!user || !localStream) return;
    
    console.log("Setting up participant listeners...");
    setConnectionStatus("Setting up participant listeners");
    
    // Listen for new participants
    const handleNewParticipant = (snapshot) => {
      const participantId = snapshot.key;
      const participantData = snapshot.val();
      
      // Skip ourselves
      if (participantId === user.uid) return;
      
      console.log(`New participant joined: ${participantId}`, participantData);
      
      setParticipants(prev => ({
        ...prev,
        [participantId]: participantData
      }));
      
      // Create WebRTC connection to this participant
      createPeerConnection(participantId, true);
      setConnectionStatus("New participant joined");
    };
    
    // Listen for participants leaving
    const handleParticipantLeft = (snapshot) => {
      const participantId = snapshot.key;
      
      if (participantId === user.uid) return;
      
      console.log(`Participant left: ${participantId}`);
      
      // Cleanup connection
      if (peerConnectionsRef.current[participantId]) {
        peerConnectionsRef.current[participantId].close();
        delete peerConnectionsRef.current[participantId];
      }
      
      // Update states
      setRemoteStreams(prev => {
        const newStreams = {...prev};
        delete newStreams[participantId];
        return newStreams;
      });
      
      setParticipants(prev => {
        const newParticipants = {...prev};
        delete newParticipants[participantId];
        return newParticipants;
      });
      
      setConnectionStatus("Participant left");
    };
    
    // Get existing participants
    get(participantsRef).then((snapshot) => {
      if (snapshot.exists()) {
        const participantsData = snapshot.val();
        
        Object.entries(participantsData).forEach(([id, data]) => {
          if (id !== user.uid) {
            console.log(`Existing participant: ${id}`, data);
            setParticipants(prev => ({
              ...prev,
              [id]: data
            }));
            
            // Create connection to existing participant
            createPeerConnection(id, true);
          }
        });
        
        setConnectionStatus("Connected to existing participants");
      } else {
        setConnectionStatus("No other participants yet");
      }
    }).catch(err => {
      console.error("Error getting participants:", err);
      setConnectionStatus("Error getting participants");
    });
    
    // Set up listeners
    const newParticipantListener = onChildAdded(participantsRef, handleNewParticipant);
    const participantLeftListener = onChildRemoved(participantsRef, handleParticipantLeft);
    
    return () => {
      newParticipantListener();
      participantLeftListener();
    };
  }, [roomId, user, localStream]);
  
  // WebRTC Signaling
  useEffect(() => {
    if (!user || !localStream) return;
    
    console.log("Setting up WebRTC signaling listeners...");
    setConnectionStatus("Setting up WebRTC signaling");
    
    // Listen for offers
    const handleOffer = (snapshot) => {
      const data = snapshot.val();
      
      console.log("Received potential offer data:", data);
      
      // Check if this offer is for us
      if (!data || data.target !== user.uid) return;
      
      console.log(`Received offer from ${data.sender}:`, data);
      setConnectionStatus(`Received offer from ${data.sender}`);
      
      // Enhanced validation
      if (!data.offer) {
        console.error("Offer is missing in the data:", data);
        setConnectionStatus("Invalid offer received");
        return;
      }
      
      if (!data.offer.type) {
        console.error("Offer type is missing:", data.offer);
        setConnectionStatus("Invalid offer format");
        return;
      }
      
      // Create or get peer connection
      const pc = createPeerConnection(data.sender, false);
      
      // Set remote description with validation
      pc.setRemoteDescription(new RTCSessionDescription(data.offer))
        .then(() => {
          console.log(`Creating answer for ${data.sender}`);
          setConnectionStatus(`Creating answer for ${data.sender}`);
          return pc.createAnswer();
        })
        .then(answer => {
          console.log(`Setting local description for ${data.sender}`);
          return pc.setLocalDescription(answer);
        })
        .then(() => {
          console.log(`Sending answer to ${data.sender}`);
          setConnectionStatus(`Sending answer to ${data.sender}`);
          
          // Make sure the answer is properly serialized
          const answerData = JSON.parse(JSON.stringify(pc.localDescription));
          
          // Send answer
          const answerRef = push(ref(rtdb, `calls/${roomId}/answers`));
          set(answerRef, {
            sender: user.uid,
            target: data.sender,
            answer: answerData
          });
        })
        .catch(error => {
          console.error("Error handling offer:", error);
          setConnectionStatus(`Error handling offer: ${error.message}`);
        });
    };
    
    // Listen for answers
    const handleAnswer = (snapshot) => {
      const data = snapshot.val();
      
      console.log("Received potential answer data:", data);
      
      // Check if this answer is for us and validate
      if (!data || data.target !== user.uid) return;
      
      console.log(`Received answer from ${data.sender}:`, data);
      setConnectionStatus(`Received answer from ${data.sender}`);
      
      // Enhanced validation
      if (!data.answer) {
        console.error("Answer is missing in the data:", data);
        setConnectionStatus("Invalid answer received");
        return;
      }
      
      if (!data.answer.type) {
        console.error("Answer type is missing:", data.answer);
        setConnectionStatus("Invalid answer format");
        return;
      }
      
      const pc = peerConnectionsRef.current[data.sender];
      if (!pc) {
        console.error(`No peer connection found for ${data.sender}`);
        setConnectionStatus(`No peer connection for ${data.sender}`);
        return;
      }
      
      pc.setRemoteDescription(new RTCSessionDescription(data.answer))
        .then(() => {
          console.log(`Successfully set remote description for ${data.sender}`);
          setConnectionStatus(`Connection established with ${data.sender}`);
        })
        .catch(error => {
          console.error("Error setting remote description:", error);
          setConnectionStatus(`Error with remote description: ${error.message}`);
        });
    };
    
    // Listen for ICE candidates - IMPROVED HANDLING
    const handleCandidate = (snapshot) => {
      const data = snapshot.val();
      
      console.log("Received potential ICE candidate:", data);
      
      // Check if this candidate is for us
      if (!data || data.target !== user.uid) return;
      
      console.log(`Received ICE candidate from ${data.sender}:`, data);
      
      const pc = peerConnectionsRef.current[data.sender];
      if (!pc) {
        console.error(`No peer connection found for ${data.sender}`);
        return;
      }
      
      // Skip if connection is closed
      if (pc.signalingState === "closed") {
        console.warn("Cannot add ICE candidate, connection is closed");
        return;
      }
      
      try {
        // Check different possible structures for the candidate
        if (data.candidate && typeof data.candidate === 'object') {
          // Standard structure
          pc.addIceCandidate(new RTCIceCandidate(data.candidate))
            .then(() => {
              console.log(`Added ICE candidate from ${data.sender}`);
            })
            .catch(error => {
              console.error("Error adding ICE candidate:", error);
            });
        } else if (data.candidate && typeof data.candidate === 'string') {
          // Sometimes candidates are serialized as strings
          const candidateObj = JSON.parse(data.candidate);
          pc.addIceCandidate(new RTCIceCandidate(candidateObj))
            .then(() => {
              console.log(`Added parsed ICE candidate from ${data.sender}`);
            })
            .catch(error => {
              console.error("Error adding parsed ICE candidate:", error);
            });
        } else if (data.sdpMid || data.sdpMLineIndex || data.candidate) {
          // Some systems put the candidate properties at the root level
          pc.addIceCandidate(new RTCIceCandidate({
            sdpMid: data.sdpMid,
            sdpMLineIndex: data.sdpMLineIndex,
            candidate: data.candidate
          }))
            .then(() => {
              console.log(`Added root-level ICE candidate from ${data.sender}`);
            })
            .catch(error => {
              console.error("Error adding root-level ICE candidate:", error);
            });
        } else {
          console.warn("ICE candidate data is in an unrecognized format:", data);
        }
      } catch (err) {
        console.error("Exception handling ICE candidate:", err);
      }
    };
    
    // Set up listeners
    const offersRef = ref(rtdb, `calls/${roomId}/offers`);
    const answersRef = ref(rtdb, `calls/${roomId}/answers`);
    const candidatesRef = ref(rtdb, `calls/${roomId}/candidates`);
    
    const offerListener = onChildAdded(offersRef, handleOffer);
    const answerListener = onChildAdded(answersRef, handleAnswer);
    const candidateListener = onChildAdded(candidatesRef, handleCandidate);
    
    return () => {
      offerListener();
      answerListener();
      candidateListener();
    };
  }, [roomId, user, localStream]);
  
  // Helper to create a peer connection
  const createPeerConnection = (participantId, isInitiator) => {
    console.log(`Creating ${isInitiator ? 'initiator' : 'receiver'} peer connection to ${participantId}`);
    
    // Don't create duplicate connections
    if (peerConnectionsRef.current[participantId]) {
      return peerConnectionsRef.current[participantId];
    }
    
    // Create new connection
    const pc = new RTCPeerConnection(configuration);
    peerConnectionsRef.current[participantId] = pc;
    
    // Add local tracks
    localStream.getTracks().forEach(track => {
      console.log(`Adding ${track.kind} track to connection with ${participantId}`);
      pc.addTrack(track, localStream);
    });
    
    // Handle ICE candidates - IMPROVED
    pc.onicecandidate = (event) => {
      if (!event.candidate) return;
      
      console.log(`Generated ICE candidate for ${participantId}:`, event.candidate);
      
      // Ensure the candidate is serializable
      const candidateJson = JSON.parse(JSON.stringify(event.candidate));
      
      // Send candidate to peer
      const candidateRef = push(ref(rtdb, `calls/${roomId}/candidates`));
      set(candidateRef, {
        sender: user.uid,
        target: participantId,
        candidate: candidateJson
      }).catch(err => {
        console.error("Error sending ICE candidate:", err);
      });
    };
    
    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log(`Connection state with ${participantId} changed to: ${pc.connectionState}`);
      setConnectionStatus(`Connection state: ${pc.connectionState}`);
      
      if (pc.connectionState === 'connected') {
        console.log(`Successfully connected to ${participantId}`);
        setConnectionStatus(`Connected to ${participantId}`);
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        console.log(`Connection to ${participantId} was lost, cleaning up`);
        setConnectionStatus(`Lost connection to ${participantId}`);
        
        pc.close();
        delete peerConnectionsRef.current[participantId];
        
        // Update UI
        setRemoteStreams(prev => {
          const newStreams = {...prev};
          delete newStreams[participantId];
          return newStreams;
        });
      }
    };
    
    // Handle ICE connection state changes
    pc.oniceconnectionstatechange = () => {
      console.log(`ICE connection state with ${participantId} changed to: ${pc.iceConnectionState}`);
      
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        console.log(`ICE connection established with ${participantId}`);
        setConnectionStatus(`ICE connected to ${participantId}`);
      } else if (pc.iceConnectionState === 'failed') {
        console.log(`ICE connection to ${participantId} failed, attempting restart`);
        setConnectionStatus(`ICE failed with ${participantId}, restarting`);
        // Attempt to restart ICE
        pc.restartIce();
      }
    };
    
    // Add ICE connection state logging
    pc.onicegatheringstatechange = () => {
      console.log(`ICE gathering state for ${participantId} changed to: ${pc.iceGatheringState}`);
    };
    
    // Handle remote streams
    pc.ontrack = (event) => {
      console.log(`Received track from ${participantId}:`, event.track.kind);
      setConnectionStatus(`Received ${event.track.kind} from ${participantId}`);
      
      // Store the remote stream
      setRemoteStreams(prev => ({
        ...prev,
        [participantId]: event.streams[0]
      }));
    };
    
    // Create and send an offer if we're the initiator
    if (isInitiator) {
      console.log(`Creating offer for ${participantId}`);
      setConnectionStatus(`Creating offer for ${participantId}`);
      
      // Fix: Wait for all ICE candidates before sending offer
      let iceCandidatesComplete = false;
      
      // Track when ICE gathering is complete
      const originalIceGatheringHandler = pc.onicegatheringstatechange;
      pc.onicegatheringstatechange = () => {
        originalIceGatheringHandler();
        console.log(`ICE gathering state for ${participantId}: ${pc.iceGatheringState}`);
        if (pc.iceGatheringState === 'complete') {
          iceCandidatesComplete = true;
        }
      };
      
      pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      })
        .then(offer => {
          console.log(`Setting local description for ${participantId}`);
          return pc.setLocalDescription(offer);
        })
        .then(() => {
          // Wait for ICE gathering to complete or timeout after 5 seconds
          const waitForIceCandidates = new Promise((resolve) => {
            const checkState = () => {
              if (iceCandidatesComplete) {
                resolve();
              } else if (pc.iceGatheringState === 'complete') {
                iceCandidatesComplete = true;
                resolve();
              }
            };
            
            // Check immediately
            checkState();
            
            // Also set up an interval to check
            const interval = setInterval(checkState, 500);
            
            // And set a timeout to ensure we don't wait forever
            setTimeout(() => {
              clearInterval(interval);
              resolve();
            }, 5000);
          });
          
          return waitForIceCandidates;
        })
        .then(() => {
          // Make sure local description is set and valid before sending
          if (pc.localDescription && pc.localDescription.type && pc.localDescription.sdp) {
            console.log(`Sending offer to ${participantId}`);
            setConnectionStatus(`Sending offer to ${participantId}`);
            
            const offerRef = push(ref(rtdb, `calls/${roomId}/offers`));
            
            // Create a deep copy of the offer to ensure it's fully serialized
            const offerData = JSON.parse(JSON.stringify(pc.localDescription));
            
            set(offerRef, {
              sender: user.uid,
              target: participantId,
              offer: offerData
            }).catch(err => {
              console.error("Error sending offer:", err);
              setConnectionStatus(`Error sending offer: ${err.message}`);
            });
          } else {
            console.error("Local description not set or invalid, cannot send offer:", pc.localDescription);
            setConnectionStatus("Local description invalid");
          }
        })
        .catch(error => {
          console.error("Error creating offer:", error);
          setConnectionStatus(`Error creating offer: ${error.message}`);
        });
    }
    
    return pc;
  };

  // UI Controls
  const toggleMute = () => {
    console.log(`Toggling audio: ${isMuted ? 'unmuting' : 'muting'}`);
    
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    console.log(`Toggling video: ${isVideoOff ? 'enabling' : 'disabling'}`);
    
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = isVideoOff;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const shareScreen = async () => {
    if (isScreenSharing) {
      console.log("Stopping screen sharing");
      
      if (screenTrackRef.current) {
        screenTrackRef.current.stop();
      }

      try {
        const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const cameraTrack = cameraStream.getVideoTracks()[0];

        // Replace track in all peer connections
        Object.values(peerConnectionsRef.current).forEach((pc) => {
          const senders = pc.getSenders();
          const sender = senders.find(s => s.track && s.track.kind === "video");
          if (sender) {
            console.log("Replacing screen track with camera track in peer connection");
            sender.replaceTrack(cameraTrack);
          }
        });

        // Replace in local preview
        const oldVideoTracks = localStream.getVideoTracks();
        if (oldVideoTracks.length > 0) {
          localStream.removeTrack(oldVideoTracks[0]);
        }
        localStream.addTrack(cameraTrack);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }

        setIsScreenSharing(false);
      } catch (error) {
        console.error("Error switching back to camera:", error);
        alert("Failed to switch back to camera. Please refresh the page.");
      }
    } else {
      console.log("Starting screen sharing");
      
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
          video: { cursor: "always" },
          audio: false
        });
        const screenTrack = screenStream.getVideoTracks()[0];
        screenTrackRef.current = screenTrack;

        // Replace track in all peer connections
        Object.values(peerConnectionsRef.current).forEach((pc) => {
          const senders = pc.getSenders();
          const sender = senders.find(s => s.track && s.track.kind === "video");
          if (sender) {
            console.log("Replacing camera track with screen track in peer connection");
            sender.replaceTrack(screenTrack);
          }
        });

        // Replace in local preview
        const oldVideoTracks = localStream.getVideoTracks();
        if (oldVideoTracks.length > 0) {
          localStream.removeTrack(oldVideoTracks[0]);
        }
        localStream.addTrack(screenTrack);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        setIsScreenSharing(true);

        // Handle when user stops sharing via browser UI
        screenTrack.onended = () => {
          console.log("Screen sharing stopped via browser UI");
          shareScreen(); // Will toggle back to camera
        };
      } catch (error) {
        console.error("Error sharing screen:", error);
        alert("Failed to share screen. Please check permissions.");
      }
    }
  };

  const leaveCall = () => {
    console.log("Leaving call");
    
    // Close all peer connections
    Object.values(peerConnectionsRef.current).forEach(pc => {
      console.log("Closing peer connection");
      pc.close();
    });
    
    // Stop all local tracks
    if (localStream) {
      localStream.getTracks().forEach(track => {
        console.log(`Stopping track: ${track.kind}`);
        track.stop();
      });
    }
    
    // Remove from participants
    if (user) {
      remove(ref(rtdb, `calls/${roomId}/participants/${user.uid}`));
    }
    
    // Notify parent component
    onLeaveCall();
  };

  // Manual connection retry
  const retryConnections = () => {
    console.log("Manually retrying connections");
    setConnectionStatus("Manually retrying connections");
    
    // Close existing connections
    Object.entries(peerConnectionsRef.current).forEach(([id, pc]) => {
      pc.close();
    });
    
    // Reset connections
    peerConnectionsRef.current = {};
    
    // Reset remote streams
    setRemoteStreams({});
    
    // Reestablish connections with all participants
    Object.keys(participants).forEach(id => {
      createPeerConnection(id, true);
    });
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen flex flex-col items-center text-white">
      <h2 className="text-2xl font-bold bg-gray-800 px-4 py-2 rounded-lg shadow-md">Room ID: {roomId}</h2>
      
      <div className="mt-4 text-sm bg-gray-800 p-2 rounded-lg">
        <p>Status: {connectionStatus}</p>
        <p>Participants: {Object.keys(participants).length + (user ? 1 : 0)}</p>
        <p>Remote streams: {Object.keys(remoteStreams).length}</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 w-full max-w-4xl">
        <div className="relative w-full md:w-1/3">
          <video 
            ref={localVideoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full rounded-xl border-2 border-gray-700 shadow-lg" 
          />
          <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-sm px-2 py-1 rounded-md">
            You {isMuted ? "(Muted)" : ""} {isVideoOff ? "(Video Off)" : ""}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
          {Object.keys(remoteStreams).map(participantId => (
            <div key={participantId} className="relative bg-gray-800 rounded-xl p-2 shadow-lg">
              <RemoteVideo 
                stream={remoteStreams[participantId]} 
                participantName={participants[participantId]?.displayName || participantId}
              />
            </div>
          ))}
          
          {/* Show placeholder if no remote streams */}
          {Object.keys(remoteStreams).length === 0 && (
            <div className="flex items-center justify-center h-32 bg-gray-800 rounded-xl p-2">
              <p className="text-gray-400">Waiting for others to join...</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-4">
        <button 
          onClick={toggleMute} 
          className={`px-4 py-2 rounded-lg ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
        >
          {isMuted ? "Unmute" : "Mute"}
        </button>
        <button 
          onClick={toggleVideo} 
          className={`px-4 py-2 rounded-lg ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-yellow-500 hover:bg-yellow-600'}`}
        >
          {isVideoOff ? "Turn Video On" : "Turn Video Off"}
        </button>
        <button 
          onClick={shareScreen} 
          className={`px-4 py-2 rounded-lg ${isScreenSharing ? 'bg-green-700 hover:bg-green-800' : 'bg-green-500 hover:bg-green-600'}`}
        >
          {isScreenSharing ? "Stop Sharing" : "Share Screen"}
        </button>
        <button 
          onClick={retryConnections} 
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
        >
          Retry Connections
        </button>
        <button 
          onClick={leaveCall} 
          className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg"
        >
          Leave Call
        </button>
      </div>
    </div>
  );
}