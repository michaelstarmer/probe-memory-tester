import React from "react";
import { atom, useAtom } from 'jotai';
import api from '../../utils/api'
import { useParams } from "react-router-dom";
import styled from "styled-components";

const Snippet = styled.div`
    font-family: 'Inconsolta', monospace;
    font-size: 14px;
    padding: 5px;
    background-color: rgb(30, 39, 41);
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

const renderLog = (logs) => {
    if (!logs) {
        return <div id="log-loading">Loading logs...</div>
    }
    return logs.map(element => {
        return <div className=''>
            {element.type}: {element.message}
        </div>
    });
}

export function JobLog({ id }) {
    const [ log ] = useAtom(logData)
    return (
        <Snippet id="log" className="snippet">
            {renderLog(log)}
        </Snippet>

    )
}

export default JobLog;