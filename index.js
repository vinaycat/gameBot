const Discord = require('discord.js');
const token1 = require('./.gitignore/token.js');
const client = new Discord.Client();
const token = token1.token;
const fs = require("fs");
const randomWords = require('random-words');
const score = require('./score.json');
const fetch = require('node-fetch');
const tord = require('./TruthOrDare.json');
const topScores = require('./topScores.json');
const images = ["https://i.imgur.com/bBbUtIK.jpg", "https://i.imgur.com/nRKO6DM.jpg", "https://i.imgur.com/lGfZhbc.jpg", "https://i.imgur.com/kyGSGq3.jpg", "https://i.imgur.com/2YkAjHt.jpg", "https://i.imgur.com/baE4H0N.jpg", "https://i.imgur.com/aPUwgWT.jpg", "https://i.imgur.com/eOpJRvl.jpg"]
const Canvas = require('canvas');
const {
    isAbsolute
} = require('path');

client.on("ready", async () => {
    client.user.setActivity(":)");

});

function truthOrDare(args, message) {
    let random = between(0, tord.length);
    if (args[0].toLowerCase() === "truth") {
        while (tord[random].type != "Truth") {
            random = between(0, tord.length);
        }
        message.channel.send(tord[random].summary);
    }
    if (args[0].toLowerCase() === "dare") {
        while (tord[random].type != "Dare") {
            random = between(0, tord.length);
        }
        message.channel.send(tord[random].summary);
    }
}




function quizManager(args, message) {

    //0 : random, 1 : true/false, 2: multiple
    if (args[0].toLowerCase() === 'start-quiz' && args[1] == null) {
        let isRandom = 0;
        startQuiz(args, message, isRandom);
    }
    if (args[0].toLowerCase() === 'start-quiz' && args[1] != null) {
        if (args[1].toLowerCase() === 'tf') {
            let isRandom = 1;
            startQuiz(args, message, isRandom);
        }
    }
    if (args[0].toLowerCase() === 'start-quiz' && args[1] != null) {
        if (args[1].toLowerCase() === 'multiple') {
            let isRandom = 2;
            startQuiz(args, message, isRandom);
        }
    }
}

function booleanStartUpQuiz(xhr) {
    xhr.open("GET", "https://opentdb.com/api.php?amount=1&type=boolean", false); // false for synchronous request
    xhr.send(null);
    let myArr = JSON.parse(xhr.responseText).results[0];
    while (myArr.question.includes('&')) {
        XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
        xhr = new XMLHttpRequest();
        xhr.open("GET", "https://opentdb.com/api.php?amount=1&type=boolean", false); // false for synchronous request
        xhr.send(null);
        myArr = JSON.parse(xhr.responseText).results[0];
    }
    return myArr;
}

function multipleStartUpQuiz(xhr) {
    xhr.open("GET", "https://opentdb.com/api.php?amount=1&difficulty=easy&type=multiple", false); // false for synchronous request
    xhr.send(null);
    let myArr = JSON.parse(xhr.responseText).results[0];
    while (myArr.question.includes('&') || myArr.incorrect_answers[0].includes('&') || myArr.incorrect_answers[1].includes('&') || myArr.incorrect_answers[2].includes('&') || myArr.correct_answer.includes('&') || myArr.question.includes('In the Super Smash Bros. series, which character was the first one to return to the series after being absent from a previous game?') || myArr.question.includes("In 1720,") || myArr.question.includes("What game was used to adver") || myArr.question.includes("What is the most pref") || myArr.question.includes("How many people") || myArr.question.includes("Gwyneth") || myArr.question.includes("Which American-owned") || myArr.question.includes("In Super Mario Bros., who informs Mario that the princess is in another castle?") || myArr.question.includes("What is the Capital of the United States?") || myArr.question.includes("What is the first weapon you acquire in Half-Life?") || myArr.question.includes("What is the correct order of operations for solving equations?") || myArr.question.includes("The Los Angeles Dodgers were originally from what U.S. city?") || myArr.question.includes("Which Game Boy from the Game Boy series of portable video game consoles was released first?")) {
        XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
        xhr = new XMLHttpRequest();
        xhr.open("GET", "https://opentdb.com/api.php?amount=1&difficulty=easy&type=multiple", false); // false for synchronous request
        xhr.send(null);
        myArr = JSON.parse(xhr.responseText).results[0];
    }
    console.log(myArr);
    return myArr;
}

