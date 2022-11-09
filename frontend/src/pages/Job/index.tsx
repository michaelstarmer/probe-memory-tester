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
        return <div className="col-12 col-lg-6">
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
    background: rgba(35, 35, 36, 1);
`

const ViewContainer = styled.div`
    
    
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
    const [ logMinimized, setLogMinimized ] = useState(false);
    const btechProcs = [
    'ana',       'capture',
    'database',  'dbana',
    'esyslog',   'etr',
    'ewe',       'flashserver',
    'microbitr', 'ott',
    'psi',       'relay',
    'sap',       'storage',
    'vidana' ]


    const toggleShow = () => setBasicModal(!basicModal)
    const handleClick = () => {
        console.log('Stopping...')
        job(stopJobRequest(id))

    }
    const toggleLog = () => {
        console.log('toggle log', logMinimized)
        setLogMinimized(!logMinimized)
    }

    useEffect(() => {
        const getJobData = async (value) => {
            const response = await API.get(`/api/jobs/${id}`)
            setJobStatus(response.data.status)
            setJobLog(response.data.log)
        }
        const getProcStats = async (value) => {
            await API.get(`/api/jobs/${id}/proc-stats?limit=15`)
            
        }
        const interval = setInterval(() => {
            // procStats(null)
            setIsUpdated(false)
            getJobData(id)
            setIsUpdated(true)
            // procStats(processesData)
        }, 2000)
        return () => clearInterval(interval)
    }, [id])

    return (
        <ViewContainer className={`job-view ${logMinimized ? 'slide-in' : null}`}>
            <Div className="container-fluid py-3 container-dark">
            
                <StatusHeader status={jobStatus} />
                
                    <div className="row">
                        <div className="col-md-12 col-xl-4 offset-xl-1 mb-3 d-flex flex-column justify-content-center">

                            <JobDataTable {...job} />
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
                        <div id="chart" className="col-12 col-xl-5 offset-xl-1">
                            <MemoryChart data={job.systemStats} />
                        </div>
                        <div className="row my-3">
                            
                        </div>
                    </div>


            </Div>
            <div className="container py-3 mt-5">
                <div className="row">
                    {renderProcessStats(procStats)}
                </div>

            </div>

            <JobLog props={props} logMinimized={logMinimized} toggleLog={toggleLog} />
            <div className="container-fluid py-3 mt-5" >
                <div className="row">
                    <div className="col-12 col-lg-6 mb-5 d-flex flex-column justify-content-center log-wrap">
                    </div>
                </div>
            </div>
        </ViewContainer>
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