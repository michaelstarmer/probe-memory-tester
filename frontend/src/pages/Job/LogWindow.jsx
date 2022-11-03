import React from "react";
import styled from "styled-components";
import JobLog from '../../features/jobLog'

export const LogWindow = ({jobId}) => {
    <div className="container-fluid py-3 mt-5" >
        <div className="row">
            <div className="col-12 col-lg-6 mb-5 d-flex flex-column justify-content-center log-wrap">
                <JobLog id={jobId} />
            </div>
        </div>
    </div>
}

export default LogWindow;