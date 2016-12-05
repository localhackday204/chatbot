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
var bandFound = false;

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

var bandList = ["maroon 5", "beatles", "the beatles", "taylor swift", "billy joel", "michael jackson", "adele",
    "stabilo", "panic at the disco", "elton john", "green day", "eminem",
    "avenged sevenfold", "fall out boy", "barenaked ladies", "elvis", "elvis presley", "the police", "police",];
var badBandList = ["blood on the dance floor", "kidz bop", "mini pop kids","nicki minaj"]
var newBandList = [];
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

intents.matches(/^music/i, [
    function (session) {
        builder.Prompts.text(session, 'Who is your favourite  band or singer?')
    },
    function (session, results) {
        bandFound = false;
        if (results.response.toLowerCase() == "insane clown posse") {
            session.send("******* magnets man, how do they work?");
            bandFound = true;
        }
        if (results.response.toLowerCase() == "the shaggs") {
            session.send("On the one hand, I'm genuinely surprised that you're familiar with the shaggs, but on the other hand... really?");
            session.send("Your favourite?");
            bandFound = true;
        }
        for (var i = 0; i < bandList.length; i++) {
            if (results.response.toLowerCase() == bandList[i]) {
                session.send('Oh, I love them! You have excellent taste.');
                bandFound = true;
            }
        }
        for (var i = 0; i < badBandList.length; i++) {
            if (results.response.toLowerCase() == badBandList[i]) {
                session.send("Dude........seriously?");
                bandFound = true;
            }
        }
        for (var i = 0; i < newBandList.length; i++) {
            if (results.response.toLowerCase() == newBandList[i]) {
                session.send('Oh, I think you told me about them.');
                bandFound = true;
            }
        }
        if (!bandFound) {
            session.send('Hmm, I\'ve never heard of them...');
            newBandList.push(results.response.toLowerCase());
        }
    }

    
])


intents.matches(/^play$/i, [


    function (session) {

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
        else if (results.response.toLowerCase() == data) {
            session.send('Correct!');
            wins++
        }
        else
            session.send('Wrong!');

        data = '';
        session.beginDialog('/opposites');
        
    }
]);


intents.matches(/^reset$/i, [
    function (session) {
        builder.Prompts.text(session, 'Are you sure you want to reset me?')
    },
    function (session, results) {
        if (results.response.toLowerCase() == "no")
            session.send('Well alright then.');
        else if (results.response.toLowerCase() == "yes") {
            session.send('If you say so...');
            newBandList = [];
            session.send('Reset successful.');
            session.beginDialog('/profileReset');
        }
        else
            session.send('Sorry, I didn\'t understand that.');
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
        else if ((rando == 0) && (results.response.toLowerCase() == "right"))
            session.send('Correct!');
        else if (rando == 1 && results.response.toLowerCase() == "left")
            session.send('Correct!');
        else if (rando == 2 && results.response.toLowerCase() == "backwards")
            session.send('Correct!');
        else if (rando == 3 && results.response.toLowerCase() == "forwards")
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
        else if (results.response.toLowerCase() == secretWord) {
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
        session.send('What would you like to talk about?');
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

bot.dialog('/profileReset', [
    function (session) {
        builder.Prompts.text(session, 'Hi! What is your name?');
    },
    function (session, results) {
        session.userData.name = results.response;
        session.send('Hello %s!', session.userData.name);
        session.send('What would you like to talk about?');
        session.endDialog();
    }
])


