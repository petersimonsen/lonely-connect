import styled from 'styled-components';
import { colorVal } from './Utils';


export const elStyle = {
  margin: "10px",
  padding: "10px",
  fontWeight: "bold",
  display: "flex",
  height: "100px",
  justifyContent: "center",
  flexDirection: "column",
  alignItems: "center",
  borderRadius: "10px",
  fontSize: "18px"
};

//what did we learn?
const AnswerBar = ({elements, categoryLevel, index, description}) => {
    const answerStyle = {
      ...elStyle,
      backgroundColor: colorVal[categoryLevel + ""]
    };
    return <div style={answerStyle}>
          <h3>
            {description}
            </h3>
          <Names>
            {elements.map(el => el.name).join(", ")}</Names>
        </div>;
};

const Names = styled.div`
  font-weight: normal;
  font-size: 16px;
`;

export default AnswerBar;