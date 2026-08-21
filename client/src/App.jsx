import { useEffect, useState } from "react";
import tabletImage from "./assets/tablet.png";

let _clue = ""
let inserted = ""
let insertedVisible = ""
let _solved = false

function subtractStrings(str1, str2) {
  const chars = [...str1];

  for (const char of str2) {
    const index = chars.indexOf(char);

    if (index !== -1) {
      chars.splice(index, 1);
    }
  }

  return chars.join("");
}

function Tablet({text}){
  return (
    <div className="tablet">
      <h1 className="tabletText">{text}</h1>
    </div>
  );
}

function SolvedMessage({visible}){
  return (
    <div className={`solvedMessage ${visible ? "show" : ""}`}>
      <h1>You solved the puzzle!</h1>
      <p>There will be a new puzzle tomorrow, see you then. Consider buying me a coffee to keep this game online.</p>
    </div>
  )
}

function BuyMeCoffee() {
  return (
    <a
      href="https://www.buymeacoffee.com/depisbaby"
      target="_blank"
      rel="noopener noreferrer"
    >
      <img
        src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
        alt="Buy Me a Coffee"
        style={{
          height: "60px",
          width: "217px",
        }}
      />
    </a>
  );
}

function Guide(){
  return(
    <div className="guide">
      <h1>How to play</h1>
      <p>• To solve the puzzle, you need to form three 3-letter words on the stone tablet while using all of the letters below it. </p>
      <p>• Each word must fit on the tablet both horizontally and vertically.</p>
      <p>• Valid 3-letter words are determined by The Association of British Scrabble Players (ABSP). See the full list <a href="https://www.absp.org.uk/words/study3lw.shtml">here.</a></p>
    </div>
  );
}

function LetterButtons({ text, onLetterClick }) {
  return (
    <div className="letter-buttons">
      {[...text].map((letter, index) => (
        <button
          key={index}
          onClick={() => onLetterClick?.(letter, index)}
        >
          {letter}
        </button>
      ))}
    </div>
  );
}

function App({clue}) {

  _clue = clue
  const [tabletText, setTabletText] = useState("ITS\nTHE\nSET");
  const [solved, setSolved] = useState(false);

  function EraseLetter(){
    if (_solved) return;
    if (inserted.length == 0)return;
    inserted = inserted.slice(0,-1)
    UpdateTablet()
  }

  function InsertLetter(letter){
    if (_solved) return;
    if (inserted.length == 6)return;

    if (!/^[a-zA-Z]$/.test(letter))return;

    inserted = inserted + letter
    UpdateTablet()
  }

  async function SendAnswer(answer){
    const response = await fetch("/api/answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        answer: answer,
      }),
    });

    const data = await response.json();
    console.log(data.isCorrect);
    if(data.isCorrect){
      setSolved(true)
      _solved = true
    }
  }

  function UpdateTablet(){
    let displayed = ""
    let answer = ""

    switch (inserted.length) {
      case 0:
        displayed = "ITS\nTHE\nSET"
        insertedVisible = ""
        break;

      case 1:
        displayed = inserted[0]
        insertedVisible = inserted[0]
        break;
      
      case 2:
        displayed = inserted[0] + inserted[1] + "\n" + inserted[1]
        insertedVisible = inserted[0] + inserted[1] + inserted[1]
        break;

      case 3:
        displayed = inserted[0] + inserted[1] + inserted[2] + "\n" + inserted[1] + "  \n" + inserted[2]
        insertedVisible = inserted[0] + inserted[1] + inserted[2] + inserted[1] + inserted[2]
        break;

      case 4:
        displayed = inserted[0] + inserted[1] + inserted[2] + "\n" + inserted[1] + inserted[3] + " \n" + inserted[2]
        insertedVisible = inserted[0] + inserted[1] + inserted[2] + inserted[1] + inserted[3] + inserted[2]
        break;
      
      case 5:
        displayed = inserted[0] + inserted[1] + inserted[2] + "\n" + inserted[1] + inserted[3] + inserted[4] + "\n" + inserted[2] + inserted[4]
        insertedVisible = inserted[0] + inserted[1] + inserted[2] + inserted[1] + inserted[3] + inserted[4] + inserted[2] + inserted[4]
        break;
      
      case 6:
        displayed = inserted[0] + inserted[1] + inserted[2] + "\n" + inserted[1] + inserted[3] + inserted[4] + "\n" + inserted[2] + inserted[4] + inserted[5]
        answer = inserted[0] + inserted[1] + inserted[2] + inserted[1] + inserted[3] + inserted[4] + inserted[2] + inserted[4] + inserted[5]
        insertedVisible = answer
        SendAnswer(answer)
        
        break;

      default:
        console.log("Unknown fruit");

      
    }

    setTabletText(displayed)
  }

  useEffect(() => {
    const handleKeyDown = (event) => {
      
      if (event.key === "Backspace"){
        EraseLetter()
        return
      }

      let upperCase = event.key.toUpperCase();
      InsertLetter(upperCase)
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
  <div className="page">
    <Tablet text={tabletText}/>
    <SolvedMessage visible={solved}/>
    <LetterButtons
      text={"<"+subtractStrings(clue, insertedVisible)}
      onLetterClick={(letter, index) => {
        if(letter == "<"){
          EraseLetter()
        }
        else{
          InsertLetter(letter)
        }
      }}
    />
    <BuyMeCoffee />
    <Guide />
  </div>
  );
}



export default App;
