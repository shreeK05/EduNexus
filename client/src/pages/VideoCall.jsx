import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, ShieldCheck, Zap, Activity } from 'lucide-react';

const VideoCall = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [isInitializing, setIsInitializing] = useState(true);

  const user = JSON.parse(localStorage.getItem('userInfo'));
  const userName = user ? user.name : 'Guest';
  const userId = user ? user._id : `guest_${Date.now()}`;

  useEffect(() => {
    // Initial delay to show the premium loading sequence
    const timer = setTimeout(() => setIsInitializing(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const myMeeting = async (element) => {
    if (!element) return;
    
    const appID = 1255357670; 
    const serverSecret = "241ac68422c401b9993e12365ddf9236"; 

    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomId,
      userId,
      userName
    );

    const zp = ZegoUIKitPrebuilt.create(kitToken);

    zp.joinRoom({
      container: element,
      sharedLinks: [
        {
          name: 'Class Link',
          url: window.location.href,
        },
      ],
      scenario: {
        mode: ZegoUIKitPrebuilt.VideoConference,
      },
      showScreenSharingButton: true,
      onLeaveRoom: async () => {
        if (user && user.role === 'TEACHER') {
          try {
            await axios.put(`https://edunexus-api-w6xc.onrender.com/api/classes/${roomId}/live`, { isLive: false }, {
              headers: { Authorization: `Bearer ${user.token}` }
            });
          } catch (err) { console.error("Failed to end class", err); }
        }
        window.close();
      },
    });
  };

  return (
    <div className="w-full h-screen bg-[#020617] flex items-center justify-center overflow-hidden">
      
      <AnimatePresence>
        {isInitializing && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#020617]"
          >
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full animate-pulse"></div>

            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative"
            >
              <div className="w-24 h-24 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Video className="text-indigo-400" size={32} />
              </div>
            </motion.div>

            <div className="mt-12 text-center space-y-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-[0.2em] flex items-center gap-4 justify-center">
                Neural <span className="text-indigo-500">Sync</span>
              </h2>
              <div className="flex items-center gap-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <span className="flex items-center gap-2"><ShieldCheck size={14} className="text-emerald-500" /> Secure Link</span>
                <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
                <span className="flex items-center gap-2"><Activity size={14} className="text-indigo-500" /> P2P Encrypted</span>
                <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
                <span className="flex items-center gap-2"><Zap size={14} className="text-amber-500" /> Real-time</span>
              </div>
            </div>

            <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
              <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.5em] animate-pulse">Initializing Virtual Classroom Environment</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Meeting Container */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="w-full h-full"
        ref={myMeeting}
      />

    </div>
  );
};

export default VideoCall;