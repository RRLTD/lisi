require('dotenv').config()
const HyperExpress = require('hyper-express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const webserver = new HyperExpress.Server();

const db = require('./lib/database');

webserver.use(cors({ origin: 'http://localhost:3010' }));

webserver.options('*', (request, response) => {
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    response.send();
});

webserver.post('/auth/login', async (request, response) => {
    const body = await request.json()
    if (await db.users.verifyPassword(body.email, body.password) === true) {
        const user = await db.users.get(body.email);
        let user_raw = await db.users.get(body.email);
        user_raw.password = null;
        const token = jwt.sign({ user: user_raw }, user.password);
        response.status(200).json({ success: true, token: token });
    } else {
        response.status(500).json({ error: "Invalid username or password" });
    }
});

webserver.get('/auth/me', async (request, response) => {
    if (!request.headers.authorization) return response.status(500).json({ error: "Authorization header not found" })
    const decoded = jwt.decode(request.headers.authorization)
    if (!decoded) return response.status(403).json({ error: "Unauthorized" })
    let user = await db.users.getById(decoded.user._id)
    if (!user) return response.status(403).json({ error: "Unauthorized" })
    user.password = null
    return response.json({ user })
});

webserver.get('/songs', async (request, response) => {
    if (!request.headers.authorization) return response.status(500).json({ error: "Authorization header not found" })
    const decoded = jwt.decode(request.headers.authorization)
    if (!decoded) return response.status(403).json({ error: "Unauthorized" })
    if (!(await db.users.getById(decoded.user._id))) return response.status(403).json({ error: "Unauthorized" })
    return response.json({ songs: await db.songs.getAll() })
});

webserver.get('/song/:id', async (request, response) => {
    if (!request.headers.authorization) return response.status(500).json({ error: "Authorization header not found" })
    const decoded = jwt.decode(request.headers.authorization)
    if (!decoded) return response.status(403).json({ error: "Unauthorized" })
    if (!(await db.users.getById(decoded.user._id))) return response.status(403).json({ error: "Unauthorized" })
    return response.json({ song: await db.songs.get(request.params.id) })
});

webserver.listen(3000)
    .then((socket) => console.log('Webserver started on port 3000'))
    .catch((error) => console.log('Failed to start webserver on port 3000'));