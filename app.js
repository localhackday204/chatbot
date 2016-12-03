// JavaScript source code
var restify = require('restify');
var builder = require('botbuilder')
//setup restify server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

//create chatbot
var connector = new builder.ChatConnector({
    appId: process.env.MSappID,
    appPassword: process.env.MSappPassword
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());
var intents = new builder.IntentDialog();
bot.dialog('/', intents);

//bot dialogues
intents.matches(/^play music/i, [
        function (session) {
            session.send('Stop there, and let me correct it, I wanna live my life from a new perspective.');
        }
]);
intents.matches(/^play stabilo/i, [
    function (session) {
        session.send('Because I lied, not because I want to, but because I need to all the tiiiiime');
    }
])
intents.matches(/^change name/i, [
    function (session) {
        session.beginDialog('/profile');
    },
    function (session, results) {
        session.send('Ok... Changed your name to %s', session.userData.name);
    }
]);
intents.onDefault([
    function (session, args, next) {
        if (!session.userData.name) {
            session.beginDialog('/profile');
        } else {
            next();
        }
    },
    function (session, results) {
        session.send('Hello %s!', session.userData.name);
    }
]);

bot.dialog('/profile', [
    function (session) {
        builder.Prompts.text(session, 'Hi! What is your name?');
    },
    function (session, results) {
        session.userData.name = results.response;
        session.endDialog();
    }
]);

