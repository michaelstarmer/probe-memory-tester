import React from "react";
import styled from 'styled-components';
import './JobLog.css'

const Div = styled.div`
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
    text-transform: uppercase;
    position: relative;
    width: 100%;
    height: 35px;
    /* color: white; */
    /* background: rgba(20, 20, 20, .8); */
    background: rgba(150, 150, 150, .1);
    font-size: 1.0rem;
`
const Title = (props) => {
    return (<Div className="p-2 d-flex justify-content-between" onClick={props.onClick}>{props.children}</Div>)
}

export default Title;