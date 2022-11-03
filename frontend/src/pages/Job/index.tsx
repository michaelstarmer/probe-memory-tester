import React from "react";
import { atom, useAtom } from 'jotai';
import API from '../../utils/api'
import { useParams, Link } from "react-router-dom";
import "./Job.css"
import StatusHeader from './StatusHeader'
import ProcessesChart from '../../features/chart/ProcessesChart'
import JobLog from '../../features/jobLog'
import Overview from './Overview'

const jobData = atom(async (get) => {
    let { id } = useParams()
    const url = `/api/jobs/${id}`
    const response = await API.get(url)
    if (response && response.data) {
        return response.data;
    }
})

const processesData = atom(async (get) => {
    let { id } = useParams()
    const url = `/api/jobs/${id}/proc-stats`
    const response = await API.get(url)
    if (response && response.data) {
        return response.data;
    }
})


const Job = () => {
    const [job] = useAtom(jobData);
    const [procStats] = useAtom(processesData)

    return (
        <>
            <StatusHeader status={job.status} />
            <Overview job={job} />
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