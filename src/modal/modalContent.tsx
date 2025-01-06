import styled from 'styled-components';

const InfoModal = ({closeModal} : {closeModal: () => void}) => {
	return (<ModalContent onClick={closeModal}>
		<Background>
			<h4>How to Play</h4>
				<span>
					<p>Phoney Connect pulls its daily puzzle from a certain other popular online game.</p>
					<p>Submit all 16 answers at once! The specific colors you select for each category do not matter and do not correspond to difficulty.</p>
					<p>You may only submit a valid 4x4 board. You get unlimited guesses.</p>	
				</span>
			<h4>Why?</h4>
				<List>
					<ListItem>The final category, often the hardest, can feel like a 'gimme'</ListItem>
					<ListItem>I needed a project. <i>You think a depressed person could make <b>*this?*</b></i></ListItem>
					<ListItem>The other guys stole the idea anyway</ListItem>
				</List>
		</Background>
	</ModalContent>);
};

const ListItem = styled.li`
	margin-bottom: 5px;
`;

const List = styled.ol`
	padding-inline-start: 1em;
`;

const Background = styled.div`
  background-color: #EEEEEE;
  opacity: 0.96;
  border-radius: 40px;
  border: 1px solid black;
  padding: 10%;
  display:flex;
  flex-direction: column;
  align-items: center;
`;

const ModalContent = styled.div`
  position: fixed;
  height: 100%;
  width: 90%;
  top: 0;
  left: 5%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default InfoModal;