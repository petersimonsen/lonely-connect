import colorVal from './Utils';
import styled from 'styled-components';
import { useMediaQuery } from 'react-responsive'
import { WordElement } from '../data/element';


const mobile = {
  elSize: "50px",
  fontSize: "12px"
}

const desktop = {
  elSize: "100px",
  fontSize: "18px"
}

export type ElementProps = WordElement & {
  index: number;
  key: number;
  onSelect: (index: number) => void;
};

const useMobile = () => useMediaQuery({maxWidth: 400});

export const Element = (props: ElementProps) => {
    return <ElBox  
      categoryLevel={props.categoryLevel}
      selectable={props.selectable}
      selected={props.selected}
      key={props.index} 
      mobileScreen={useMobile()} 
      onClick={() => {
        props.onSelect(props.index)}
    }>{props.name}</ElBox>;
};

type ElementBoxProps = {
  categoryLevel: number;
  selected: boolean;
  selectable: boolean;
  key: number;
  onClick: () => void;
  mobileScreen: boolean;
  children: React.ReactNode;
}

const ElBox = styled.div<ElementBoxProps>`
  margin: 3px;
  padding: 17px;
  font-weight: bold;
  display: flex;
  height: ${props => props.mobileScreen ? mobile.elSize : desktop.elSize};
  width: ${props => props.mobileScreen ? mobile.elSize : desktop.elSize};
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  font-size: ${props => props.mobileScreen ? mobile.fontSize : desktop.fontSize};
  pointer-events: ${props => props.selectable ? "auto": "none"};
  color: ${props => props.selected ? "white" : "black"};
  background-color: ${props => {
      if(props.categoryLevel === 0) return props.selected ? "#555555" : "#eeeeee";
      return colorVal[ props.categoryLevel + ""];
  }};

`;
