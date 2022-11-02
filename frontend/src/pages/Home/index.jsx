import React, { Suspense } from "react";
import JobsList from "../../features/jobs/JobsList.tsx";
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import './Home.css'
import { atom, useAtom, useSetAtom } from 'jotai'
import API from '../../utils/api'
import CmdModal from "../../features/modal/CmdModal";
import AlertList from "./AlertList";


const Text = styled.p`
    font-size: 12px;
`;

const ProbeStatus = ({ isOffline }) => {
    const StatusLamp = styled.div`
        display: inline-block;
        height: 25px;
        width: 25px;
        border-radius: 50%;
        box-shadow: 2px 1px 6px #46444c;
        margin: 0 10px;
        font-size: 1rem;
        background-color: ${isOffline ? 'red' : 'green'};
`
    return (<div className="card-body mb-1 p-0 text-center">
        <StatusLamp>&nbsp; </StatusLamp> Online
    </div>)
}

const renderErrorMsg = (error) => {
    if (!error) return;
    return <div className="alert alert-warning" role="alert">
        {error.msg}
    </div>
}

const ProbeIp = styled.h6`
    line-height: 0;
    font-size: 24px;
`

const probeData = {
    ip: '10.0.28.140',
    swVersion: '6.1.0-10',
    isOffline: false,
    jenkinsJob: 'CentOS7-based'
}

const activeJobs = atom(async (get) => {
    try {
        const response = await API.get("/api/jobs?limit=10&status=running")
        if (response && response.data) {
            // console.log(response.data)
            return response.data;
        }

    } catch (error) {
        console.error("Failed to fetch", error)
    }

})

const completedJobs = atom(async (get) => {
    try {
        const response = await API.get("/api/jobs?limit=10&status=completed")
        if (response && response.data) {
            // console.log(response.data)
            return response.data;
        }

    } catch (error) {
        console.error("Failed to fetch", error)
    }

})

const failedJobs = atom(async (get) => {
    try {
        const response = await API.get("/api/jobs?limit=10&status=failed")
        if (response && response.data) {
            // console.log(response.data)
            return response.data;
        }

    } catch (error) {
        console.error("Failed to fetch", error)
    }

})

const ActiveJobs = () => {
    const [ jobs ] = useAtom(activeJobs);
    return jobs && jobs.length > 0 ? <JobsList jobs={jobs} /> : <div className="p-3"><h5>Empty</h5></div>;
}

const FailedJobs = () => {
    const [ jobs ] = useAtom(failedJobs);
    return <JobsList jobs={jobs} />;
}

const CompletedJobs = () => {
    const [ jobs ] = useAtom(completedJobs);
    return <JobsList jobs={jobs} />;
}


const VmCard = (props) => {
    return (
        <div className="card bg-dark">

            {props.error && renderErrorMsg(props.error)}

            <div className="desktop vm-card">
                <ProbeIp className="mb-3">
                    10.0.28.141
                </ProbeIp>
                <Text>
                    6.1.0-10
                </Text>
            </div>

            <ProbeStatus props={probeData.isOffline} />


            <div className="card-body text-center">
                <Link to="/settings" className="btn btn-warning btn-sm">Settings</Link>
                <a href="/apidoc" className="btn btn-secondary btn-sm">API doc</a>

                <button type="button" className="btn btn-secondary btn-sm" data-bs-toggle="modal" data-bs-target="#exampleModal">
                    Commands
                </button>
            </div>

            <div className="text-center mb-2">
                Tracking: <a target="_blank" href="http://build.dev.btech/job/">
                    JenkinsJob
                </a>
            </div>
        </div>

    )
}

function Home(props) {
    return (
        <>
            <div className='container-fluid mb-3'>
                <div className='row'>
                    <div className="col-12 col-lg-4 d-flex flex-column justify-content-between mt-2">
                        <VmCard props={props} probeData={probeData} />
                    </div>
                    <div class="col-12 col-lg-6 offset-lg-2 mt-2">
                        <h3>Alerts</h3>
                        <AlertList />
                    </div>
                </div>
            </div>
            <div className='container-fluid my-5'>
                <div className="row">
                    <div className="col-12 col-lg-6">
                        <h3>Active</h3>
                        <Suspense fallback="Loading jobs...">
                            <ActiveJobs />
                        </Suspense>
                        <h3>Completed</h3>
                        <Suspense fallback="Loading jobs...">
                            <CompletedJobs />
                        </Suspense>
                    </div>
                    <div className='col-12 col-lg-6'>
                        <h3>Failed</h3>
                        <Suspense fallback="Loading jobs...">
                            <FailedJobs />
                        </Suspense>
                    </div>

                </div>

            </div>
            <CmdModal probeIp={probeData.ip} />
        </>
    )
}

export default Home;