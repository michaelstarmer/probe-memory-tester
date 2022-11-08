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

export const CmdModal = (props, { probeIp }) => {

    return (
        <>
            <MDBModal show={props.basicModal} setShow={props.setShow} tabindex='-1'>
                <MDBModalDialog>
                    <ModalContent>
                        <ModalHeader>
                            <MDBModalTitle>Modal title</MDBModalTitle>
                            <MDBBtn className="btn-close" color='none' onClick={props.onClick}></MDBBtn>
                        </ModalHeader>
                        <ModalBody>
                            <div class="modal-body">
                                <p>This is a list of relevant bash commands for interacting with ESXi or the VM host itself.</p>
                                <div class="mb-3">
                                    <h6>SSH probe:</h6>
                                    <div class="snippet">
                                        <span>root@</span><span>{probeIp}</span>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <h6>ESXi get all VMs</h6>
                                    <div class="snippet">
                                        <span>sshpass -p ldap2retro ssh 10.0.28.202 vim-cmd vmsvc/getallvms</span>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <h6>ESXi power on</h6>
                                    <div class="snippet">
                                        <span>sshpass -p ldap2retro ssh 10.0.28.202 vim-cmd vmsvc/power.on 29</span>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <h6>ESXi reboot VM</h6>
                                    <div class="snippet">
                                        <span>sshpass -p ldap2retro ssh 10.0.28.202 vim-cmd vmsvc/power.reset 29</span>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <h6>ESXi get all snapshots for VM</h6>
                                    <div class="snippet">
                                        <span>sshpass -p ldap2retro ssh 10.0.28.202 vim-cmd vmsvc/snapshot.get 29</span>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <h6>ESXi revert to default snapshot</h6>
                                    <div class="snippet">
                                        <span>
                                            sshpass -p ldap2retro ssh 10.0.28.202 vim-cmd vmsvc/snapshot.revert 29 6 true
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <ModalFooter>
                                <MDBBtn onClick={() => props.toggleShow()} noRipple class="btn btn-secondary" data-bs-dismiss="modal">Close</MDBBtn>
                            </ModalFooter>
                        </ModalBody>
                    </ModalContent>
                </MDBModalDialog>
            </MDBModal>
        </>
    )
    return (
        <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">Commands</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>This is a list of relevant bash commands for interacting with ESXi or the VM host itself.</p>
                        <div class="mb-3">
                            <h6>SSH probe:</h6>
                            <div class="snippet">
                                <span>root@</span><span>{probeIp}</span>
                            </div>
                        </div>
                        <div class="mb-3">
                            <h6>ESXi get all VMs</h6>
                            <div class="snippet">
                                <span>sshpass -p ldap2retro ssh 10.0.28.202 vim-cmd vmsvc/getallvms</span>
                            </div>
                        </div>
                        <div class="mb-3">
                            <h6>ESXi power on</h6>
                            <div class="snippet">
                                <span>sshpass -p ldap2retro ssh 10.0.28.202 vim-cmd vmsvc/power.on 29</span>
                            </div>
                        </div>
                        <div class="mb-3">
                            <h6>ESXi reboot VM</h6>
                            <div class="snippet">
                                <span>sshpass -p ldap2retro ssh 10.0.28.202 vim-cmd vmsvc/power.reset 29</span>
                            </div>
                        </div>
                        <div class="mb-3">
                            <h6>ESXi get all snapshots for VM</h6>
                            <div class="snippet">
                                <span>sshpass -p ldap2retro ssh 10.0.28.202 vim-cmd vmsvc/snapshot.get 29</span>
                            </div>
                        </div>
                        <div class="mb-3">
                            <h6>ESXi revert to default snapshot</h6>
                            <div class="snippet">
                                <span>
                                    sshpass -p ldap2retro ssh 10.0.28.202 vim-cmd vmsvc/snapshot.revert 29 6 true
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>)

}

export default CmdModal;