function startQuiz(args, message, isRandom) {
    let decideQuiz = 3;

    if (isRandom == 0) {
        decideQuiz = between(0, 2);
    }
    if (isRandom == 1) {
        decideQuiz = 0;
    }
    if (isRandom == 2) {
        decideQuiz = 1;
    }

    let XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    let xhr = new XMLHttpRequest();

    let myArr;
    let isCorrect = false;
    let isStop = false;

    if (decideQuiz == 0) {
        const collector = new Discord.MessageCollector(message.channel, m => m.content.includes('.'), {
            time: 20000
        });
        myArr = booleanStartUpQuiz(xhr);
        message.channel.send(`Question: **${myArr.question}**`);
        collector.on('collect', message1 => {
            let content = message1.content.substr(1, message1.content.length);
            if (myArr.correct_answer.toLowerCase().toLowerCase().startsWith(content.toLowerCase())) {
                correct++;
                message.channel.send("Correct");
                isCorrect = true;
                collector.stop();
            } else if (content.toLowerCase() === 'stop') {
                isStop = true;
                collector.stop();
            } else if (myArr.incorrect_answers[0].toLowerCase().startsWith(content.toLowerCase())) {
                message.channel.send("Incorrect");
                collector.stop();
            }
        })
        collector.on('end', async collected => {
            if (isStop) {
                message.channel.send("Stopping");
                message.channel.send(`Correct: ${correct} \nMissed: ${missed}`);
                if (isRandom == 0) {
                    addTopScores(2, correct);
                }
                correct = 0;
                missed = 0;
            } else if (!isCorrect) {
                message.channel.send(`Missed: answer was **${myArr.correct_answer.toLowerCase()}**`)
                missed++;
                if (missed > 4) {
                    message.channel.send("Too many misses, stopping");
                    message.channel.send(`Correct: ${correct}`)
                    if (isRandom == 0) {
                        addTopScores(2, correct);
                    }
                    correct = 0;
                    missed = 0;
                } else {
                    const sleep = ms => new Promise(res => setTimeout(res, ms));

                    (async () => {
                        await sleep(500);
                        await sleep(1500);
                        startQuiz(args, message, isRandom);
                    })();

                }
            } else if (isCorrect) {
                isCorrect = false;
                const sleep = ms => new Promise(res => setTimeout(res, ms));

                (async () => {
                    await sleep(500);
                    await sleep(1500);
                    startQuiz(args, message, isRandom);
                })();

            }
        });
    } else if (decideQuiz == 1) {
        const collector = new Discord.MessageCollector(message.channel, m => m.content.includes('.'), {
            time: 40000
        });
        myArr = multipleStartUpQuiz(xhr);
        let randomIndex = between(1, 4);
        let question = [];
        question = myArr.incorrect_answers;
        question.splice(randomIndex, 0, myArr.correct_answer);
        message.channel.send(`Question: **${myArr.question}**\n1: ${question[0]}\n2: ${question[1]}\n3: ${question[2]}\n4: ${question[3]}`);

        collector.on('collect', message1 => {
            let content = message1.content.substr(1, message1.content.length);
            if (parseInt(content.toLowerCase()) === parseInt(question.indexOf(myArr.correct_answer)) + 1) {
                correct++;
                message.channel.send("Correct");
                isCorrect = true;
                collector.stop();
            } else if (content.toLowerCase() === 'stop') {
                isStop = true;
                collector.stop();
            } else {
                message.channel.send("Incorrect");
                collector.stop();
            }
        })
        collector.on('end', async collected => {
            if (isStop) {
                message.channel.send("Stopping");
                message.channel.send(`Correct: ${correct} \nMissed: ${missed}`);
                if (isRandom == 0) {
                    addTopScores(2, correct);
                }
                correct = 0;
                missed = 0;
            } else if (!isCorrect) {
                message.channel.send(`Missed: answer was **${myArr.correct_answer}**`)
                missed++;
                if (missed > 4) {
                    message.channel.send("Too many misses, stopping");
                    message.channel.send(`Correct: ${correct}`)
                    if (isRandom == 0) {
                        addTopScores(2, correct);
                    }
                    correct = 0;
                    missed = 0;
                } else {
                    const sleep = ms => new Promise(res => setTimeout(res, ms));

                    (async () => {
                        await sleep(500);
                        await sleep(1500);
                        startQuiz(args, message, isRandom);
                    })();

                }
            } else if (isCorrect) {
                isCorrect = false;
                const sleep = ms => new Promise(res => setTimeout(res, ms));

                (async () => {
                    await sleep(500);
                    await sleep(1500);
                    startQuiz(args, message, isRandom);
                })();

            }
        });
    }




}



