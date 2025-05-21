import crypto from "crypto";

const SECRET_KEY: string = "#Ge*wLajd/aln5)I(rQbf6hSa_B(wr:4";

export function generateId(...args): string
{
    const data = args.join("|");
    const cipher = crypto.createCipher("aes-256-ctr", SECRET_KEY);
    return cipher.update(data, "utf8", "hex") + cipher.final("hex");
}

export function decodeId(id: string): string[]
{
    const decipher = crypto.createDecipher("aes-256-ctr", SECRET_KEY);
    const decrypted = decipher.update(id, "hex", "utf8") + decipher.final("utf8");
    return decrypted.split("|");
}

export function startWebRTC(ws: WebSocket, role: string, peerConnection : RTCPeerConnection)
{
    console.log("Lancement web RTC");
}