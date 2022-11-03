import React from "react";
import styled from "styled-components";

export const StatusHeader = ({ status }) => {

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

export default StatusHeader;