function returnPages(pages, newArgs, message, footer) {

    let page = 1;
    const embed = new Discord.MessageEmbed()
        .setColor("BLUE")
        .setTitle(`${newArgs}`)
        .setFooter(`Page ${page} of ${pages.length} ` + footer)
        .setDescription(pages[page - 1]);

    message.channel.send(embed).then(msg => {

        msg.react('◀️').then(r => {
            msg.react('▶️')
            const backwardsFilter = (reaction, user) => reaction.emoji.name === '◀️' && user.id === message.author.id;
            const forwardsFilter = (reaction, user) => reaction.emoji.name === '▶️' && user.id === message.author.id;
            const backwards = msg.createReactionCollector(backwardsFilter, {
                time: 60000
            });
            const forwards = msg.createReactionCollector(forwardsFilter, {
                time: 60000
            });
            backwards.on('collect', r => {
                if (page === 1) return;
                page--;
                embed.setDescription(pages[page - 1]);
                embed.setFooter(`Page ${page} of ${pages.length} ` + footer);
                msg.edit(embed);
            })
            forwards.on('collect', r => {
                if (page === pages.length) return;
                page++;
                embed.setDescription(pages[page - 1]);
                embed.setFooter(`Page ${page} of ${pages.length} ` + footer);
                msg.edit(embed);
            })
        })
    })
}

function between(min, max) {
    return Math.floor(
        Math.random() * (max - min) + min
    )
}

let correct = 0;
let missed = 0;

function scrambler(args, message) {
    if (args[1] != null) {
        if (args[0] === 'scramble' && args[1] === 'alone') {
            scrambleWordAlone(args, message);
        }
    } else {
        if (args[0] === 'scramble') {
            scrambleWord(args, message)
        }
    }
}

function addTopScores(whichOne, correct) {
    console.log("in top scores");
    // whichOne: 1 = Scramble, 2 = Quiz
    if (whichOne == 1) {
        topScores.forEach(val => {
            if (val.whichOne == whichOne && val.correct < correct) {

                val.whichOne = whichOne;
                val.correct = correct;
                val.date = new Date();
                fs.writeFileSync("./topScores.json", JSON.stringify(topScores, null, 2), (err) => {
                    if (err) console.log(err);
                });
            }
        })
    } else if (whichOne == 2) {
        console.log(" Quiz");
        topScores.forEach(val => {
            if (val.whichOne == whichOne && val.correct < correct) {

                val.whichOne = whichOne;
                val.correct = correct;
                val.date = new Date();
                fs.writeFileSync("./topScores.json", JSON.stringify(topScores, null, 2), (err) => {
                    if (err) console.log(err);
                });
            }
        })
    }
}

function showScores(args, message) {
    if (args[0].toLowerCase().startsWith('community-score')) {
        let displayingArray = [];
        topScores.forEach(function (val, i) {
            if (val.whichOne === 1) {
                val.whichOne = "scramble";
            } else if (val.whichOne === 2) {
                val.whichOne = "quiz";
            }
            displayingArray[i] = [val.whichOne, val.correct]
        })
        let sortedArray = displayingArray.sort(function (a, b) {
            return b[1] - a[1];
        });
        let newList = "";
        let arrayOfPlayers = [];
        //Making it so that each index has 10 lines
        for (let index = 0; index < sortedArray.length; index++) {
            newList += `${index+1}. Top score achieved in **${sortedArray[index][0]}**: ${sortedArray[index][1]}\n`;
            if (index % 10 == 0 && index != 0) {
                arrayOfPlayers[(index - 10) / 10] = newList;
                newList = "";
            }
        }
        arrayOfPlayers[arrayOfPlayers.length] = newList;
        returnPages(arrayOfPlayers, "All Scores", message, "Scores");
    }
}

