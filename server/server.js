const express = require('express')
const fs = require("fs")
const cron = require('node-cron')
const app = express()
app.set('view engine', 'ejs')


let currentPuzzle = "AAAAAAAAA";
let clue = "";
let numberOfPlayersToday = 0;

const validWords = new Set(
  fs.readFileSync('valid_words.txt', 'utf8')
    .split(/\s+/)
);

function shuffleString(str) {
  /*
  const arr = [...str];

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  */
 //
  return str.split("").sort().join("");
}

function hasSameCharacters(a, b) {
  if (a.length !== b.length) return false;

  return [...a].sort().join('') === [...b].sort().join('');
}


function checkForAlternative(answer){
  if (!hasSameCharacters(answer, currentPuzzle)) return false;
  
  const a = answer.slice(0, 3);
  const b = answer.slice(3, 6);
  const c = answer.slice(6, 9);

  if(!validWords.has(a)) return false;
  if(!validWords.has(b)) return false;
  if(!validWords.has(c)) return false;

  return true;

}

function getExplanation(answer){ //TODO
  return ""
}

function newPuzzle(){
    const lines = fs.readFileSync("puzzles.txt", "utf8")
    .split(/\r?\n/)
    .filter(line => line.length > 0);
    const randomLine = lines[Math.floor(Math.random() * lines.length)];
    currentPuzzle = randomLine
}
//
function doDaily() {
    newPuzzle()
    clue = shuffleString(currentPuzzle)
    numberOfPlayersToday = 0
    console.log("Daily method called. Today's puzzle is " + currentPuzzle)
}

app.get("/", async (req, res) => {

    numberOfPlayersToday++;
    const geoLocationResponse = await fetch(`https://ipapi.co/${req.ip}/json/`);
    const location = await geoLocationResponse.json();

    console.log("Someone from "+ location.country_name + " started playing! ("+numberOfPlayersToday+" player(s) have played today.)");
    res.send(currentPuzzle);
    
})

app.get("/api/clue", (req, res) => {
  res.json({ clue: clue });
});

app.use(express.json());
app.post("/api/answer", (req, res) => {
  const answer = req.body.answer;

  console.log(answer);
  
  if (answer != currentPuzzle && !checkForAlternative(answer)){
    res.json({ 
    isCorrect: false,
    explanation: ""
    });
    return
  }

  res.json({ 
    isCorrect: true,
    explanation: getExplanation()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});
//
cron.schedule('0 0 * * *', () => {
  doDaily();
});

doDaily()

app.listen(3000)
