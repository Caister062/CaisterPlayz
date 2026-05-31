const pc = new RTCPeerConnection({
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" }
  ]
});

const stream = await navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
});

stream.getTracks().forEach(track => {
  pc.addTrack(track, stream);
});

const streamRecord = await pb.collection('cplayz_streams').create({
  title: `${user.displayName}'s Stream`,
  hostid: user.id,
  isLive: true,
  viewerCount: 0
});

const offer = await pc.createOffer();

await pc.setLocalDescription(offer);

await pb.collection('cplayz_signals').create({
  streamId: streamRecord.id,
  senderId: user.id,
  receiverId: '',
  type: 'offer',
  payload: JSON.stringify(offer)
});
