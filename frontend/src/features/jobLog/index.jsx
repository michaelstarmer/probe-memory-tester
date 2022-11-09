import React, { useEffect, useState, useRef } from "react";
import { atom, useAtom } from 'jotai';
import API from '../../utils/api'
import { useParams } from "react-router-dom";
import styled from "styled-components";
import './JobLog.css'
// import IconLoader from "./Icon";
import Spinner from "../loader/Spinner";
import { ReactComponent as IconLoader } from './Icon/loader.svg'

import { ReactComponent as IconArrowDown } from './Icon/chevron-down.svg'
import { ReactComponent as IconArrowUp } from './Icon/chevron-up.svg'

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

const LoaderContainer = styled.div`
    width: 100%;
    height: 100%;
    /* background: rgba(200, 200, 200, .1); */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`
const Loader = styled.div`
    animation: spin 10s linear infinite;
    margin-bottom: .8rem;

    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
`

const renderLoaderAnimation = () => {
    return <LoaderContainer>
        <Spinner />
        <div>
            Loading logs...
        </div>
    </LoaderContainer>
}

const renderLog = (logs) => {
    if (!logs || logs.length < 1) {
        return renderLoaderAnimation()
    }
    const logsElements = logs.map(element => {
        return <div key={element.id}>
            <span className={`log-${element.type} mt-2`}>{element.created_at}: </span>{element.message}
        </div>
    });
    return logsElements
}

export function JobLog(props,{ id }) {
    const bottomRef = useRef(null);
    const [ log ] = useAtom(logData)
    const [ logEntries, setEntries ] = useState([])
    useEffect(() => {
        setInterval(() => {
            if (!logEntries.length || logEntries.length < log.length) {
                setEntries(current => [ ...current, ...log.slice(current.length) ])
            }
        }, 600)
    }, [])
    useState(() => {

    })

    return (
        <Snippet id="log" className={`snippet ${props.logMinimized ? 'log-hide' : ''}`}>
            <Title onClick={props.toggleLog}>
                <span>log</span>
                <Icon>
                    {props.logMinimized ? <IconArrowUp color="#fff" /> : <IconArrowDown color="#fff" />}
                </Icon>
            </Title>
            <LogContent ref={bottomRef}>
                {renderLog(logEntries)}
            </LogContent>
        </Snippet>
    )
}

export default JobLog;