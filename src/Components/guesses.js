import styled from 'styled-components';

export const Guesses = ({ guesses, paintMode }) => {
    const guessDots = [];
    for(let i = 0; i < guesses; i++){
      guessDots.push(<Dot key={i}/>);
    }
    if(paintMode) {
        if(guesses === 0) return null;
        return <GuessesSection>
            Incorrect Guesses: {guessDots}
        </GuessesSection>;
    }
    return <GuessesSection>
        Remaining Guesses: {guessDots}
    </GuessesSection>;
};


const GuessesSection = styled.div`
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