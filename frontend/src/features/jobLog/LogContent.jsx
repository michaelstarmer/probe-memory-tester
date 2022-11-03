import React from "react";
import styled from "styled-components";
import {useRef} from 'react'

const Div = styled.div`
    height: 300px;
    overflow-y: scroll;
`
export const LogContent = (props) => {
    return <Div {...props}>{props.children}</Div>
}

export default LogContent;