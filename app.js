(function () {
  let peer = null;
  let conn = null;
  let mediaConn = null;
  let time;
  const input = document.querySelector(".new-message");
  const peerOnOpen = (id) => {
    document.querySelector(".my-peer-id").innerHTML = id;
  };

  const peerOnError = (err) => {
    console.log(err);
  };

  const mediaSuccess = (stream) => {
    const video = document.querySelector(".video-container.me video");
    video.muted = true;
    video.srcObject = stream;
  };

  const mediaFail = () => {
    console.error("failed to get media");
  };

  const theirStream = (theirStream) => {
    const video = document.querySelector(".video-container.them video");
    video.muted = true;
    console.log("their stream");
    video.srcObject = theirStream;
  };

  const startVideoCall = () => {
    const video = document.querySelector(".video-container.them");
    const startButton = video.querySelector(".start");
    const stopButton = video.querySelector(".stop");
    startButton.classList.remove("active");
    stopButton.classList.add("active");

    navigator.mediaDevices
      .getUserMedia({ audio: false, video: true })
      .then((myStream) => {
        mediaConn && mediaConn.close();
        console.log(conn.peer);
        mediaConn = peer.call(conn.peer, myStream);
        mediaConn.on("stream", theirStream);
      });
  };

  document
    .querySelector(".video-container.them .start")
    .addEventListener("click", startVideoCall);

  const stopVideoCall = () => {
    mediaConn && mediaConn.close();
    console.log("stop");
    const video = document.querySelector(".video-container.them");
    const startButton = video.querySelector(".start");
    const stopButton = video.querySelector(".stop");
    startButton.classList.add("active");
    stopButton.classList.remove("active");
    video.querySelector("video");
  };

  document
    .querySelector(".video-container.them .stop")
    .addEventListener("click", stopVideoCall);

  function printMessage(message, writer) {
    const messagesDiv = document.querySelector(".messages");
    const messageWrapper = document.createElement("div");
    const newMessageDiv = document.createElement("div");
    newMessageDiv.innerText = message + time;
    messageWrapper.classList.add("message");
    messageWrapper.classList.add(writer);
    messageWrapper.appendChild(newMessageDiv);
    messagesDiv.appendChild(messageWrapper);
    messagesDiv.scrollTo(0, messagesDiv.scrollHeight);
  }

  const myPeerId = location.hash.slice(1);
  console.log(myPeerId);

  const refresh = () => {
    const peersEl = document.querySelector(".peers");
    peersEl.firstChild && peersEl.firstChild.remove();
    peer.listAllPeers((peers) => {
      const ul = document.createElement("ul");
      peers
        .filter((peerId) => peerId !== myPeerId)
        .forEach((peerId) => {
          const li = document.createElement("li");
          const button = document.createElement("button");
          button.innerText = peerId;
          button.classList.add("connect-button");
          button.classList.add(`peerId-${peerId}`);
          button.addEventListener("click", connectToPeerClick);
          li.appendChild(button);
          ul.appendChild(li);
        });
      peersEl.appendChild(ul);
    });
  };

  const peerOnCall = (incomingCall) => {
    mediaConn && mediaConn.close();
    navigator.mediaDevices
      .getUserMedia({ audio: false, video: true })
      .then((myStream) => {
        mediaConn = incomingCall;
        incomingCall.answer(myStream);
        mediaConn.on("stream", theirStream);
      });
  };

  async function peerOnConnection(dataConnection) {
    refresh();
    await new Promise((r) => setTimeout(r, 2000));
    conn && conn.close();
    conn = dataConnection;
    console.log(dataConnection);

    conn.on("data", (data) => {
      let d = new Date();
      time = " /" + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
      printMessage(data, "them");
      console.log(data);
    });

    const event = new CustomEvent("peer-changed", {
      detail: { peerId: dataConnection.peer },
    });
    document.dispatchEvent(event);
  }

  const connectToPeerClick = (el) => {
    console.log("connecting...");
    const peerId = el.target.textContent;
    conn && conn.close();
    conn = peer.connect(peerId);
    console.log("connecting...");
    conn.on("open", () => {
      console.log("connected");
      const event = new CustomEvent("peer-changed", {
        detail: { peerId: peerId },
      });
      document.dispatchEvent(event);

      conn.on("data", (data) => {
        let d = new Date();
        time =
          " /" + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
        printMessage(data, "them");
      });
    });
  };

  peer = new Peer(myPeerId, {
    host: "glajan.com",
    port: 8443,
    path: "/myapp",
    secure: true,
    /*config: {
       iceServers: [
         { url: ["stun:eu-turn7.xirsys.com"] },
         {
           username:
             "1FOoA8xKVaXLjpEXov-qcWt37kFZol89r0FA_7Uu_bX89psvi8IjK3tmEPAHf8EeAAAAAF9NXWZnbGFqYW4=",
           credential: "83d7389e-ebc8-11ea-a8ee-0242ac140004",
           url: "turn:eu-turn7.xirsys.com:80?transport=udp",
         },
       ],
     },*/
  });

  peer.on("open", peerOnOpen);
  peer.on("error", peerOnError);
  peer.on("connection", peerOnConnection);
  peer.on("call", peerOnCall);

  document
    .querySelector(".list-all-peers-button")
    .addEventListener("click", () => {
      refresh();
    });

  document.addEventListener("peer-changed", (e) => {
    const peerId = e.detail.peerId;
    console.log(peerId);
    let peerIdClass = ".peerId-" + peerId;
    document.querySelectorAll(".connect-button").forEach((el) => {
      el.classList.remove("connected");
    });
    document.querySelector(peerIdClass).classList.add("connected");

    const video = document.querySelector(".video-container.them");
    video.classList.add("connected");
    video.querySelector(".name").innerHTML = peerId;
    video.querySelector(".stop").classList.remove("active");
    video.querySelector(".start").classList.add("active");

    const mediaPromise = navigator.mediaDevices.getUserMedia({
      audio: false,
      video: true,
    });
    mediaPromise.then(mediaSuccess, mediaFail);
  });

  document
    .querySelector(".send-new-message-button")
    .addEventListener("click", () => {
      let message = document.querySelector(".new-message").value;
      conn.send(message);
      console.log(message);
      let d = new Date();
      time = " /" + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();

      printMessage(message, "me");
    });

  input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      document.querySelector(".send-new-message-button").click();
    }
  });
})();
