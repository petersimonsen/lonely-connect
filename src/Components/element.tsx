import colorVal from './Utils';
import styled from 'styled-components';
import { useMediaQuery } from 'react-responsive'
import { WordElement } from '../data/element';


const mobile = {
  elSize: "22.5vw",
  fontSize: "12px"
}

const desktop = {
  elSize: "150px",
  fontSize: "18px"
}

const useMobile = () => useMediaQuery({maxWidth: 640});

export type ElementProps = WordElement & {
  index: number;
  key: number;
  onSelect: (index: number) => void;
};

export const Element = (props: ElementProps) => {
  const ElementComponent = useMobile() ? ElBoxMobile : ElBoxDesktop;
    return <ElementComponent  
      categoryLevel={props.categoryLevel}
      selectable={props.selectable}
      selected={props.selected}
      key={props.index} 
      onClick={() => {
        props.onSelect(props.index)}
    }>{props.name}</ElementComponent>;
};

type ElementBoxProps = Omit<WordElement, "name"> & {
  key: number;
  onClick: () => void;
  children: React.ReactNode;
}

const BasicElement = styled.div<ElementBoxProps>`
  margin: 3px;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  pointer-events: ${props => props.selectable ? "auto": "none"};
  color: ${props => props.selected ? "white" : "black"};
  background-color: ${props => {
      if(props.categoryLevel === 0) return props.selected ? "#555555" : "#eeeeee";
      return colorVal[ props.categoryLevel + ""];
  }};
`;

const ElBoxMobile = styled(BasicElement)<ElementBoxProps>`
  height: ${mobile.elSize};
  width: ${mobile.elSize};
  font-size: ${mobile.fontSize};
`;

const ElBoxDesktop = styled(BasicElement)<ElementBoxProps>`
  height: ${desktop.elSize};
  width: ${desktop.elSize};
  font-size: ${desktop.fontSize};
`;
