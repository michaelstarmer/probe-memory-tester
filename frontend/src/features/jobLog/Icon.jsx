import React from "react"
import styled from "styled-components";

const Span = styled.span`
    /* background: rgba(204, 142, 53, .8); */
    border: 1px solid #fff;
    height: 30px;
    width: 30px;
    text-align: center;
    cursor: pointer;
    border-radius: 50%;
    font-size: 1rem;
    &:hover {
        border-color: rgb(204, 142, 53);
        background: rgba(204, 142, 53, 1.0);
    }
`
export const Icon = props => {
    return <Span>{props.children}</Span>
}

export default Icon;