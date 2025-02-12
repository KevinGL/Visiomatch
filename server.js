import { WebSocketServer } from 'ws';
import crypto from "crypto";

function decodeId(id)
{
    const decipher = crypto.createDecipher("aes-256-ctr", "#Ge*wLajd/aln5)I(rQbf6hSa_B(wr:4");
    const decrypted = decipher.update(id, "hex", "utf8") + decipher.final("utf8");
    return decrypted.split("|");
}

const wss = new WebSocketServer({ port: 8080 });

let sessions = new Map();

wss.on('connection', (ws) =>
{
    console.log("Nouvelle connexion WebSocket");

    ws.on("message", (message) =>
    {
        const data = JSON.parse(message);

        if(data.type == "connect")
        {
            const values = decodeId(data.session_id)[0].split(",");

            //console.log(values);

            if(!sessions.get(data.session_id))
            {
                const session =
                {
                    age: values[0],
                    orientation: values[2],
                    region: values[3],
                    date: parseInt(values[1]),
                    users: [ {...data.user, clientSocket: ws} ]
                }

                sessions.set(data.session_id, session);
            }

            else
            {
                let session = sessions.get(data.session_id);

                const alReadyConnected = session.users.some((user) =>
                    {
                        //console.log(user.id, data.user.id);
                        
                        return(
                            user.id == data.user.id
                        )
                    }
                );

                //console.log(alReadyConnected);

                if(!alReadyConnected)
                {
                    session.users.push({...data.user, clientSocket: ws});
                    sessions.set(data.session_id, session);
                }
            }

            //console.log(sessions);

            sessions.forEach((session, sessionId) =>
            {
                if(session.users.length >= 2)
                {
                    //console.log(session.users);
                    let interlocutors = [];

                    if(session.orientation == "man_woman")
                    {
                        interlocutors = session.users.filter((interlocutor) =>
                        {
                            //console.log(interlocutor);
                            
                            return(interlocutor.gender != data.user.gender && !interlocutor.speak && data.user.already.indexOf(interlocutor.id) == -1);
                        });
                    }

                    else
                    {
                        //
                    }

                    //console.log(interlocutors);

                    if(interlocutors.length != 0)
                    {
                        const index = Math.floor(Math.random() * interlocutors.length);

                        //console.log(interlocutors.length, index);

                        //MATCHING
                        data.user.speak = true;
                        data.user.already.push(interlocutors[index].id);
                        
                        //ws.send(JSON.stringify({ type: "match", sessionId: data.session_id, peerId: interlocutors[index].id, role: !interlocutors[index].speak ? "caller" : "callee" }));

                        interlocutors[index].speak = true;
                        interlocutors[index].already.push(data.user.id);

                        ///////////////////////////

                        const peer1 = ws;
                        const peer2 = interlocutors[index].clientSocket;

                        peer1.sessionId = sessionId;
                        peer2.sessionId = sessionId;

                        peer1.peerId = data.user.id;
                        peer2.peerId = interlocutors[index].id;

                        peer1.send(JSON.stringify({ type: "match", sessionId, role: "caller", peerId: interlocutors[index].id }));
                        peer2.send(JSON.stringify({ type: "match", sessionId, role: "callee", peerId: data.user.id }));
                    }
                }
            });
        }

        else
        if(data.type == "offer")
        {
            //console.log(data);

            try
            {
                const interlocutor = findPeerById(data.peerId);

                interlocutor.send(JSON.stringify({ type: "offer", offer: data.offer }));
            }

            catch(err)
            {
                console.error("Error find interlocutor", err);
            }
        }
    });

    /*if (waitingUser)
    {
        // Associer l'utilisateur en attente avec le nouvel utilisateur
        const partner = waitingUser;
        waitingUser = null;

        const sessionId = Math.random().toString(36).substr(2, 9);

        partner.send(JSON.stringify({ type: "match", sessionId }));
        ws.send(JSON.stringify({ type: "match", sessionId }));

        console.log(`Match trouvé ! Session ID: ${sessionId}`);
    }
    else
    {
        // Pas d'utilisateur en attente, on stocke celui-ci
        waitingUser = ws;
        ws.send(JSON.stringify({ type: "waiting", message: "En attente d'un autre utilisateur..." }));
    }*/

    ws.on('close', () =>
    {
        /*if (waitingUser === ws)
        {
            waitingUser = null; // Libérer la place si l'utilisateur quitte avant le match
        }*/
    });
});

console.log("Serveur WebSocket en écoute sur ws://localhost:8080");

function findPeerById(peerId)
{
    //console.log(wss.clients);
    
    for (const client of wss.clients)
    {
        if (client.peerId === peerId)
        {
            return client;
        }
    }

    return null;
}