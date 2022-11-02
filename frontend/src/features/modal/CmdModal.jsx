import React from "react";
import Button from "react-bootstrap/Button";
import Modal from 'react-bootstrap/Modal'

export const CmdModal = ({ probeIp }) => {
    return (
        <Modal.Dialog>
            <Modal.Header closeButton>Title</Modal.Header>
            <Modal.Body>
                <p>Body</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary">Close</Button>
                <Button variant="primary">Save changes</Button>
            </Modal.Footer>
        </Modal.Dialog>
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