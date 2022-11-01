import React, { Suspense } from "react";
import JobsList from "../../features/jobs/JobsList.tsx";
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import './Home.css'
import { atom, useAtom, useSetAtom } from 'jotai'
import api from '../../utils/api'


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

const jobs = [
    {
        id: 1,
        jenkinsJob: 'CentOS7-based',
        dashVersion: '6.1.0_10_33',
        status: 'running',
        remaining: 30,
        duration: 30,
        createdAt: '2022-10-28 10:00:00'
    },
    {
        id: 2,
        jenkinsJob: 'CentOS7-based',
        dashVersion: '6.1.0_10_34',
        status: 'completed',
        remaining: 0,
        duration: 30,
        createdAt: '2022-10-28 12:00:00'
    },
]

const probeData = {
    ip: '10.0.28.140',
    swVersion: '6.1.0-10',
    isOffline: false,
    jenkinsJob: 'CentOS7-based'
}

const jobsData = atom(async (get) => {
    try {
        const response = await api.get("http://localhost:3333/api/jobs")
        if (response && response.data) {
            console.log(response.data)
            return response.data;
        }

    } catch (error) {
        console.error("Failed to fetch", error)
    }

})

const Jobs = () => {
    const [ jobs ] = useAtom(jobsData);
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
        <div className=''>
            <div className='container mb-3'>
                <div className='row'>
                    <div className="col-12 col-lg-4 d-flex flex-column justify-content-between mt-2">
                        <VmCard props={props} probeData={probeData} />
                    </div>
                </div>
            </div>
            <Suspense fallback="Loading jobs...">
                <Jobs />
            </Suspense>
        </div>
    )
}

export default Home;