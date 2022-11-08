import React, { Suspense, useState } from "react";
import JobsList from "../../features/jobs/JobsList.tsx";
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import './Home.css'
import { atom, useAtom, useSetAtom } from 'jotai'
import API from '../../utils/api'
import CmdModal from "../../features/modal/CmdModal";
import AlertList from "./AlertList";
import JobListItem from '../../features/jobs/JobListItem'
import { MDBBtn } from "mdb-react-ui-kit";

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

                <Link to="/settings" noRipple className="btn btn-block btn-warning btn-sm mx-1">Settings</Link>
                <a href="/apidoc" noRipple className="btn btn-block btn-secondary btn-sm mx-1">API doc</a>
                <MDBBtn size="lg" className="btn btn-secondary btn-sm mx-1" noRipple toggleShow={props.toggleShow} onClick={props.toggleShow}>
                    Commands
                </MDBBtn>

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
    const [ basicModal, setBasicModal ] = useState(false)
    const toggleShow = () => setBasicModal(!basicModal)
    return (
        <>
            <div className='container-fluid mb-3'>

            </div>
            <div className='container-fluid my-5'>
                <div className="row">
                    <div className='col-12 col-xl-4 mt-2'>
                        <div className="row">
                            <div className="col-12 col-xl-8 offset-xl-2 mb-5">
                                <VmCard props={props} toggleShow={toggleShow} probeData={probeData} />

                            </div>
                            <div className="col-12 col-xl-12 d-flex justify-content-center">

                                <AlertList />
                            </div>
                            <div className="my-5"></div>
                        </div>
                    </div>
                    <div className="col-12 col-xl-6 offset-xl-1">

                        <Suspense fallback="Loading jobs...">
                            <CompletedJobs />
                        </Suspense>
                        <h3 className="mt-3">Failed</h3>
                        <Suspense fallback="Loading jobs...">
                            <FailedJobs />
                        </Suspense>
                    </div>


                </div>

            </div>
            <CmdModal onClick={toggleShow} toggleShow={toggleShow} setShow={setBasicModal} basicModal={basicModal} probeIp={probeData.ip} />
        </>
    )
}

export default Home;