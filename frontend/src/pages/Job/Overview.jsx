import React, { useState } from "react";
import styled from "styled-components";
import MemoryChart from '../../features/chart/MemoryChart'
import JobDataTable from './JobDataTable'
import CmdModal from "../../features/modal/CmdModal";
import API from '../../utils/api'
import { atom, useAtom } from "jotai";
import { useParams } from "react-router-dom";

const Div = styled.div`
    background: rgba(150, 150, 150, .1);
`
const Form = styled.form`
    display: inline;
`

const stopJobRequest = async (id) => {

    const response = await API.get(`/api/jobs/${id}/stop`);
    if (response && response.status == 200) {
        console.log('Job deleted successfully:', response);
        return "completed"
    }
}
export const Overview = ({ job, ...props }) => {
    const [ basicModal, setBasicModal ] = useState(false)
    const { id } = useParams()
    const toggleShow = () => setBasicModal(!basicModal)
    const [ status, setStatus ] = useState(job.status)

    const handleClick = () => {
        console.log('Stopping...')
        setStatus(stopJobRequest(id))
    }

    return (
        <Div className="container-fluid container-dark">
            <div className="container py-5">
                <div className="row">
                    <div className="col-md-12 col-xl-5 mb-3 d-flex flex-column justify-content-center">

                        <JobDataTable {...job} />

                    </div>
                    <div id="chart" className="col-12 col-xl-6 offset-xl-1">
                        <MemoryChart data={job.systemStats} />
                    </div>
                </div>
            </div>
            <CmdModal onClick={toggleShow} toggleShow={toggleShow} setShow={setBasicModal} basicModal={basicModal} probeIp={'10.0.28.141'} />

        </Div>
    )
}

export default Overview