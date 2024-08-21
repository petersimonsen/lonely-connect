import styled from 'styled-components';

const InfoModal = ({closeModal}) => {
	return (<ModalContent onClick={closeModal}>
		<Background>
		<h4>How to Play</h4>
		<p>Phoney Connect pulls it's puzzle daily from a certain other popular online game.</p>
		<p>In this version, you submit all 16 answers at once! The specific colors you select for each category do not matter and do not correspond to difficulty.</p>
		<h4>Why?</h4>
		<p>I'm not eligible for <a rel="noreferrer" href="https://www.youtube.com/results?search_query=only+connect" target="_blank">the original version</a> and they copied that idea anyway.</p>
		<p>The original idea came because the final category, often the hardest always feels like a 'gimme', and it's more fun to play with each of the red harrings in each puzzle all at once.</p>
		</Background>
	</ModalContent>);
};

const Background = styled.div`
  background-color: #EEEEEE;
  border-radius: 40px;
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