(function () {
  let peer = null;
  let conn = null;
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
  });

  document
    .querySelector(".send-new-message-button")
    .addEventListener("click", () => {
      let message = document.querySelector(".new-message").value;
      conn.send(message);
      console.log(message);
      printMessage(message, "me");
    });
})();
