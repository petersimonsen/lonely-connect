import './App.css';
import {useState} from 'react';
import testData from './connect.json';

const Button = ({name, onSubmit, disabled}) => {
    const elStyle = {
      padding: "10px",
      margin: "0 10px 0 10px"
    };
    return <button disabled={disabled} style={elStyle} onClick={onSubmit}>{name}</button>
};

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

  const [board, setBoard] = useState(testData.flat());
  const [selectedInd, setSelectedIndexes] = useState([]);

  // useEffect(() => {   
  //     // setBoard(testData.flat());
  // }, [board, setBoard, selected]);

  const onTapElement = (i) => {
      if(selectedInd.indexOf(i) > -1){
          selectedInd.splice(selectedInd.indexOf(i), 1);
      } else {
          selectedInd.push(i);  
      }
      setSelectedIndexes(selectedInd.concat([]));
  };

  return (
    <div className="App">
      Lonely Connect
      <div style={{
        display: "grid",
        gridTemplateColumns: "auto auto auto auto"
      }}>
      {board.map((el, i) => {
        const selected = selectedInd.indexOf(i) > -1;
        return <Element selectable={selectedInd.length < 4 || selected} selected={selected} name={el} index={i} onSelect={onTapElement} />
      })}
      </div>
      <div>
          <Button name="Shuffle" disabed={selectedInd.length > 0} onSubmit={() => {}}/>
          <Button name="Deselect" disabed={selectedInd.length === 0} onSubmit={() => setSelectedIndexes([])}/>
          <Button name="Submit" />
      </div>
    </div>
  );
}


export default App;
