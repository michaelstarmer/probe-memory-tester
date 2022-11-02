import React from "react";
import { atom, useAtom } from "jotai";
import API from "../../utils/api";
import styled from "styled-components";
import { Link } from "react-router-dom";

const alertData = atom(async (get) => {
    const url = '/api/alerts/latest'
    const response = await API.get(url);
    if (response && response.data) {
        console.log(response.data)
        return response.data;
    }
})

const AlertLink = styled(Link)`
    text-decoration: none;
    color: inherit;
`

const Ul = styled.ul`
    list-style: none;
    padding: 0;
    font-size: 0.8rem;
    a,
    a:hover {
        color: inherit;
    }
`

const Alert = ({ job_id, level, message, created_at }) => {
    let colorCode = '#ff0000';
    if (level === 'low')
        colorCode = '#f9e154'
    else if (level === 'medium')
        colorCode = '#ec942c';
    const Timestamp = styled.span`
        color: ${props => props.color};
    `
    return (
        <li class="py-1">
            <AlertLink to={`/jobs/${job_id}`}>
                <Timestamp color={colorCode}><strong>{created_at}: </strong></Timestamp>
                {message}
            </AlertLink>
        </li>
    )
}

export function AlertList() {
    let [ alerts ] = useAtom(alertData)
    return (
        <Ul className="">
            {alerts.map(it => <Alert job_id={it.job_id} level={it.level} message={it.message} created_at={it.created_at} />)}
        </Ul>
    )
}

export default AlertList;