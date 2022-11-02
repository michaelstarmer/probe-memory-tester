import React, { useState } from "react";
import { atom, useAtom } from 'jotai';
import api from '../../utils/api'
import { useParams } from "react-router-dom";
import styled from "styled-components";
import './JobLog.css'
import { ReactComponent as IconArrowDown } from './icons/chevron-down.svg'
import { ReactComponent as IconArrowUp } from './icons/chevron-up.svg'


const Snippet = styled.div`
    font-family: 'Inconsolta', monospace;
    font-size: 14px;
    background-color: rgb(30, 39, 41);
    text-shadow: rgb(55 60 62) 0px 0px 5px;
    position: fixed;
    bottom: 0;
    left: 0;
    height: 400px;
    width: 600px;
    /* box-shadow: 3px 5px 6px 8px #000; */
    transition: 50ms ease-in-out;
`

const LogTitle = styled.div`
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
    text-transform: uppercase;
    position: relative;
    width: 100%;
    height: 50px;
    /* color: white; */
    /* background: rgba(20, 20, 20, .8); */
    background: rgba(150, 150, 150, .1);
    font-size: 1.2rem;
`

const LogEntry = styled.div`
    color: ${props => props.color};
`



const logData = atom(async (get) => {
    let { id } = useParams()
    const url = `http://localhost:3333/api/jobs/${id}/log`;
    const response = await api.get(url)
    if (response && response.data) {
        console.log(response.data)
        return response.data;
    }
})

const LogContent = styled.div`
    overflow-y: scroll;
    height: 100%;
    scrollbar-width: thin;

`

const renderLog = (logs) => {
    if (!logs) {
        return <div id="log-loading">Loading logs...</div>
    }
    const logsElements = logs.map(element => {
        return <div className={`log-${element.type}`}>
            {element.type}: {element.message}
        </div>
    });
    return logsElements



}

export function JobLog({ id }) {
    const [ log ] = useAtom(logData)
    const [ logMinimized, setLogMinimized ] = useState(false);

    const handleClick = () => {
        console.log('Hiding log')
        console.log({ logMinimized })
        setLogMinimized(!logMinimized)
        document.getElementById('log').classList.toggle('log-hide');
    }

    return (
        <Snippet id="log" className="snippet">
            <LogTitle className="p-2 d-flex justify-content-between" onClick={() => handleClick()}>
                <span>log</span>
                <span>
                    {
                        logMinimized ? <IconArrowUp /> : <IconArrowDown />
                    }
                </span>
            </LogTitle>
            <LogContent>
                {renderLog(log)}
            </LogContent>
        </Snippet>

    )
}

export default JobLog;