import { colorVal } from './Utils';

export const elStyle = {
  margin: "10px",
  padding: "10px",
  fontWeight: "bold",
  display: "flex",
  height: "100px",
  width: "100px",
  justifyContent: "center",
  alignItems: "center",
  borderRadius: "10px",
  fontSize: "18px"
};

export const Element = ({name, selectable, selected, categoryLevel, onSelect, index}) => {
    
    const getBackgroundColor = () => {
        if(categoryLevel === 0) return selected ? "#555555" : "#eeeeee";
        return colorVal[ categoryLevel + ""];
    }
    
    return <div style={{
      ...elStyle, 
      pointerEvents: selectable ? "auto" : "none",
      backgroundColor: getBackgroundColor(),
      color: selected ? "white" : "black",
    }} onClick={() => {
      onSelect(index)}
    }>{name}</div>;
};