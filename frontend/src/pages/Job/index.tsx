import React from "react";
import styled from 'styled-components';
import { atom, useAtom } from 'jotai';
import api from '../../utils/api'
import { useParams, Link } from "react-router-dom";
import "./Job.css"
import MemoryChart from '../../features/chart/MemoryChart'
import JobLog from '../../features/jobLog'

const jobData = atom(async (get) => {
    let { id } = useParams()
    const url = `http://localhost:3333/api/jobs/${id}`
    const response = await api.get(url)
    if (response && response.data) {
        console.log(response.data)
        return response.data;
    }
})

const Hero = styled.div`
    background: rgba(150, 150, 150, .1);
`
const ETable = styled.table`
    color: rgb(209, 205, 199);
    border-color: rgb(56, 61, 63);
`

const Form = styled.form`
    display: inline;
`

const TableLink = styled(Link)`
    text-decoration: none;
`

const C_Link = (props, { to }) => {
    return props.href ?
        <a href={props.href} target="_blank">{props.children}</a> :
        <TableLink to={props.to} target="_blank">{props.children}</TableLink>
}
const C_Link_External = ({ to, text, ...props }) => {
    return (
        <a href={to} target="_blank">{text}</a>
    )
}
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

const Table = ({ jenkins_job, memory, dash_version, build_number, git_commit, duration, started_at }) => {
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

const StatusHeader = ({ status }) => {

    return (
        <div className="container my-3">
            <div className="row">
                <div className="col-12 text-center">
                    <h6>STATUS</h6>
                    <h1 id="job-status" className={`uppercase color-${status}`}>
                        {status}
                    </h1>
                </div>
            </div>
        </div>

    )
}

const Job = () => {
    const [job] = useAtom(jobData);
    console.log(job)
    return (
        <>
            <StatusHeader status={job.status} />
            <Hero className="container-fluid container-dark">
                <div className="container py-5">
                    <div className="row">
                        <div className="col-md-12 col-lg-4 mb-3 d-flex flex-column justify-content-center">
                            <div className="row">
                                <div className="col-12">
                                    <Table {...job} />
                                </div>
                            </div>
                            <div className="row my-3">
                                <div className="col-12">
                                    <button type="button" className="btn btn-secondary" data-bs-toggle="modal"
                                        data-bs-target="#exampleModal">
                                        Commands
                                    </button>
                                    <Form id="frm-stop-job" action="/jobs/{{ job.id }}/stop" method="get"
                                        className="">
                                        <button type="submit" id="btn-stop-job" className="btn btn-danger">
                                            Stop test
                                        </button>
                                    </Form>
                                </div>
                            </div>
                        </div>
                        <div id="chart" className="col-12 col-lg-6 offset-lg-2">
                            <MemoryChart data={job.systemStats} />
                        </div>
                    </div>
                </div>
            </Hero>
            <div className="container-fluid py-3 mt-5" >
                <div className="container">
                    <div className="row">
                        <div className="col-12 col-lg-6 mb-5 d-flex flex-column justify-content-center log-wrap">
                            <JobLog />
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}

export function JobPage(props) {
    let { id } = useParams();
    return (
        <div className="container-fluid">
            <Job />
        </div>


    )
}

export default JobPage;