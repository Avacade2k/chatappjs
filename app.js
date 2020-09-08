(function () {
  let peer = null;
  let conn = null;
  let mediaConn = null;
  const peerOnOpen = (id) => {
    document.querySelector(".my-peer-id").innerHTML = id;
  };

  const peerOnError = (err) => {
    console.log(err);
  };

  const myPeerId = location.hash.slice(1);
  console.log(myPeerId);

  const peerOnConnection = (dataConnection) => {
    conn && conn.close();
    conn = dataConnection;
    console.log(dataConnection);

    const event = new CustomEvent("peer-changed", {
      detail: { peerId: dataConnection.peer },
    });
    document.dispatchEvent(event);
    conn.on("data", (data) => {
      printMessage(data, "them");
      console.log(data);
    });
  };

  const connectToPeerClick = (el) => {
    const peerId = el.target.textContent;
    conn && conn.close();
    conn = peer.connect(peerId);
    conn.on("open", () => {
      console.log("connected");
      const event = new CustomEvent("peer-changed", {
        detail: { peerId: peerId },
      });
      document.dispatchEvent(event);
    });
  };

  const peerOnCall = (incomingCall) => {
    if (confirm(`Answer call from $(incomingCall.peer)?`)) {
      mediaConn && mediaConn.close();
      navigator.mediaDevices
        .getUserMedia({ audio: false, video: true })
        .then((myStream) => {
          mediaConn = incomingCall;
          incomingCall.answer(myStream);
          mediaConn.on("stream", mediaConnOnStream);
        });
    } else {
      console.log("not answered");
    }
  };

  function printMessage(message, writer) {
    const messageDiv = document.querySelector(".messages");
    const newMessageDiv = document.createElement("div");
    const messageWrapperDiv = document.createElement("div");
    newMessageDiv.innerText = message;
    messageWrapperDiv.classList.add("message");
    messageWrapperDiv.classList.add(writer);
    messageWrapperDiv.appendChild(newMessageDiv);
    messageDiv.appendChild(messageWrapperDiv);
  }

  peer = new Peer(myPeerId, {
    host: "glajan.com",
    port: 8443,
    path: "/myapp",
    secure: true,
    config: {
      iceServers: [
        { url: ["stun:eu-turn7.xirsys.com"] },
        {
          username:
            "1FOoA8xKVaXLjpEXov-qcWt37kFZol89r0FA_7Uu_bX89psvi8IjK3tmEPAHf8EeAAAAAF9NXWZnbGFqYW4=",
          credential: "83d7389e-ebc8-11ea-a8ee-0242ac140004",
          url: "turn:eu-turn7.xirsys.com:80?transport=udp",
        },
      ],
    },
  });

  peer.on("open", peerOnOpen);
  peer.on("error", peerOnError);
  peer.on("connection", peerOnConnection);
  peer.on("call", peerOnCall);

  navigator.mediaDevices
    .getUserMedia({ audio: false, video: true })
    .then((stream) => {
      const video = document.querySelector(".video-container.me video");
      video.muted = true;
      video.srcObject = stream;
    });

  document.querySelector(".new-message").addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      document.querySelector(".send-new-message-button").click();
    }
  });

  const mediaConnOnStream = (theirStream) => {
    const video = document.querySelector(".video-container.them video");
    video.srcObject = theirStream;
  };

  const startVideoCall = () => {
    console.log("start");
    const video = document.querySelector(".video-container.them");
    const peerId = video.querySelector(".name").innerText;
    const startButton = video.querySelector(".start");
    const stopButton = video.querySelector(".stop");
    startButton.classList.remove("active");
    stopButton.classList.add("active");

    navigator.mediaDevices
      .getUserMedia({ audio: false, video: true })
      .then((myStream) => {
        mediaConn = peer.call(peerId, myStream);
        mediaConn.on("stream", mediaConnOnStream);
      });
  };

  const stopVideoCall = () => {
    console.log("video stop");
    const video = document.querySelector(".video-container.them");
    const startButton = video.querySelector(".start");
    const stopButton = video.querySelector(".stop");
    stopButton.classList.remove("active");
    startButton.classList.add("active");
  };

  document
    .querySelector(".video-container.them .start")
    .addEventListener("click", startVideoCall);

  document
    .querySelector(".video-container.them .stop")
    .addEventListener("click", stopVideoCall);

  document
    .querySelector(".list-all-peers-button")
    .addEventListener("click", () => {
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
    video.querySelector(".name").innerText = peerId;
    video.querySelector(".stop").classList.remove("active");
    video.querySelector(".start").classList.add("active");
  });

  document
    .querySelector(".send-new-message-button")
    .addEventListener("click", () => {
      let message = document.querySelector(".new-message").value;
      conn.send(message);
      console.log(message);
      printMessage(message, "me");
      document.querySelector(".new-message").innerText = "";
    });
})();
