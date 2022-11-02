import React from "react";
import styled from 'styled-components';
import { atom, useAtom } from 'jotai';
import API from '../../utils/api'
import { useParams, Link } from "react-router-dom";
import "./Job.css"
import MemoryChart from '../../features/chart/MemoryChart'
import ProcessesChart from '../../features/chart/ProcessesChart'
import JobLog from '../../features/jobLog'
import JobDataTable from './JobDataTable'

const jobData = atom(async (get) => {
    let { id } = useParams()
    const url = `/api/jobs/${id}`
    const response = await API.get(url)
    if (response && response.data) {
        console.log(response.data)
        return response.data;
    }
})

const processesData = atom(async (get) => {
    let { id } = useParams()
    const url = `/api/jobs/${id}/proc-stats`
    const response = await API.get(url)
    if (response && response.data) {
        console.log('procStats:', response.data)
        return response.data;
    }
})

const Hero = styled.div`
    background: rgba(150, 150, 150, .1);
`


const Form = styled.form`
    display: inline;
`



const C_Link_External = ({ to, text, ...props }) => {
    return (
        <a href={to} target="_blank">{text}</a>
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
    const [procStats] = useAtom(processesData)

    return (
        <>
            <StatusHeader status={job.status} />
            <Hero className="container-fluid container-dark">
                <div className="container py-5">
                    <div className="row">
                        <div className="col-md-12 col-lg-4 mb-3 d-flex flex-column justify-content-center">
                            <div className="row">
                                <div className="col-12">
                                    <JobDataTable {...job} />
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

            <div className="container-fluid py-3 mt-5">
                <ProcessesChart data={procStats} />
            </div>

            <div className="container-fluid py-3 mt-5" >
                <div className="row">
                    <div className="col-12 col-lg-6 mb-5 d-flex flex-column justify-content-center log-wrap">
                        <JobLog />
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