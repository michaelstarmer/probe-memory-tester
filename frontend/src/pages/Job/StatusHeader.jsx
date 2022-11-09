import React from "react";
import styled from "styled-components";

const HeaderWrap = styled.div`
    height: 4rem;
`

export const StatusHeader = ({ status }) => {

    return (
        <HeaderWrap className="text-center my-3">
            {/* <h6>STATUS</h6> */}
            <h1 id="job-status" className={`uppercase color-${status}`}>
                {status}
            </h1>
        </HeaderWrap>


    )
}

export default StatusHeader;