function addScore(author, correct) {
    let isExist = false;
    score.forEach(val => {
        if (val.author === author) {
            isExist = true;
            if (correct > val.correct) {
                val.correct = correct;
                fs.writeFileSync("./score.json", JSON.stringify(score, null, 2), (err) => {
                    if (err) console.log(err);
                });
            }
        }
    })
    if (!isExist) {
        score.push({
            author: author,
            correct: correct,
        });
        fs.writeFile("./score.json", JSON.stringify(score, null, 2), (err) => {
            if (err) console.log(err);
        });
    }
}

function displayScore(args, message) {
    if (args[0] === 'scores') {
        let displayingArray = [];
        score.forEach(function (val, i) {
            displayingArray[i] = [val.author, val.correct]
        })
        let sortedArray = displayingArray.sort(function (a, b) {
            return b[1] - a[1];
        });
        let newList = "";
        let arrayOfPlayers = [];
        //Making it so that each index has 10 lines
        for (let index = 0; index < sortedArray.length; index++) {
            newList += `${index+1}. ${sortedArray[index][0]}: ${sortedArray[index][1]}\n`;
            if (index % 10 == 0 && index != 0) {
                arrayOfPlayers[(index - 10) / 10] = newList;
                newList = "";
            }
        }
        arrayOfPlayers[arrayOfPlayers.length] = newList;
        returnPages(arrayOfPlayers, "All Scores", message, "Scores");
    }
}

function help(args, message) {
    if (args[0].toLowerCase() === 'help-game') {
        let embed = new Discord.MessageEmbed()
            .setColor("BLUE")
            .setDescription(`!scores : Shows high scores \n
            !scramble : anyone can participate, simply put "." before the guess, or type ".stop" to stop the game : game ends when the timer runs out on a word 5 times \n
            !scramble alone : only you may participate, and no prefix is needed, this one will go to the scores : game ends when the timer runs out on a word 5 times \n
            !start-quiz : starts a random true or false or multiple choice quiz, put "." infront your answer ex<.true> or <.1>\n
            !start-quiz tf : starts true or false \n
            !start-quiz multiple : starts a multiple choice question quiz\n
            !truth : asks a question \n
            !dare : gives a dare\n
            !invite-game : sends an invite link\n
            !community-score : shows the top scores for community games\n
            !joke : Sends a joke\n
            !guess-number : Guess a number from 1-10, put a "." infront of it\n
            !hangman : Play hangman, guess word by putting a "." infront of it [Link to hangman images](https://www.oligalma.com/en/downloads/images/hangman)\n
            !hangtogether : Play hangman together, whoever uses this command gets to enter the word, and everyone else can guess!`);
        message.channel.send(embed);
    }
}

function scrambleWord(args, message) {
    let word = "";
    while (word.length <= 2) {
        word = randomWords()
    }
    console.log(word);
    let stop = false;
    let isCorrect = false;
    let startingArrayOfCharacters = word.split('');
    let arrayOfCharacters = startingArrayOfCharacters;
    while (word === arrayOfCharacters.join('')) {
        for (let index = 0; index < arrayOfCharacters.length - 2; index++) {
            let randomCharacter = between(0, arrayOfCharacters.length - 1);
            let randomMover = between(0, arrayOfCharacters.length - 1);
            let temp = arrayOfCharacters[randomCharacter];
            arrayOfCharacters[randomCharacter] = arrayOfCharacters[randomMover];
            arrayOfCharacters[randomMover] = temp;
        }
    }
    let randomWordScrambled = arrayOfCharacters.join('');
    message.channel.send(`New word **${randomWordScrambled}**`);

    const collector = new Discord.MessageCollector(message.channel, m => m.content.includes('.'), {
        time: 20000
    });
    collector.on('collect', message1 => {
        message1.content = message1.content.substr(1, message1.content.length);
        if (message1.content.toLowerCase() === word) {
            message.channel.send("Correct");
            correct++;
            isCorrect = true;
            collector.stop()
        } else if (message1.content.toLowerCase() === 'stop') {
            stop = true;
            collector.stop()
        } else {
            message.channel.send("Incorrect");
        }
    })
    collector.on('end', collected => {
        if (stop) {
            message.channel.send("Stopping");
            message.channel.send(`Correct: ${correct} \nMissed: ${missed}`);
            addTopScores(1, correct);
            correct = 0;
            missed = 0;
        } else if (!isCorrect) {
            message.channel.send(`Time ran out, correct word was: **${word}**`);
            missed++;
            if (missed > 4) {
                message.channel.send("Too many misses, stopping");
                message.channel.send(`Correct: ${correct}`);
                addTopScores(1, correct);
                correct = 0;
                missed = 0;
            } else {
                scrambleWord(args, message);
            }
        } else {
            scrambleWord(args, message);
        }
    });
}

