import './App.css';
import {useState, useEffect} from 'react';
import axios from 'axios';
import { Element } from './Components/element';
import Button from './Components/button';
import AnswerBar from './Components/answerBar';
import styled from 'styled-components';
import { colorVal } from './Components/Utils';

const SERVER_URL = process.env.REACT_APP_HOST_URL;

//what did we learn?
function App() {

  const [board, setBoard] = useState(Array(16).fill({}));
  const [loading, setLoading] = useState(false);
  const [hardMode, setHardMode] = useState(false);
  const [paintMode, setPaintMode] = useState(false);
  const [guesses, setGuesses] = useState(4);
  const [answers, setAnswers] = useState([]);
  const [input, setInput] = useState("");
  const [catColor, setCatColor] = useState();

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
      
  }, [setBoard, setAnswers, paintMode]); 

  useEffect(() => {
    if(guesses === 0){
        solvePuzzle();
    }
  }, [guesses])

  const onTapElement = (i) => {
      const newBoard = [...board];
      newBoard[i].selected = !newBoard[i].selected;
      if(paintMode && catColor && catColor > 0){
          newBoard[i].categoryLevel = (newBoard[i].selected) ? catColor : 0;
      }
      setBoard(newBoard);
  };

  const requiredSelection = () => paintMode ? 16 : 4;

  const maxSelected = () => {
      return board.filter(el => el.selected).length >= requiredSelection();
  }

  const deselectBoard = () => {
      const newBoard = board.map((el) => {
        el.selected = false;
        el.categoryLevel = 0;
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

  const submitPaint = () => {
      axios.post(`${SERVER_URL}/paint`, {
          values: board,
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(data => {
            const { correct, answers: updatedAnswers } = data.data;
            if(!correct){
              alert("Incorrect Paint");
              // setGuesses(guesses - 1);
              setLoading(false);
              return;
            }
            setAnswers(updatedAnswers);
            deselectBoard();
            setBoard([]);

        }).catch(err => {
          setLoading(false)
          console.log(err)
        });
      ;
  }

  const onSubmit = () => {
    setLoading(true);
    const elements = board.filter(el => el.selected);
    if(elements.length !== requiredSelection()) return;
    if(paintMode) return submitPaint();
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
      const hardModeIssues = ((hardMode || answers.length === 3) && input.length === 0);
      const paintModeIssues = paintMode && Object.values(board.reduce((dict, el) => {
        const catLevelCount = el["categoryLevel"];
        if(dict[`${catLevelCount}`]){
          dict[`${catLevelCount}`] = dict[`${catLevelCount}`] + 1;
        } else if(catLevelCount !== 0){
          dict[`${catLevelCount}`] = 1;
        }
        return dict;
      }, {})).some((val) => val !== 4);
      return guesses <= 0 || loading || !maxSelected() || hardModeIssues || paintModeIssues;
  }

  const guessDots = [];
  for(let i = 0; i < guesses; i++){
    guessDots.push(<Dot/>);
  }

  
  let details = "You must describe the connection of the final category.";
  if(hardMode) details = "You must describe the connection for EACH category."
  if(paintMode) details = "You may only submit a valid 4x4 board. Categories may have any color.";

  // const instructions = `Find the four connections between each element.\n ${details}`;
  return (
    <div className="App">
      <Title>Lonely Connect</Title>
      <SubTitle>
      <Instr>
        <InstrText>Connect each element into one of four categories.<br/>{details}</InstrText>
      </Instr>
      <div>
      <HardMode>
        <input disabled={answers.length > 0} type="checkbox" value={hardMode} onInput={() => {
          setHardMode(!hardMode)
          setPaintMode(false);
        }} /> Hard Mode
      </HardMode>
      <HardMode>
        <input disabled={answers.length > 0} type="checkbox" value={paintMode} onInput={() => {
          setCatColor(!paintMode ? 1 : 0);
          setPaintMode(!paintMode);
          setHardMode(false);
          deselectBoard();
        }} /> Paint Mode
      </HardMode>
      </div>
      </SubTitle>
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
          selectable={el.selectable && !loading && (!maxSelected() || el.selected)}   
          index={i}
          key={i} 
          onSelect={onTapElement} />)}
      </div>
      {(hardMode || answers.length === 3) && <ConnectInput>{answers.length === 3 ? "Final " : ""} Connection: <input value={input} onInput={e => setInput(e.target.value)} /></ConnectInput>}
      {paintMode && <div>{Object.keys(colorVal).map((key) => {
        return <ColorBox selected={key === `${catColor}`} color={colorVal[key]} onClick={() => setCatColor(Number(key))} />
      })}</div>}
      {!paintMode && <Guesses>
          Remaining Guesses: {guessDots}
      </Guesses>}
      <div>
          <Button name="Shuffle" onSubmit={shuffleBoard}/>
          <Button name="Deselect" disabed={board.filter(el => el.selected).length === 0} onSubmit={deselectBoard}/>
          <Button name="Submit" disabled={preventSubmit()} onSubmit={onSubmit}/>
      </div>
    </div>
  );
}

const InstrText = styled.h5`
  display: inline;
`;

const Instr = styled.div`
  width: 70%;
  text-align: left;
  color: #888888;
  border: 1px solid #888888;
  padding: 5px;
  border-radius: 10px;
`;

const SubTitle = styled.div`
  display: flex;
  font-weight: bold;
  margin: 10px;
  justify-content: space-around;
`;

const ColorBox = styled.div`
  height: 40px;
  width: 40px;
  background-color: ${props => props.color};
  margin: 0 5px 0 5px;
  border-radius: 20%;
  border: ${props => (props.selected ? "5px black solid" : "")};
  display: inline-block;
`;

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
`;

export default App;
