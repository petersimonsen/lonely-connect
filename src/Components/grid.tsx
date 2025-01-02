import { useContext } from 'react';
import styled from 'styled-components';
import MobileContext from '../data/contexts';

export type GridProps = {
  columns: number;
  hide?: boolean;
  children: React.ReactNode
};

type GridComponentProps = Omit<GridProps, "children"> & {
  mobile: boolean;
}

export const Grid = styled.div<GridComponentProps>`
  display: grid;
  grid-template-columns: ${(props) => {
        let cols = "";
        for(let i = 0; i < props.columns; i++){
          cols += "auto ";
        }
        return cols;
    }};
  margin: 0 auto; 
  width: ${(props) => {
    const cols = props.columns;
    if(!props.mobile) return "auto";
    if(cols === 1) return "100%";
    return `calc(22.5vw * ${cols} + 8px * ${cols - 1})`;
  }};
  height: auto;
`;


export const ConnectGrid = (props: GridProps) => {
  const mobile = useContext(MobileContext);
  return <Grid 
  {...props}
  mobile={mobile}>
    {props.children}
  </Grid>;
}