function scrambleWordAlone(args, message) {
    let word = "";
    while (word.length <= 2) {
        word = randomWords()
    }
    console.log(word);
    let stop = false;
    let isCorrect = false;
    let startingArrayOfCharacters = word.split('');
    let arrayOfCharacters = startingArrayOfCharacters;
    while (word === arrayOfCharacters.join('')) {
        for (let index = 0; index < arrayOfCharacters.length - 2; index++) {
            let randomCharacter = between(0, arrayOfCharacters.length - 1);
            let randomMover = between(0, arrayOfCharacters.length - 1);
            let temp = arrayOfCharacters[randomCharacter];
            arrayOfCharacters[randomCharacter] = arrayOfCharacters[randomMover];
            arrayOfCharacters[randomMover] = temp;
        }
    }
    let randomWordScrambled = arrayOfCharacters.join('');
    message.channel.send(`New word **${randomWordScrambled}**`);
    const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, {
        time: 10000
    });
    collector.on('collect', message1 => {
        if (message1.content.toLowerCase() === word) {
            message.channel.send("Correct");
            correct++;
            isCorrect = true;
            collector.stop()
        } else if (message1.content.toLowerCase() === 'stop') {
            stop = true;
            collector.stop()
        } else {
            message.channel.send("Incorrect");
        }
    })
    collector.on('end', message1 => {
        if (stop) {
            message.channel.send("Stopping");
            message.channel.send(`Correct: ${correct} \nMissed: ${missed}`)
            addScore(message.author.username, correct)
            correct = 0;
            missed = 0;
        } else if (!isCorrect) {
            message.channel.send(`Time ran out, correct word was: **${word}**`);
            missed++;
            if (missed > 4) {
                message.channel.send("Too many misses, stopping");
                message.channel.send(`Correct: ${correct} \nMissed: ${missed}`)
                addScore(message.author.username, correct)
                correct = 0;
                missed = 0;
            } else {
                scrambleWordAlone(args, message);

            }
        } else {
            scrambleWordAlone(args, message);
        }
    });
}

function invite(args, message) {
    if (args[0] === 'invite-game') {
        let embed = new Discord.MessageEmbed()
            .setColor("BLUE")
            .setDescription("https://discord.com/api/oauth2/authorize?client_id=751877148465299527&permissions=6144&scope=bot");
        message.channel.send(embed);
    }
}

function decideRandomGuess(args, message) {
    if (args[0].toLowerCase() === "guess-number") {
        message.channel.send("Guess a number");
        let randomNumber = between(0, 10);
        randomGuess(args, message, randomNumber);
    }
}

function randomGuess(args, message, randomNumber) {
    let stop1 = false;
    let correct = false;
    randomNumber = parseInt(randomNumber);
    const collector = new Discord.MessageCollector(message.channel, m => m.content.includes("."));
    collector.on('collect', message1 => {
        let content = message1.content.substr(1, message1.content.length);
        console.log(parseInt(content, 10) == randomNumber);
        if (parseInt(content) == randomNumber) {
            message.channel.send("Correct");
            correct = true;
            collector.stop();
        } else if (content < randomNumber) {
            message.channel.send("Guess higher");
            collector.stop();
        } else if (content > randomNumber) {
            message.channel.send("Guess lower");
            collector.stop();
        } else if (content === "stop") {
            stop1 = true;
            message.channel.send("Stopping");
            collector.stop();
        }
    })
    collector.on('end', collected => {
        if (stop1) {} else if (correct) {
            decideRandomGuess(["guess-number"], message);
        } else {
            randomGuess(args, message, randomNumber);
        }
    })
}

