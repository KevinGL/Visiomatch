import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

let sessions = new Map();

wss.on('connection', (ws) =>
{
    console.log("Nouvelle connexion WebSocket");

    ws.on("message", (message) =>
    {
        const data = JSON.parse(message);

        const values = [data.age, data.orientation, data.region];
        const id = btoa(values.join("|"));

        if(!sessions.get(id))
        {
            const session =
            {
                age: data.age,
                orientation: data.orientation,
                region: data.region,
                date: parseInt(data.date),
                users: [data.user_id]
            }

            sessions.set(id, session);
        }

        else
        {
            let session = sessions.get(id);

            if(session.users.indexOf(data.user_id) == -1)
            {
                session.users.push(data.user_id);
                sessions.set(id, session);
            }
        }

        console.log(sessions);
        
        /*if(pair.length == 0)
        {
            pair.push(data.user_id);
            ws.send("Waiting");
        }

        else
        if(pair.length == 1 && pair.indexOf(data.user_id) == -1)
        {
            pair.push(data.user_id);
            ws.send("Start conversation");
        }*/
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
