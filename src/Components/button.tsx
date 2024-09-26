type ButtonProps = {
    name: string;
    onSubmit: () => void;
    disabled?: boolean;
};  

const Button = ({name, onSubmit, disabled}: ButtonProps) => {
    const elStyle = {
      padding: "10px",
      margin: "0 8px",
      backgroundColor: "white",
      fontWeight: "bold",
      borderRadius: "30px",
      fontSize: "16px",
    };
    return <button disabled={disabled} style={elStyle} onClick={onSubmit}>{name}</button>
};

export default Button;