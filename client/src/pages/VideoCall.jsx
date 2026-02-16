import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import axios from 'axios';

const VideoCall = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('userInfo'));
  const userName = user ? user.name : 'Guest';
  const userId = user ? user._id : `guest_${Date.now()}`;

  const myMeeting = async (element) => {
    // =========================================================
    // 👇 PASTE YOUR REAL KEYS FROM ZEGO CLOUD CONSOLE HERE 👇
    // =========================================================
    const appID = 1255357670; // <--- REPLACE THIS NUMBER
    const serverSecret = "241ac68422c401b9993e12365ddf9236"; // <--- REPLACE THIS STRING
    // =========================================================

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

      // When Teacher leaves, turn OFF live status in DB
      onLeaveRoom: async () => {
        if (user && user.role === 'TEACHER') {
          try {
            await axios.put(`http://localhost:10000/api/classes/${roomId}/live`, { isLive: false }, {
              headers: { Authorization: `Bearer ${user.token}` }
            });
            console.log("Class Ended");
          } catch (err) { console.error("Failed to end class", err); }
        }
        window.close(); // Close the tab
      },
    });
  };

  return (
    <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
      <div ref={myMeeting} style={{ width: '100vw', height: '100vh' }}></div>
    </div>
  );
};

export default VideoCall;