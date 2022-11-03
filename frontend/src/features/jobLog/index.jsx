import React, { useEffect, useState, useRef } from "react";
import { atom, useAtom } from 'jotai';
import API from '../../utils/api'
import { useParams } from "react-router-dom";
import styled from "styled-components";
import './JobLog.css'
import { ReactComponent as IconArrowDown } from './icons/chevron-down.svg'
import { ReactComponent as IconArrowUp } from './icons/chevron-up.svg'
import Icon from './Icon'
import Snippet from './Snippet'
import Title from "./Title";
import LogContent from "./LogContent";
import moment from 'moment';
import 'moment/locale/en-gb'
moment().locale('en-gb')

const logData = atom(async (get) => {
    let { id } = useParams()
    const url = `/api/jobs/${id}/log`;
    const response = await API.get(url)
    if (response && response.data) {
        return response.data.reverse();
    }
})

const renderLog = (logs) => {
    const logsElements = logs.map(element => {
        return <div key={element.id}>
           <span className={`log-${element.type}`}>[ {element.created_at} ]</span> {element.message}
        </div>
    });
    return logsElements
}

export function JobLog({ id }) {
    const bottomRef = useRef(null);
    const [ log ] = useAtom(logData)
    const [ logEntries, setEntries ] = useState([])
    const [ logMinimized, setLogMinimized ] = useState(false);
    useEffect(() => {
        setInterval(() => {
            if (!logEntries.length || logEntries.length < log.length) {
                setEntries(current => [...current, ...log.slice(current.length)])
            }
        }, 600)
    }, [])
    useState(() => {

    })
    
    const handleClick = () => setLogMinimized(!logMinimized)
    return (
        <Snippet id="log" className={`snippet ${logMinimized ? 'log-hide' : ''}`}>
            <Title onClick={handleClick}>
                <span>log</span>
                <Icon>
                    { logMinimized ? <IconArrowUp color="#fff" /> : <IconArrowDown color="#fff" /> }
                </Icon>
            </Title>
            <LogContent ref={bottomRef}>
                {renderLog(logEntries)}
            </LogContent>
        </Snippet>
    )
}

export default JobLog;