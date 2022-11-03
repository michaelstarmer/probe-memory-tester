import React from "react";
import styled from "styled-components";
import {useRef} from 'react'

const Div = styled.div`
    height: 400px;
    overflow-y: scroll;
    /* scrollbar-width: 0px; */
    &::-webkit-scrollbar {
        /* display: none; */
        width: 5px;
    }
    &::-webkit-scrollbar-track {
        background: transparent;
    }
    &::-webkit-scrollbar-thumb {
        /* background: rgb(28, 30, 31); */
        background: rgba(150, 150, 150, .4);
    }
`
export const LogContent = (props) => {
    return <Div {...props}>{props.children}</Div>
}

export default LogContent;