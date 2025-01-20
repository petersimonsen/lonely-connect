import styled from 'styled-components';

export type GuessProps = {
    guesses: number;
    paintMode: boolean;
}

export const Guesses = ({ guesses, paintMode }: GuessProps) => {
    const guessDots = [];
    for(let i = 0; i < guesses; i++){
      guessDots.push(<Dot key={i}/>);
    }
    const guessDisplay = (guesses > 4) ? <GuessNum>{guesses}</GuessNum> : guessDots
    if(paintMode) {
        if(guesses === 0) return null;
        return <GuessesSection>
            Phoney Connects: {guessDisplay}
        </GuessesSection>;
    }
    return <GuessesSection>
        Remaining Guesses: {guessDots}
    </GuessesSection>;
};

const GuessNum = styled.h4`
    display: inline;
`;

const GuessesSection = styled.div`
  margin: 5px 0 10px 0;
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