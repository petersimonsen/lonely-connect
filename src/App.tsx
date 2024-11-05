import {useState, useEffect} from 'react';
import styled from 'styled-components';
import { Element } from './Components/element';
import Button from './Components/button';
import AnswerBar from './Components/answerBar';
import { Guesses } from './Components/guesses';
import colorVal from './Components/Utils';
import Modal from './modal/modal';
import ModalContent from './modal/modalContent';
import useLocalStorage from './storage';
import moment from 'moment';
import axios from 'axios';
import { WordElement, AnswerElement, SolvedElement, PuzzelSol } from './data/element';


const SERVER_URL = process.env.REACT_APP_HOST_URL;


function App() {
  const formatDate = (date: moment.Moment): string => moment(date).format("YYYY-MM-DD");

  const [board, setBoard] = useLocalStorage<WordElement[]>("board", Array(16).fill({}));
  const [loading, setLoading] = useState(false);
  const [hardMode /*, setHardMode */] = useState(false);
  const [paintMode /*, setPaintMode */] = useState(true);
  const [guesses, setGuesses] = useState(4);
  const [submissions, setSubmissions] = useLocalStorage<Array<WordElement[]>>("submitted", []);
  const [answers, setAnswers] = useLocalStorage<AnswerElement[]>("answers", []);
  const [puzzleDate, setPuzzleDate] = useLocalStorage("puzzleDate", "");
  const [input, setInput] = useState("");
  const [catColor, setCatColor] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [reqPuzzleDate, setReqPuzzleDate] = useState(formatDate(moment()));
  const [solvedDates, setSolvedDates] = useLocalStorage<PuzzelSol>("solvedDates", {});

  /**
   * arrows change req puzzel date
   */

  //make sure we know useeffect stuff
  useEffect(() => {   
      axios.get<{
        startBoard: string[],
        date: string;
      }>(`${SERVER_URL}/board?date=${reqPuzzleDate}`)
      .then(data => {
        const { startBoard, date } = data.data;
        const emptyBoard = board.length === 0 && answers.length === 0;
        if(
          emptyBoard ||
          puzzleDate.length === 0 ||
          puzzleDate !== date
        ){
          setBoard(startBoard.map((name) => ({
            name,
            selectable: true,
            categoryLevel: 0,
            selected: false
            })));
          setAnswers([]);
          if(!solvedDates[reqPuzzleDate]){
            setSolvedDates({
              ...solvedDates,
              [reqPuzzleDate]: {
                s: false,
                g: 0
              }
            });
          }
          setSubmissions([]);
          setPuzzleDate(date);
        } else if (puzzleDate !== date) {
          setPuzzleDate(date);
        }
      })
      .catch(err => console.log(err));
  }, [paintMode, reqPuzzleDate]);

  useEffect(() => {
    if(guesses === 0){
        solvePuzzle();
    }
  }, [guesses]);

  const onTapElement = (i: number) => {
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

  const sortBoard = () => {
      setBoard(sortBoardByCategory(board));
  };

  const sortBoardByCategory = (currentBoard: WordElement[]) => {
      const newBoard = [...currentBoard].sort((a, b) => {
          if(a.categoryLevel === 0) return 1;
          if(b.categoryLevel === 0) return -1;
          return a.categoryLevel - b.categoryLevel;
      });
      return newBoard;
  };

  const reconfigureBoard = (answerElements: WordElement[]) => {
      const currentAnswerNames = answers.reduce((elements: WordElement[], el) => elements.concat(el.answers), []).concat(answerElements).map(el => el.name);
      const unAnsweredBoard = board.filter((el: WordElement) => currentAnswerNames.indexOf(el.name) === -1);
      setBoard(unAnsweredBoard);
  };

  const submitPaint = () => {
      axios.post<{
        correct: boolean;
        oneAway?: boolean;
        answers?: AnswerElement[];
      }>(`${SERVER_URL}/paint`, {
          values: board,
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(data => {
            setLoading(false);
            const { correct, answers: updatedAnswers, oneAway } = data.data;
            if(!correct){
              const message = oneAway ? "Only Two Answers Wrong!" : "Incorrect Paint";
              addBoardToSubmissions();
              alert(message);
              const updatedPuzzelDates = { ...solvedDates };
              updatedPuzzelDates[reqPuzzleDate].g += 1;
              setSolvedDates(updatedPuzzelDates);
              return;
            }
            setAnswers(updatedAnswers || []); 
            deselectBoard();
            setBoard([]);
            const updatedPuzzelDates = { ...solvedDates };
            updatedPuzzelDates[reqPuzzleDate].s = true;
            setSolvedDates(updatedPuzzelDates);
        }).catch(err => {
          setLoading(false)
          console.log(err)
        });
      ;
  }

  const addBoardToSubmissions = () => {
      const sortedB = sortBoardByCategory(board);
      setSubmissions([...submissions, sortedB]);
  }

  const checkSubmissions = () => {
      const sortedB = sortBoardByCategory(board);
      return submissions.every((submittedBoard) => {
          return submittedBoard.some((el, i) => {
              const currentEl = sortedB[i];
              return el.name !== currentEl.name || el.categoryLevel !== currentEl.categoryLevel
          })
      });
  };

  const onSubmit = () => {
    setLoading(true);
    const elements = board.filter(el => el.selected);
    if(elements.length !== requiredSelection()) return;
    if(!checkSubmissions()){
      setLoading(false);
      alert('Already Submitted!');
      return;
    }
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
      axios.post<SolvedElement[]>(`${SERVER_URL}/solve`, {
        answers
      },{
          headers: {
            'Content-Type': 'application/json'
          }
        })
          .then(data => {
            const solutions = data.data;
            const currAnswers = [...answers];
            solutions.forEach((el) => {
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

  const toggleModal = () => {
    setShowModal(!showModal);
  }

  const preventSubmit = () => {
      const hardModeIssues = ((hardMode || answers.length === 3) && input.length === 0);
      const paintModeIssues = paintMode && Object.values(board.reduce((dict: { [key: string]: number }, el) => {
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
  
  return (
    <AppContainer>
      <DateControl>
        <Button name="< Prev" disabled={moment(reqPuzzleDate) <= moment("2024-07-01")} onSubmit={() => { setReqPuzzleDate(moment(reqPuzzleDate).subtract(1, 'day').format("YYYY-MM-DD"))}}/>
        <Title>Phoney Connect</Title>
        <Button name="Next >" disabled={moment(reqPuzzleDate).add(1, 'day') >= moment() } onSubmit={() => { setReqPuzzleDate(moment(reqPuzzleDate).add(1, 'day').format("YYYY-MM-DD"))}}/>
      </DateControl>
      <SubTitle>
      <SubT>Create Four Categories with Any Four Colors</SubT>
      <Detail>
          <InfoLink href="https://github.com/petersimonsen/lonely-connect" rel="noreferrer" target="_blank">Github➚</InfoLink>
          <PuzzleDate>{moment(reqPuzzleDate).format("LL")} {solvedDates[reqPuzzleDate] && solvedDates[reqPuzzleDate].s ? `✅ (${solvedDates[reqPuzzleDate].g + 1})` : null}</PuzzleDate>
          <DetailVisible onClick={toggleModal}>ⓘ</DetailVisible>
      </Detail>
      {/*<div>
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
      </div>*/}
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
      {(hardMode || answers.length === 3) && <ConnectInput>{answers.length === 3 ? "Final " : ""} Connection: <input value={input} onInput={e => setInput((e.target as HTMLTextAreaElement).value)} /></ConnectInput>}
      {paintMode && <PaintContainer>{Object.keys(colorVal).map((key, i) => {
        return <ColorBox selected={key === `${catColor}`} color={colorVal[key]} onClick={() => setCatColor(Number(key))} key={`${colorVal[key]}-${i}`} />
      })}</PaintContainer>}
      <Guesses paintMode={paintMode} guesses={solvedDates[reqPuzzleDate] ? solvedDates[reqPuzzleDate].g : 0} />
      <div>
          <Button name="Sort" onSubmit={sortBoard}/>
          <Button name="Shuffle" onSubmit={shuffleBoard}/>
          <Button name="Clear" disabled={board.filter(el => el.selected).length === 0} onSubmit={deselectBoard}/>
          <Button name="Submit" disabled={preventSubmit()} onSubmit={onSubmit}/>
      </div>
      {
        showModal && <Modal><ModalContent closeModal={toggleModal}/></Modal>
      }
    </AppContainer>
  );
}

const PuzzleDate = styled.h4`
  padding: 0;
  margin: 0;
`;

const DateControl = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-around;
  align-items: baseline;
`;

const SubT = styled.h5`
  padding: 10px 5px;
  margin: 0px;
`;
const InfoLink = styled.a`
  text-decoration: none;
  color: #666666;
`;

const DetailVisible = styled.div`
  display: inline;
  font-size: 20px;
  padding-right: 10px;
`;

const Detail = styled.div`
  display:flex;
  flex-direction:row;
  justify-content: space-between;
  padding: 5px 0 5px 0;
`;

const AppContainer = styled.div`
  text-align: center;
`;

const PaintContainer = styled.div`
  margin: 10px 0;
  display:inline-block;
`;

const SubTitle = styled.div`
  display: flex;
  font-weight: bold;
  padding: 5px;
  flex-direction:column;
  justify-content: space-around;
`;

const ColorBox = styled.div<{ 
  color: string;
  selected: boolean;
}>`
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

const Title = styled.h2`
  margin-bottom: 0px;
`;

export default App;
