const peerOnOpen = (id) => {
    document.querySelector('.my-peer-id').innerHTML = id;
};

const myPeerId = location.hash.slice(1);
console.log(myPeerId);

const peerOnError = (error) => {
    console.log(error);
};

let peer = new Peer(myPeerId, {
    host:"glajan.com",
    port: 8443,
    path:"/myapp",
    secure: true,
});
peer.on("open", peerOnOpen);
peer.on("error", peerOnError);

document.querySelector('.list-all-peers-button').addEventListener('click', () => {
    const peersEl = document.querySelector('.peers');
    const ul = document.createElement('ul');
    peer.listAllPeers((peers) => {
        peers.filter((peerId) => peerId !== myPeerId)
        .forEach(peerId => {
            const li = document.createElement('li');
            const button = document.createElement('button');
            button.innerText = peerId;
            button.classList.add("connect-button");
            button.classList.add(`peerId-´$(peerId)`);
            li.appendChild(button);
            ul.appendChild(li);
        });
        console.log(peers);
        peersEl.appendChild(ul);
    });
});

let bruh = (a, b) => a + b;

function isEven(a) {
    return a % 2 == 0;
}
