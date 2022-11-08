import React, { Suspense, useState, useEffect, useRef } from "react";
import { atom, useAtom } from 'jotai';
import { useResetAtom, atomWithReset } from 'jotai/utils'
import API from '../../utils/api'
import { useParams, Link } from "react-router-dom";
import "./Job.css"
import StatusHeader from './StatusHeader'
import ProcessesChart from '../../features/chart/ProcessesChart'
import styled from 'styled-components'
import LogWindow from './LogWindow'
import JobLog from '../../features/jobLog'
import { MDBBtn } from "mdb-react-ui-kit";
import MemoryChart from '../../features/chart/MemoryChart'
import JobDataTable from './JobDataTable'
import CmdModal from "../../features/modal/CmdModal";

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


const renderProcessStats = procStats => {
    return Object.keys(procStats).map(it => {
        return <div className="col-12 col-lg-4">
            <Suspense fallback="Loading...">
                <ProcessesChart procName={it} data={procStats[it]} />
            </Suspense>
        </div>
    })
}

const stopJobRequest = async (id) => {

    const response = await API.get(`/api/jobs/${id}/stop`);
    if (response && response.status == 200) {
        console.log('Job deleted successfully:', response);
        return response.data
    }
}

const Div = styled.div`
    background: rgba(150, 150, 150, .1);
`



const Job = (props) => {
    const [job] = useAtom(jobData);
    const { id } = useParams()
    const [procStats] = useAtom(processesData)
    const [basicModal, setBasicModal] = useState(false)
    // const [data, setData] = useRef({id: null, status: null, remaining: null})
    const [jobStatus, setJobStatus] = useState(null)
    const [jobLog, setJobLog] = useState([])
    const [isUpdated, setIsUpdated] = useState(true)


    const toggleShow = () => setBasicModal(!basicModal)
    const handleClick = () => {
        console.log('Stopping...')
        // setData(null)
        job(stopJobRequest(id))

    }

    useEffect(() => {
        const getJobData = async (value) => {

            const response = await API.get(`/api/jobs/${id}`)
            setJobStatus(response.data.status)
            setJobLog(response.data.log)


        }
        const interval = setInterval(() => {
            setIsUpdated(false)
            getJobData(id)
            setIsUpdated(true)
        }, 2000)
        return () => clearInterval(interval)
    }, [id])

    return (
        <>
            <StatusHeader status={jobStatus} />
            <Div className="container-fluid container-dark">
                <div className="container py-5">
                    <div className="row">
                        <div className="col-md-12 col-xl-5 mb-3 d-flex flex-column justify-content-center">

                            <JobDataTable {...job} />

                        </div>
                        <div id="chart" className="col-12 col-xl-6 offset-xl-1">
                            <MemoryChart data={job.systemStats} />
                        </div>
                        <div className="row my-3">
                            <div className="col-12">
                                <MDBBtn size="lg" className="btn btn-secondary btn-sm mx-1" noRipple onClick={toggleShow}>
                                    Commands
                                </MDBBtn>
                                <CmdModal onClick={toggleShow} toggleShow={toggleShow} setShow={setBasicModal} basicModal={basicModal} probeIp={'10.0.28.141'} />
                                {
                                    ['initializing', 'running'].includes(job.status)
                                    && <button type="button" onClick={handleClick} id="btn-stop-job" className="btn btn-danger btn-sm">
                                        Stop test
                                    </button>
                                }

                            </div>
                        </div>
                    </div>
                </div>

            </Div>
            <div className="container-fluid py-3 mt-5">
                <div className="row">
                    {renderProcessStats(procStats)}
                </div>

            </div>

            <JobLog />
            <div className="container-fluid py-3 mt-5" >
                <div className="row">
                    <div className="col-12 col-lg-6 mb-5 d-flex flex-column justify-content-center log-wrap">
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