function sendJoke(args, message) {
    if (args[0].toLowerCase().startsWith('joke')) {
        var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "https://some-random-api.ml/joke", false); // false for synchronous request
        xhr.send(null);
        let myImage = JSON.parse(xhr.responseText).joke;
        let embed = new Discord.MessageEmbed()
            .setColor("GREEN")
            .setDescription(`${myImage}`)
        message.channel.send(embed)
    }
}

function hangManSetupPartTwo(args, message) {
    if (args[0].toLowerCase().startsWith('hangtogether')) {
        message.author.send("Put word here, no spaces");
        let word = "";
        let letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
        message.author.createDM().then(dmchannel => {
            let isCharacterInAlphabet = false;

            const collector = new Discord.MessageCollector(dmchannel, m => m.author.id === message.author.id, {
                time: 100000
            });
            collector.on('collect', message1 => {
                word = message1.content.split(" ")[0].toLowerCase();
                let charArrayOfWord = word.split("");
                for (let index = 0; index < charArrayOfWord.length; index++) {
                    const element = charArrayOfWord[index];
                    for (let index = 0; index < letters.length; index++) {
                        const element1 = letters[index];
                        if(element === element1){
                            isCharacterInAlphabet = true;
                        }
                    }
                    if(isCharacterInAlphabet == false){
                        message1.author.send("invalid word.");
                        collector.stop();
                    } 
                }
                collector.stop();
                
            })
            collector.on('end', message1 =>{
                if(isCharacterInAlphabet){
                    hangmanSetup(message, word);
                }
            })
        })
    }
    if (args[0].toLowerCase() === "hangman") {
        let word = randomWords();
        hangmanSetup(message, word)
    }
}


function hangmanSetup(message, randomWord) { //

    let word = randomWord;
    console.log(word);
    let guessesRemaining = images.length - 1;
    let wordDisplay = [];
    let totalTimesCorrect = 0;
    let imageSetter = images[0];
    let letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
    let win = false;
    for (let index = 0; index < word.length; index++) {
        wordDisplay[index] = "- ";
    }
    let attachement;
    let guessedLetters = [];
    hangman(message, word, guessesRemaining, wordDisplay, letters, win, totalTimesCorrect, guessedLetters, imageSetter, attachement);

}

