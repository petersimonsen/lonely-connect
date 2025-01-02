import { useContext } from 'react';
import MobileContext from '../data/contexts';
import styled from 'styled-components';
import colorVal from './Utils';
import { WordElement } from '../data/element';

type AnswerBarProps = {
  elements: WordElement[];
  categoryLevel: number;
  index: number;
  description: string;
};

const AnswerBar = ({elements, categoryLevel, index, description}: AnswerBarProps) => {
    const mobile = useContext(MobileContext);
    return <AnswerBarComponent categoryLevel={categoryLevel} mobile={mobile}>
          <AnswerName>
            {description}
            </AnswerName>
          <Names>
            {elements.map(el => el.name).join(", ")}</Names>
        </AnswerBarComponent>;
};

const AnswerName = styled.h3`
  margin: 0 auto 10px;
`;

const AnswerBarComponent = styled.div<{ categoryLevel: number, mobile: boolean}>`
  margin: 10px;
  padding: 10px;
  font-weight: bold;
  display: flex;
  height: ${props => props.mobile ? "auto" : "100px"};
  justify-content: center;
  flex-direction: column;
  align-items: center;
  border-radius: 10px;
  font-size: 18px;
  background-color: ${props => colorVal[props.categoryLevel + ""]}
`;

const Names = styled.div`
  font-weight: normal;
  font-size: 16px;
`;

export default AnswerBar;