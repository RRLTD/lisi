const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const { genSalt, hash, compare } = require('bcryptjs');
const { verify, decode } = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const saltRounds = 10;

let client;
let db;

if (!process.env.DATABASE_URI) {
    console.error('There is no connection URI set in webconfig.yml. Please set this.')
    process.exit(1);
} else {
    client = new MongoClient(process.env.DATABASE_URI);
    db = client.db(process.env.DATABASE);
}


const collection = db.collection("users");
const password = "123456";
genSalt(saltRounds, function (err, salt) {
    hash(password, salt, async function (err, hash) {
        console.log(err)
        console.log(hash)
        await collection.insertOne({
            email: "partner@learnitsignit.co.uk",
            firstName: "Learn It Sign It",
            lastName: "Partner",
            password: hash,
        });
    });
});


module.exports = {
    users: {
        get: async function (email) {
            return new Promise(async (resolve, reject) => {
                await client.connect();
                resolve(await db.collection('users').findOne({ email }));
            });
        },
        getById: async function (id) {
            return new Promise(async (resolve, reject) => {
                await client.connect();
                resolve(await db.collection('users').findOne({ _id: new ObjectId(id) }));
            });
        },
        getAll: async function () {
            return new Promise(async (resolve, reject) => {
                await client.connect();
                resolve(await db.collection('users').find({}).toArray());
            });
        },
        verifyPassword: async function (email, password) {
            return new Promise(async (resolve, reject) => {
                await client.connect();
                const collection = db.collection('users');
                const user = await collection.findOne({
                    email
                });
                if (!user) return resolve(false);
                compare(password, user.password, function (err, result) {
                    if (result === true) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                });
            });
        },
        create: async function (username, firstName, lastName, password) {
            return new Promise(async (resolve, reject) => {
                const collection = db.collection('users');
                const filteredDocs = await collection.findOne({
                    username: username
                });
                if (filteredDocs) {
                    reject('That username is already in use.');
                } else {
                    genSalt(saltRounds, function (err, salt) {
                        hash(password, salt, async function (err, hash) {
                            await collection.insertOne({
                                username,
                                firstName,
                                lastName,
                                password: hash,
                            });
                            resolve(true);
                        });
                    });
                }
            });
        },
        delete: async function (username) {
            return new Promise(async (resolve, reject) => {
                await client.connect()
                const collection = db.collection('users')
                await collection.deleteOne({ username });
                resolve(true);
            })
        },
        edit: async function (oldUsername, newUsername, firstName, lastName, password) {
            return new Promise(async (resolve, reject) => {
                await client.connect()
                const collection = db.collection('users')
                if (!password) {
                    await collection.updateOne({ username: oldUsername }, { $set: { username: newUsername, firstName, lastName } });
                } else {
                    genSalt(saltRounds, function (err, salt) {
                        hash(password, salt, async function (err, hash) {
                            await collection.updateOne({ username: oldUsername }, { $set: { username: newUsername, firstName, lastName, password: hash, token_id: randomBytes(64).toString('hex') } });
                        });
                    });
                }
                resolve(true)
            })
        },
    },
    songs: {
        get: async function (id) {
            return new Promise(async (resolve, reject) => {
                await client.connect();
                resolve(await db.collection('songs').findOne({ _id: new ObjectId(id) }));
            });
        },
        getAll: async function () {
            return new Promise(async (resolve, reject) => {
                await client.connect();
                resolve(await db.collection('songs').find({}).toArray());
            });
        },
    }
};
