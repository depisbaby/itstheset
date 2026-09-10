const express = require('express')
const fs = require("fs")
const path = require('path');
const app = express()

let clue = "";
let numberOfPlayersToday = 0;

const validWords = new Set(
  fs.readFileSync(path.join(__dirname, 'valid_words.txt'), 'utf8')
    .split(/\s+/)
);

const puzzles = fs.readFileSync(
  path.join(__dirname, 'puzzles.txt'),
  'utf8'
).split(/\r?\n/).filter(Boolean);

const explanations = fs.readFileSync(
  path.join(__dirname, 'scrabble_words.txt'),
  'utf8'
).split(/\r?\n/).filter(Boolean);

function sortString(str) {
  
  return str.split("").sort().join("");
}

function seededInt(str, max) {
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash) % (max + 1);
}


function hasSameCharacters(a, b) {
  if (a.length !== b.length) return false;

  return [...a].sort().join('') === [...b].sort().join('');
}


function checkForAlternative(answer){
  if (!hasSameCharacters(answer, getPuzzle())) return false;
  
  const a = answer.slice(0, 3);
  const b = answer.slice(3, 6);
  const c = answer.slice(6, 9);

  if(!validWords.has(a)) return false;
  if(!validWords.has(b)) return false;
  if(!validWords.has(c)) return false;

  return true;

}

function getExplanation(answer){ //TODO
  let explanation = "";
  const a = answer.slice(0, 3);
  const b = answer.slice(3, 6);
  const c = answer.slice(6, 9);

  for (let i = 0; i < explanations.length; i++) {
    if(explanations[i].slice(0, 3).toUpperCase() == a){
      explanation = explanation + explanations[i].slice(0, 3).toUpperCase() + "\n" + explanations[i].slice(4) + "\n\n"
    }

    if(explanations[i].slice(0, 3).toUpperCase() == b){
      explanation = explanation + explanations[i].slice(0, 3).toUpperCase() + "\n" + explanations[i].slice(4) + "\n\n"
    }

    if(explanations[i].slice(0, 3).toUpperCase() == c){
      explanation = explanation + explanations[i].slice(0, 3).toUpperCase() + "\n" + explanations[i].slice(4) + "\n\n"
    }
  }

  return explanation
}

function getPuzzle(){
  const date = new Date();
  const dateString = date.toLocaleDateString("en-US");
  return puzzles[seededInt(dateString,13665)]
}
//
app.get("/api/clue", (req, res) => {
  //console.log(". "+puzzles[0])
  res.json({ clue: sortString(getPuzzle()) });
});
//
app.use(express.json());
app.post("/api/answer", (req, res) => {
  const answer = req.body.answer;
  const trialsRemaining = req.body.trialsRemaining;

  console.log(answer);
  
  if (answer != getPuzzle() && !checkForAlternative(answer)){
    
    if(trialsRemaining == 0){
      res.json({ 
      isCorrect: false,
      explanation: getExplanation(getPuzzle())
      });
      return
    }
    
    res.json({ 
    isCorrect: false,
    explanation: ""
    });
    return
  }

  res.json({ 
    isCorrect: true,
    explanation: getExplanation(answer)
  });
});


app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('/*splat', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  
});
// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  
});
