import './App.css';
import {useState, useEffect} from 'react';
import axios from 'axios';
import { Element } from './Components/element';
import Button from './Components/button';
import AnswerBar from './Components/answerBar';
import styled from 'styled-components';


const SERVER_URL = 'http://localhost:8080';

//what did we learn?
function App() {

  const [board, setBoard] = useState(Array(16).fill({}));
  const [loading, setLoading] = useState(false);
  const [hardMode, setHardMode] = useState(false);
  const [guesses, setGuesses] = useState(4);
  const [answers, setAnswers] = useState([]);
  const [input, setInput] = useState("");

  //make sure we know useeffect stuff
  useEffect(() => {   
      axios.get(`${SERVER_URL}/board`)
      .then(data => {
        setBoard(data.data.flat().map((name) => ({
          name,
          selectable: true,
          categoryLevel: 0,
          selected: false
        })));
        setAnswers([]);
      })
      .catch(err => console.log(err));
      
  }, [setBoard, setAnswers]); 

  useEffect(() => {
    if(guesses === 0){
        solvePuzzle();
    }
  }, [guesses])

  const onTapElement = (i) => {
      const newBoard = [...board];
      newBoard[i].selected = !newBoard[i].selected;
      setBoard(newBoard);
  };

  const fourSelected = () => {
      return board.filter(el => el.selected).length >= 4;
  }

  const deselectBoard = () => {
      const newBoard = board.map((el) => {
        el.selected = false;
        return el;
      });
      setBoard(newBoard);
  }

  const shuffleBoard = () => {
      let ind = board.length;
      const newBoard = [...board];
      while(ind !== 0){
          const randomIndex = Math.floor(Math.random() * ind);
          ind--;
          [newBoard[ind], newBoard[randomIndex]] = [newBoard[randomIndex], newBoard[ind]];
      }
      setBoard(newBoard);
  }

  const reconfigureBoard = (answerElements) => {
      const currentAnswerNames = answers.reduce((elements, el) => elements.concat(el.answers), []).concat(answerElements).map(el => el.name);
      const unAnsweredBoard = board.filter((el) => currentAnswerNames.indexOf(el.name) === -1);
      setBoard(unAnsweredBoard);
  };

  const onSubmit = () => {
    setLoading(true);
    const elements = board.filter(el => el.selected);
    if(elements.length !== 4) return;

    //const response = await connectValues(values);
    axios.post(`${SERVER_URL}/connect`, {
        values: elements.map(el => el.name),
        description: input
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(data => {
       
        const response = data.data;
        setLoading(false);
        if(response["correct"] && response["descriptionWrong"]){
            alert("Not the connection!");
            setGuesses(guesses - 1);
            setInput("");
        } else if(response["correct"]){
           const answerElements = elements.map((el) => ({
              name: el.name,
              selected: false,
              selectable: false,
              categoryLevel: response["categoryLevel"] + 1
            }));
          const updatedAnswers = answers.concat([{
            categoryLevel: response["categoryLevel"],
            description: response["categoryDescription"],
            answers: answerElements
          }]);
          setAnswers(updatedAnswers);
          setInput("");
          deselectBoard();
          reconfigureBoard(answerElements);
        } else {
          if(response.oneAway) alert("One Away");
          setGuesses(guesses - 1); //only if not guessed before      
        }
        
    
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
    
  }

  const solvePuzzle = () => {
      axios.post(`${SERVER_URL}/solve`, {
        answers
      },{
          headers: {
            'Content-Type': 'application/json'
          }
        })
          .then(data => {
            const solutions = data.data;
            const currAnswers = [...answers];
            const answerElements = solutions.forEach((el) => {
              const mappedAnswers = el["val"].map((name) => ({
                      name,
                      selected: false,
                      selectable: false,
                      categoryLevel: el["level"]
                    }));
                currAnswers.push({
                  categoryLevel: el["level"],
                  description: el["desc"],
                  answers: mappedAnswers,
                });
            });
          setAnswers(currAnswers);
            
      }).catch(() => {});
        };

  const preventSubmit = () => {
      return guesses <= 0 || loading || !fourSelected() || ((hardMode || answers.length === 3) && input.length === 0)
  }

  const guessDots = [];
  for(let i = 0; i < guesses; i++){
    guessDots.push(<Dot/>);
  }

  return (
    <div className="App">
      <Title>Lonely Connect</Title>
      <HardMode>
        <input disabled={answers.length > 0} type="checkbox" value={hardMode} onInput={() => setHardMode(!hardMode)} /> Hard Mode
      </HardMode>
      <div style={{
        display: "grid",
        gridTemplateColumns: "auto"
      }}>
        {answers.map((el, i) => <AnswerBar 
            {...el}
            elements={el.answers || []}
            index={i}
            key={i}
          />)}
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "auto auto auto auto"
      }}>
      {guesses > 0 && board.map((el, i) => <Element 
          {...el}
          selectable={el.selectable && !loading && (!fourSelected() || el.selected)}   
          index={i}
          key={i} 
          onSelect={onTapElement} />)}
      </div>
      {(hardMode || answers.length === 3) && <ConnectInput>{answers.length === 3 ? "Final " : ""} Connection: <input value={input} onInput={e => setInput(e.target.value)} /></ConnectInput>}
      <Guesses>
          Remaining Guesses: {guessDots}
      </Guesses>
      <div>
          <Button name="Shuffle" onSubmit={shuffleBoard}/>
          <Button name="Deselect" disabed={board.filter(el => el.selected).length === 0} onSubmit={deselectBoard}/>
          <Button name="Submit" disabled={preventSubmit()} onSubmit={onSubmit}/>
      </div>
    </div>
  );
}

const ConnectInput = styled.div`
  font-weight: bold;
  margin: 10px 0 20px 0;
`;

const Guesses = styled.div`
  margin: 10px 0 20px 0;
`;

const Dot = styled.div`
  height: 16px;
  width: 16px;
  background-color: #555555;
  color: red;
  margin: 0 5px 0 5px;
  border-radius: 50%;
  display: inline-block;
`;

const Title = styled.h1`
`;

const HardMode = styled.div`
  justify-content: right;
  display: flex;
  font-weight: bold;
`;

export default App;
