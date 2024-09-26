import React from 'react';
import ReactDOM from 'react-dom';
const modalRoot = document.getElementById('modal-root')!;

type ModalProps = {
  children: React.ReactNode;
};

class Modal extends React.Component <ModalProps>{
  el: HTMLElement;
  constructor(props: ModalProps) {
    super(props);
    this.el = document.createElement('div');
  }

  componentDidMount() {
    modalRoot.appendChild(this.el);
  }

  componentWillUnmount() {
    modalRoot.removeChild(this.el);
  }

  render() {
    return ReactDOM.createPortal(
      this.props.children,
      this.el
    );
  }
}

export default Modal;
