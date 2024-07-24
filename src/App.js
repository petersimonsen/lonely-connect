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
const Element = ({name, selectable, selected, categoryLevel, onSelect, index}) => {
    
    const getBackgroundColor = () => {
        if(categoryLevel === 0) return selected ? "gray" : "white";
        const colorVal = {
          "1": "yellow",
          "2": "green",
          "3": "blue",
          "4": "purple",
        }
        return colorVal[ categoryLevel + ""];
    }
    const elStyle = {
      padding: "10px",
      pointerEvents: selectable ? "auto" : "none",
      backgroundColor: getBackgroundColor(),
    };
    return <div style={elStyle} onClick={() => {
      onSelect(index)}
    }>{name}</div>;
};


function App() {

  const [board, setBoard] = useState(Array(16).fill({}));
  const [loading, setLoading] = useState(false);
  const [guesses, setGuesses] = useState(0);
  const [answers, setAnswers] = useState([]);

  //make sure we know useeffect stuff
  useEffect(() => {   
      axios.get('http://localhost:3001/board')
      .then(data => {
        setBoard(data.data.flat().map((name) => ({
          name,
          selectable: true,
          categoryLevel: 0,
          selected: false
        })));
      })
      .catch(err => console.log(err));
      
  }, [setBoard]); 

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

  const reconfigureBoard = (updatedAnswers) => {
      const answeredVals = board.filter((el) => {
          return !el.selectable && el.categoryLevel > 0;
      });
      const answerVals = answeredVals.concat(updatedAnswers);
      const answerNames = answerVals.map(el => el.name);
      console.log(answerVals);
      const unAnsweredBoard = board.filter((el) => answerNames.indexOf(el.name) === -1);
      setBoard(answerVals.concat(unAnsweredBoard));
  };

  const onSubmit = () => {
    setLoading(true);
    const elements = board.filter(el => el.selected);
    if(elements.length != 4) return;

    //const response = await connectValues(values);
    axios.post('http://localhost:3001/connect', {
        values: elements.map(el => el.name)
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(data => {
       
        const response = data.data;
        setLoading(false);
        if(response["correct"]){
          
          const updatedAnswers = answers.concat([{
            categoryLevel: response["categoryLevel"],
            description: response["categoryDescription"],
          }]);
          setAnswers(updatedAnswers);
          const answerElements = elements.map((el) => ({
              name: el.name,
              selected: false,
              selectable: false,
              categoryLevel: response["categoryLevel"] + 1
            }));
          reconfigureBoard(answerElements);
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
        // const selected = selectedInd.indexOf(i) > -1;
        // const selectable = !loading && (selectedInd.length < 4 || selected)
        return <Element 
          {...el}
          selectable={el.selectable && !loading && (!fourSelected() || el.selected)}   
          index={i} 
          onSelect={onTapElement} />
      })}
      </div>
      <div>
          <Button name="Shuffle" onSubmit={() => {}}/>
          <Button name="Deselect" disabed={board.filter(el => el.selected).length === 0} onSubmit={deselectBoard}/>
          <Button name="Submit" disabled={loading || !fourSelected()} onSubmit={onSubmit}/>
      </div>
      <div>
          Incorrect Guesses: {guesses}
      </div>
    </div>
  );
}


export default App;
