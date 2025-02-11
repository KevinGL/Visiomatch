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
                users: [ data.user ]
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
                session.users.push(data.user);
                sessions.set(data.session_id, session);
            }
        }

        //console.log(sessions);

        sessions.forEach((session, id) =>
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

                const index = Math.floor(Math.random() * interlocutors.length);

                //console.log(interlocutors.length, index);

                //MATCHING
                data.user.speak = true;
                //interlocutors[index].speak = true;

                data.user.already.push(interlocutors[index].id);
                //interlocutors[index].already.push(data.user.id);

                ws.send(JSON.stringify({ type: "match", sessionId: data.session_id, peerId: interlocutors[index].id, role: !interlocutors[index].speak ? "caller" : "callee" }));
            }
        });
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
