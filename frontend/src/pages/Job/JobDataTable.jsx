import React from "react";
import styled from "styled-components";
import { Link } from 'react-router-dom'
const ETable = styled.table`
    color: rgb(209, 205, 199);
    border-color: rgb(56, 61, 63);
`

const TableLink = styled(Link)`
    text-decoration: none;
`

const TableRow = (props) => {
    return (
        <tr>
            <th>{props.title}</th>
            <td>
                {props.children}
            </td>
        </tr>
    )
}

const C_Link = (props, { to }) => {
    return props.href ?
        <a href={props.href} target="_blank">{props.children}</a> :
        <TableLink to={props.to} target="_blank">{props.children}</TableLink>
}

export function JobDataTable({ jenkins_job, memory, dash_version, build_number, git_commit, duration, started_at }) {
    return (
        <ETable className="table">
            <tbody>
                <TableRow title="Jenkins Job">
                    <C_Link to={`http://build.dev.btech/job/${jenkins_job}`}>
                        {jenkins_job} (#{build_number})
                    </C_Link>
                </TableRow>
                <TableRow title="Git commit">
                    <C_Link href={`http://git.dev.btech/cgi-bin/cgit.cgi/btech.git/commit/?id=${git_commit}`}>
                        {git_commit}
                    </C_Link>
                </TableRow>
                <TableRow title="Build">
                    <C_Link target="_blank" href={`http://build.dev.btech/job/${jenkins_job}/${build_number}`}>
                        {dash_version}
                    </C_Link>
                </TableRow>
                <TableRow title="Duration">
                    {duration} minutes
                </TableRow>
                <TableRow title="Memory stress">
                    {memory ? memory : 'Not applied'}
                </TableRow>
                <TableRow title="Config">
                    <C_Link to="/public/uploads/xml/">
                        XML
                    </C_Link>
                </TableRow>
                <TableRow title="Started at">
                    {started_at ? started_at : 'N/A'}
                </TableRow>
            </tbody>
        </ETable>
    )
}

export default JobDataTable;