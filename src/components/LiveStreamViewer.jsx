const pc = new RTCPeerConnection({
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" }
  ]
});

pc.ontrack = (event) => {
  videoRef.current.srcObject = event.streams[0];
};
