const Button = ({name, onSubmit, disabled}) => {
    const elStyle = {
      padding: "10px",
      margin: "0 10px 0 10px",
      backgroundColor: "white",
      fontWeight: "bold",
      borderRadius: "30px",
      fontSize: "16px",
    };
    return <button disabled={disabled} style={elStyle} onClick={onSubmit}>{name}</button>
};

export default Button;