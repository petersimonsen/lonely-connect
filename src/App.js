import './App.css';
import {useState, useEffect} from 'react';
// import testData from './connect.json';
import axios from 'axios';

const Button = ({name, onSubmit, disabled}) => {
    const elStyle = {
      padding: "10px",
      margin: "0 10px 0 10px"
    };
    return <button disabled={disabled} style={elStyle} onClick={onSubmit}>{name}</button>
};
//what did we learn?
const Element = ({name, selectable, selected, difficulty, onSelect, index}) => {
    // console.log(name);   
    const elStyle = {
      padding: "10px",
      pointerEvents: selectable ? "auto" : "none",
      backgroundColor: selected ? "gray" : "white",
    };
    return <div style={elStyle} onClick={() => {
      onSelect(index)}
    }>{name}</div>;
};


function App() {

  const [board, setBoard] = useState(Array(16).fill(""));
  const [selectedInd, setSelectedIndexes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [guesses, setGuesses] = useState(0);
  const [answers, setAnswers] = useState([]);

  //make sure we know useeffect stuff
  useEffect(() => {   
      axios.get('http://localhost:3001/board')
      .then(data => {
        setBoard(data.data.flat());
      })
      .catch(err => console.log(err));
      
  }, [setBoard]); 

  const onTapElement = (i) => {
      if(selectedInd.indexOf(i) > -1){
          selectedInd.splice(selectedInd.indexOf(i), 1);
      } else {
          selectedInd.push(i);  
      }
      setSelectedIndexes(selectedInd.concat([]));
  };

  const reconfigureBoard = (updatedAnswers) => {
      const answerVals = updatedAnswers.reduce((allVals, answer) => {
        return allVals.concat(answer.values);
      },[]);
      const unAnsweredBoard = board.filter((boardVal) => answerVals.indexOf(boardVal) === -1);
      setBoard(answerVals.concat(unAnsweredBoard));
  };

  const onSubmit = () => {
    setLoading(true);
    const values = selectedInd.map(ind => board[ind]);

    //const response = await connectValues(values);
    axios.post('http://localhost:3001/connect', {
        values
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(data => {
       
        const response = data.data;
         console.log(response);
        setLoading(false);
        if(response["correct"]){
          setSelectedIndexes([]); //only if valid
          const updatedAnswers = answers.concat([{
            categoryLevel: response["categoryLevel"],
            description: response["categoryDescription"],
            values
          }]);
          setAnswers(updatedAnswers);
          reconfigureBoard(updatedAnswers);
          //set board
        } else {
          if(response.oneAway) alert("One Away");
          setGuesses(guesses + 1); //only if not guessed before      
        }
        
    
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
    
  }

  return (
    <div className="App">
      Lonely Connect
      <div style={{
        display: "grid",
        gridTemplateColumns: "auto auto auto auto"
      }}>
      {board.map((el, i) => {
        const selected = selectedInd.indexOf(i) > -1;
        const selectable = !loading && (selectedInd.length < 4 || selected)
        return <Element 
          selectable={selectable} 
          selected={selected} 
          name={el} 
          index={i} 
          onSelect={onTapElement} />
      })}
      </div>
      <div>
          <Button name="Shuffle" disabed={selectedInd.length > 0} onSubmit={() => {}}/>
          <Button name="Deselect" disabed={selectedInd.length === 0} onSubmit={() => setSelectedIndexes([])}/>
          <Button name="Submit" disabled={loading || selectedInd.length !== 4} onSubmit={onSubmit}/>
      </div>
      <div>
          Guesses: {guesses}
      </div>
    </div>
  );
}


export default App;
