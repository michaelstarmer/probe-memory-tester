import React, { useState } from "react";
import {
    MDBBtn,
    MDBModal,
    MDBModalDialog,
    MDBModalContent,
    MDBModalHeader,
    MDBModalTitle,
    MDBModalBody,
    MDBModalFooter,
} from 'mdb-react-ui-kit'
import { ModalBody } from "react-bootstrap";
import styled from "styled-components";

const ModalContent = styled(MDBModalContent)`
    background-color: rgb(24, 26, 27);
    border-color: rgba(140, 138, 115, .2);
    outline-color: initial;
`

const ModalHeader = styled(MDBModalHeader)`
    border-bottom-color: rgb(56, 61, 63);

`

const ModalFooter = styled(MDBModalFooter)`
    border-top-color: rgb(56, 61, 63);
`

const Select = styled.select`
    color: rgb(209, 205, 199);
    background-color: rgb(24, 26, 27);
    border-color: rgb(60, 65, 68);
`

const Input = styled.input`
    color: rgb(209, 205, 199);
    background-color: rgb(24, 26, 27);
    border-color: rgb(60, 65, 68);
    &:active,
    &:focus {
        color: rgb(209, 205, 199);
        background-color: rgb(24, 26, 27);
    }
`

const renderError = (error) => {
    return <div className="row justify-content-md-center">
        <div className="col-12">
            <div className="alert alert-danger" role="alert">
                {error}
            </div>
        </div>
    </div>
}
const renderForm = (props) => {
    return (<div className="container mb-5">

        {props.error && renderError(props.error)}


        <div className="row justify-content-md-center">
            <div className="col-12">
                <form action="/host/edit" method="POST">
                    <div className="form-outline mb-4">
                        <label className="form-label">Probe IP</label>
                        <Input type="text" className="form-control" name="probeIp" value={props.probeIp || ''} />
                    </div>

                    <h5 className="mt-3">Automatic testing</h5>
                    <p className="text-muted">Select build for automatic testing, and how long each test will run.</p>
                    <div className="form-group mt-3">
                        <label className="form-label">Jenkins job</label>
                        <Select className="form-select" name="jenkinsJob" >

                            <option value="{jenkinsJob}" selected>jenkinsJob</option>



                            <option value="{job}">job</option>


                        </Select>
                    </div>

                    <div className="form-group mt-3">
                        <label className="form-label">Test duration (minutes)</label>
                        <Input type="number" className="form-control" name="duration" value="{{duration || 30}}" />
                    </div>

                    <h5 className="mt-3">ESXi</h5>
                    <div className="row">
                        <div className="col">
                            <label className="form-label">VM id</label>
                            <Input type="number" className="form-control" name="esxi_vmid" value="{esxi_vmid}" />
                        </div>
                        <div className="col">
                            <label className="form-label">Base snapshot ID</label>
                            <Input type="number" className="form-control" name="esxi_snapshot_id" value='sd' />
                        </div>
                    </div>

                </form>

            </div>
        </div>
    </div>
    )
}

export const SettingsModal = (props, { probeIp }) => {

    return (
        <>
            <MDBModal show={props.settingsModal} setShow={props.setShow} tabindex='-1'>
                <MDBModalDialog>
                    <ModalContent>
                        <ModalHeader>
                            <MDBModalTitle>Settings</MDBModalTitle>
                            <MDBBtn classNameName="btn-close" color='none' onClick={props.onClick}></MDBBtn>
                        </ModalHeader>
                        <ModalBody>
                            {renderForm(props)}
                            <ModalFooter>
                                <MDBBtn onClick={() => props.toggleShowSettings()} noRipple className="btn btn-secondary" data-bs-dismiss="modal">Close</MDBBtn>
                                <MDBBtn onClick={() => props.toggleShowSettings()} noRipple className="btn btn-success" data-bs-dismiss="modal">Save settings</MDBBtn>
                            </ModalFooter>
                        </ModalBody>
                    </ModalContent>
                </MDBModalDialog>
            </MDBModal>
        </>
    )
}

export default SettingsModal;