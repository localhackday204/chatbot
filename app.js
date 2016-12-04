// JavaScript source code
var restify = require('restify');
var builder = require('botbuilder')
var http = require('http')
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
var rando = 0;
var timer = 0;
var endTime = 0;
var data = '';
var wins = 0;
var secretWord = '';

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}
function randomWord() {
    var wordList = ["string", "happy", "apple", "fresh", "proxy", "mouse", "crash", "scare", "pizza", "trees"]
    var selector = Math.round(wordList.length * Math.random());
    return wordList[selector];
}
function secretWordMaker() {
    var wordList = ["people", "laptop", "charge", "jackal", "puzzle", "wizard", "jinxed", "jumble", "garden", "bounce"]
    var selector = Math.round(wordList.length * Math.random());
    return wordList[selector];

}
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


intents.matches(/^play$/i, [


    function (session) {
        session.send("Remember: All answers must be lowercase!");
        wins = 0;
        data = randomWord();
        var letters = data.split("");
        var shuffled = shuffle(letters);
        builder.Prompts.text(session, ('Solve the anagram: ' + shuffled.join("")))
        timer = Date.now();
    },

    function (session, results) {
        endTime = Date.now();
        if (endTime - timer > 10000)
            session.send('Too Slow!');
        else if (results.response == data) {
            session.send('Correct!');
            wins++
        }
        else
            session.send('Wrong!');

        data = '';
        session.beginDialog('/opposites');
        
    }
]);




   
bot.dialog('/opposites', [
     function (session) {
         builder.Prompts.text(session, 'Enter the opposite!')
         rando = Math.round(3 * Math.random());
         if (rando == 0)
             session.send('left');
         if (rando == 1)
             session.send('right');
         if (rando == 2)
             session.send('forwards');
         if (rando == 3)
             session.send('backwards');
         var count = 0;
         timer = Date.now();
     },
    function (session, results) {
        endTime = Date.now();
        wins++
        if (endTime - timer > 10000) {
            session.send('Too Slow!');
            wins--;
        }
        else if ((rando == 0) && (results.response == "right"))
            session.send('Correct!');
        else if (rando == 1 && results.response == "left")
            session.send('Correct!');
        else if (rando == 2 && results.response == "backwards")
            session.send('Correct!');
        else if (rando == 3 && results.response == "forwards")
            session.send('Correct!');
        else {
            session.send('Wrong!');
            wins--;
        }
        session.beginDialog('/missingLetters');
        
    }
]);

bot.dialog('/missingLetters', [
    function (session) {
        secretWord = secretWordMaker();
        var letters = secretWord.split("");
        var remove1 = Math.round(letters.length * Math.random());
        var remove2 = -1;
        do {
            remove2 = Math.round(letters.length * Math.random());
        } while (remove2 == remove1 || remove2 < 0 || remove2 >letters.length);
        letters[remove1] = "%";
        letters[remove2] = "%";
        builder.Prompts.text(session, "Enter the secret word: " + letters.join(""));
    },
    function(session, results){
        if (endTime - timer > 10000)
            session.send('Too Slow!');
        else if (results.response == secretWord) {
            session.send('Correct!');
            wins++
        }
        else
            session.send('Wrong!');
        session.send("You won " + wins + "/3 games!");
        session.endDialog();


    }

    
])
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


