import React from "react";
import styled from "styled-components";
import './JobLog.css'
const SnippetDiv = styled.div`
    font-family: 'Inconsolta', monospace;
    font-size: 14px;
    background-color: rgba(30, 39, 41, .9);
    text-shadow: rgb(55 60 62) 0px 0px 5px;
    position: fixed;
    /* overflow-y: scroll; */
    bottom: 0;
    left: 0;
    height: 450px;
    width: 300px;
    /* box-shadow: 3px 5px 6px 8px #000; */
    transition: 50ms ease-in-out;
    

`
export const Snippet = (props) => {
    return <SnippetDiv {...props}>{props.children}</SnippetDiv>
}

export default Snippet;