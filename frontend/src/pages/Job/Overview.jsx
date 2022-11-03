import React from "react";
import styled from "styled-components";
import MemoryChart from '../../features/chart/MemoryChart'
import JobDataTable from './JobDataTable'


const Div = styled.div`
    background: rgba(150, 150, 150, .1);
`
const Form = styled.form`
    display: inline;
`
export const Overview = ({job}) => {
    return (
        <Div className="container-fluid container-dark">
                <div className="container py-5">
                    <div className="row">
                        <div className="col-md-12 col-lg-4 mb-3 d-flex flex-column justify-content-center">
                            <div className="row">
                                <div className="col-12">
                                    <JobDataTable {...job} />
                                </div>
                            </div>
                            <div className="row my-3">
                                <div className="col-12">
                                    <button type="button" className="btn btn-secondary" data-bs-toggle="modal"
                                        data-bs-target="#exampleModal">
                                        Commands
                                    </button>
                                    <Form id="frm-stop-job" action="/jobs/{{ job.id }}/stop" method="get"
                                        className="">
                                        <button type="submit" id="btn-stop-job" className="btn btn-danger">
                                            Stop test
                                        </button>
                                    </Form>
                                </div>
                            </div>
                        </div>
                        <div id="chart" className="col-12 col-lg-6 offset-lg-2">
                            <MemoryChart data={job.systemStats} />
                        </div>
                    </div>
                </div>
            </Div>
    )
}

export default Overview