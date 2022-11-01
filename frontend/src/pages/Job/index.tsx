import React from "react";
import styled from 'styled-components';
import { atom, useAtom } from 'jotai';
import api from '../../utils/api'
import { useParams, Link } from "react-router-dom";
import "./Job.css"
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
const TableLink = styled(Link)`
    text-decoration: none;
`
const Form = styled.form`
    display: inline;
`

const Table = ({ jenkins_job, build_number, duration, started_at }) => {
    return (
        <ETable className="table">
            <tbody>
                <tr>
                    <th>Jenkins job</th>
                    <td><TableLink target="_blank"
                        to="http://build.dev.btech/job/{{job.jenkinsJob}}">{jenkins_job}</TableLink>
                    </td>
                </tr>
                <tr>
                    <th>Git commit</th>
                    <td>
                        N/A
                    </td>
                </tr>
                <tr>
                    <th>Build no.</th>
                    <td>
                        <TableLink target="_blank"
                            to={`http://build.dev.btech/job/${jenkins_job}/${build_number}`}>{build_number}</TableLink>
                    </td>
                </tr>
                <tr>
                    <th>Duration</th>
                    <td>
                        <span id="minutes-remaining">{duration} minutes</span>
                    </td>
                </tr>
                <tr>
                    <th>Memory stress</th>
                    <td>Not applied</td>
                </tr>
                <tr>
                    <th>Config</th>
                    <td>
                        <TableLink target="_blank" href="/public/uploads/xml/">XML</TableLink>
                    </td>
                </tr>
                <tr>
                    <th>Created at</th>
                    <td>{started_at}</td>
                </tr>
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
            </Hero>

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