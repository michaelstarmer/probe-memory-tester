import React, { Suspense } from "react";
import { atom, useAtom } from 'jotai';
import API from '../../utils/api'
import { useParams, Link } from "react-router-dom";
import "./Job.css"
import StatusHeader from './StatusHeader'
import ProcessesChart from '../../features/chart/ProcessesChart'
import Overview from './Overview'
import LogWindow from './LogWindow'
import JobLog from '../../features/jobLog'

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

const procStatTestData = {
    ana: [
        {
            id: 123,
            name: "ana",
            job_id: 149,
            mem: 0.1,
            cpu: 0.8,
            created_at: "2022-11-01T15:24:05.000+01:00"
        },
        {
            id: 124,
            name: "ana",
            job_id: 149,
            mem: 0.2,
            cpu: 0.7,
            created_at: "2022-11-01T15:25:05.000+01:00"
        }
    ],
    ewe: [
        {
            id: 125,
            name: "ewe",
            job_id: 149,
            mem: 0.1,
            cpu: 0.8,
            created_at: "2022-11-01T15:24:05.000+01:00"
        },
        {
            id: 126,
            name: "ewe",
            job_id: 149,
            mem: 0.2,
            cpu: 0.7,
            created_at: "2022-11-01T15:25:05.000+01:00"
        }
    ]
}

const renderProcessStats = procStats => {
    return Object.keys(procStats).map(it => {
        return <div className="col-12 col-lg-4">
            <Suspense fallback="Loading...">
                <ProcessesChart procName={it} data={procStats[it]} />
            </Suspense>
        </div>
    })
}

const Job = () => {
    const [job] = useAtom(jobData);
    const [procStats] = useAtom(processesData)
    return (
        <>
            <StatusHeader status={job.status} />
            <Overview job={job} />
            <div className="container-fluid py-3 mt-5">
                <div className="row">
                    {renderProcessStats(procStats)}
                </div>
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