function hangman(message, word, guessesRemaining, wordDisplay, letters, win, totalTimesCorrect, guessedLetters, imageSetter, attachement) {
    // let imageSetter = images[images.length - guessesRemaining - 1];
    let isStop = false;
    let alreadyGuessed = false;
    let embed = new Discord.MessageEmbed()
        .setColor("YELLOW")
        .setTitle("Hangman")
        .setDescription(`Word: ${wordDisplay.join(" ")} \n ${guessedLetters.join(" ")}`)
        .setImage(imageSetter)
        .setFooter(`Guesses remaining: ${guessesRemaining}`);

    if (attachement != null) {
        //console.log('sending attachement');
        message.channel.send({
            embed,
            files: [attachement]
        });
    } else {
        message.channel.send(embed);
    }
    let person;
    let wrong = false;
    const collector = new Discord.MessageCollector(message.channel, m => m.content.includes('.'), {
        time: 100000
    });
    collector.on('collect', message1 => {
        person = message1;
        if (message1.content != "") {
            let newGuess = message1.content.substr(1, 1).toLowerCase();
            let indexOfLetter = letters.indexOf(newGuess);
            let charArrayOfWord = word.split("");
            if (message1.content.substr(1, message1.content.length).length >= 2) {
                if (message1.content.substr(1, message1.content.length).toLowerCase().startsWith(word)) {
                    totalTimesCorrect = word.length;
                    win = true;
                    collector.stop();
                } else {
                    wrong = true;
                    collector.stop();
                }
            }
            if (message1.content.substr(1, message1.content.length).toLowerCase().startsWith('stop')) {
                isStop = true;
                collector.stop();
            }
            if (indexOfLetter != -1 && wrong == false) {
                letters.splice(indexOfLetter, 1);
                guessedLetters.push(newGuess)
                let indexOfCharacterArray = charArrayOfWord.indexOf(newGuess);
                if (indexOfCharacterArray != -1) {
                    for (let index = 0; index < charArrayOfWord.length; index++) {
                        const element = charArrayOfWord[index];
                        if (element === newGuess) {
                            wordDisplay[index] = newGuess;
                            totalTimesCorrect++;
                        }
                    }
                    embed.setDescription(`${wordDisplay.join(" ")} \n ${guessedLetters.join(" ")}`);
                    win = true;
                    collector.stop();
                } else {
                    wrong = true;
                    collector.stop();
                }
            } else {

                //console.log("setting alreadyGuessed to true")
                alreadyGuessed = true;
                collector.stop();
            }
        }
    })
    collector.on('end', async message2 => {
       
        //console.log(`win: ${win} wrong: ${wrong} alreadyGuessed: ${alreadyGuessed} isStop: ${isStop}`)
        if (win) {
            //console.log("in correct");
            win = false;
            if (totalTimesCorrect == word.length && guessesRemaining == 7) {
                let winEmbed = new Discord.MessageEmbed()
                    .setColor("YELLOW")
                    .setDescription(`Wow you got nothing wrong! :sunglasses: Truly amazing I didn't even get out the rope!`)
                message.channel.send(winEmbed);
            } else if (totalTimesCorrect == word.length) {
                let winEmbed = new Discord.MessageEmbed()
                    .setColor("YELLOW")
                    .setDescription(`You have won!`)
                message.channel.send(winEmbed);
            } else {
                const sleep = ms => new Promise(res => setTimeout(res, ms));

                (async () => {
                    await sleep(500);
                    hangman(message, word, guessesRemaining, wordDisplay, letters, win, totalTimesCorrect, guessedLetters, imageSetter, attachement);
                })();

            }
        } else if (wrong) {
            guessesRemaining--;

            //console.log('here');
            //console.log(guessesRemaining);
            if (guessesRemaining == 6) {
                //console.log("in this palcec")
                imageSetter = images[1];
            } else if (guessesRemaining == 5) {
                let results = await showAvatar(person, images[2])
                imageSetter = results[0];
                attachement = results[1];
            } else if (guessesRemaining == 4) {
                let results = await showAvatar(person, images[3])
                imageSetter = results[0];
                attachement = results[1];
            } else if (guessesRemaining == 3) {
                let results = await showAvatar(person, images[4])
                imageSetter = results[0];
                attachement = results[1];
            } else if (guessesRemaining == 2) {
                let results = await showAvatar(person, images[5])
                imageSetter = results[0];
                attachement = results[1];
            } else if (guessesRemaining == 1) {
                let results = await showAvatar(person, images[6])
                imageSetter = results[0];
                attachement = results[1];
            } else if (guessesRemaining == 0) {
                let results = await showAvatar(person, images[7])
                imageSetter = results[0];
                attachement = results[1];
            }
            //console.log(imageSetter);
            if (guessesRemaining == 0) {


                embed.setImage(imageSetter);
                embed.setDescription(`you have died :( the word was **${word}**`);
                embed.setFooter(" ");
                message.channel.send({
                    embed,
                    files: [attachement]
                });
            } else {
                // embed.setFooter(`Guesses remaining: ${guessesRemaining}`)
                //     .setImage(imageSetter);
                const sleep = ms => new Promise(res => setTimeout(res, ms));

                (async () => {
                    await sleep(500);
                    hangman(message, word, guessesRemaining, wordDisplay, letters, win, totalTimesCorrect, guessedLetters, imageSetter, attachement);
                })();
            }
        } else if (isStop) {
            //console.log("in stop")
            let stoppingEmbed = new Discord.MessageEmbed()
                .setColor("YELLOW")
                .setDescription(`Stopping, word was **${word}**`)
            message.channel.send(stoppingEmbed);
        } else if (alreadyGuessed) {
            let guessEmbed = new Discord.MessageEmbed()
                .setColor("YELLOW")
                .setDescription("Letter does not exist or has already been guessed.")
            message.channel.send(guessEmbed);
            //console.log("in already guessed")
            const sleep = ms => new Promise(res => setTimeout(res, ms));

            (async () => {
                await sleep(500);
                hangman(message, word, guessesRemaining, wordDisplay, letters, win, totalTimesCorrect, guessedLetters, imageSetter, attachement);
            })();
        } else {
            guessesRemaining--;
            if (guessesRemaining == 6) {
                //console.log("in this palcec")
                imageSetter = images[1];
            } else if (guessesRemaining == 5) {
                let results = await showAvatar(person, images[2])
                imageSetter = results[0];
                attachement = results[1];
            } else if (guessesRemaining == 4) {
                let results = await showAvatar(person, images[3])
                imageSetter = results[0];
                attachement = results[1];
            } else if (guessesRemaining == 3) {
                let results = await showAvatar(person, images[4])
                imageSetter = results[0];
                attachement = results[1];
            } else if (guessesRemaining == 2) {
                let results = await showAvatar(person, images[5])
                imageSetter = results[0];
                attachement = results[1];
            } else if (guessesRemaining == 1) {
                let results = await showAvatar(person, images[6])
                imageSetter = results[0];
                attachement = results[1];
            } else if (guessesRemaining == 0) {
                let results = await showAvatar(person, images[7])
                imageSetter = results[0];
                attachement = results[1];
            }
            if (guessesRemaining == 0) {
                embed.setImage(imageSetter);
                embed.setDescription(`you have died :( the word was **${word}**`);
                embed.setFooter(" ");
                message.channel.send({
                    embed,
                    files: [attachement]
                });
            } else {
                //console.log("in else");
                embed.setFooter(`Guesses remaining: ${guessesRemaining}`)
                    .setImage(imageSetter);
                const sleep = ms => new Promise(res => setTimeout(res, ms));

                (async () => {
                    await sleep(500);
                    hangman(message, word, guessesRemaining, wordDisplay, letters, win, totalTimesCorrect, guessedLetters, imageSetter, attachement);
                })();
            }
        }

    })
}
async function showAvatar(message, image) {
    // const collector = new Discord.MessageCollector(message.channel, m => m.content.includes('.'), {
    //     time: 10000
    // });
    // collector.on('collect', async message1 => {
    const canvas = Canvas.createCanvas(500, 1000);
    const ctx = canvas.getContext('2d');
    //console.log('in avatar');

    // Since the image takes time to load, you should await it
    const background = await Canvas.loadImage(image);
    // This uses the canvas dimensions to stretch the image onto the entire canvas
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    // Draw a rectangle with the dimensions of the entire canvas
    ctx.strokeStyle = '#74037b';
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    // Pick up the pen
    ctx.beginPath();
    // Start the arc to form a circle
    //ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
    ctx.arc(310, 310, 95, 0, Math.PI * 2, true);
    // Put the pen down
    ctx.closePath();
    // Clip off the region you drew on
    ctx.clip();

    // Use helpful Attachment class structure to process the file for you
    const avatar = await Canvas.loadImage(message.member.user.displayAvatarURL({
        format: 'jpg'
    }));
    ctx.drawImage(avatar, 210, 210, 195, 195);
    //ctx.drawImage(avatar, 25, 25, 200, 200);
    const attachment = new Discord.MessageAttachment(canvas.toBuffer(), './hangmanImage.png');
    // let embed = new Discord.MessageEmbed()
    //     //.attachFiles(attachment)
    //     .setImage('attachment://hangmanImage.png');
    //     message.channel.send({ embed, files: [attachment] })
    // console.log(attachment)
    return ['attachment://hangmanImage.png', attachment];
    // });

}

function ping(args, message) {
    if (args[0].toLowerCase() === "ping") {
        message.channel.send("pong!");
    }
}
client.on("message", message => {
    const Prefix = "!";
    if (message.content.startsWith(Prefix)) {
        let args = message.content.substring(Prefix.length).split(" ");
        scrambler(args, message);
        hangManSetupPartTwo(args, message);
        quizManager(args, message);
        help(args, message);
        displayScore(args, message);
        truthOrDare(args, message);
        invite(args, message);
        showScores(args, message);
        sendJoke(args, message);
        decideRandomGuess(args, message);
        ping(args, message);
    }
});


client.login(token);