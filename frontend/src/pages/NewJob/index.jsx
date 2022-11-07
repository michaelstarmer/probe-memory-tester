import React from "react";
import styled from "styled-components";
import './NewJob.css'
import { useForm } from 'react-hook-form'
import { atom, useAtom } from 'jotai';
import { useState, useEffect } from "react";
import BuildNumberSelect from "./BuildNumberSelect";
import API from '../../utils/api'

const postNewJob = (data) => {
    console.log('Post new job')
}

const jenkinsJobs = atom(async (get) => {
    const { data } = await API.get('http://build.dev.btech/api/json?pretty=true')
    let jobs = [];
    if (data && data.jobs) {
        data.jobs.map(it => {
            if (it.name.search(/CentOS\d-based/i) === 0)
                jobs.push(it.name)
        })
    }
    return jobs;
})



const renderSelectJob = (jobs) => {
    return jobs.map(it => <option value={it}>{it}</option>)
}

export function NewJobPage(props) {
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const onSubmit = data => postNewJob(data);
    let [ jobs ] = useAtom(jenkinsJobs);
    const [ builds, setBuilds ] = useState([]);
    const [ jobName, setJobName ] = useState();

    useEffect(() => {
        const getBuilds = async (value) => {
            const response = await API.get(`http://build.dev.btech/job/${jobName}/api/json?pretty=true`)
            if (builds.length < 1) {
                setBuilds(response.data.builds)
            }
        }
        if (jobName)
            getBuilds(jobName)
    }, [ jobName ])


    return (
        <div className="row justify-content-md-center">
            <div className="col-12 col-lg-8">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="row">
                        <div className="col-12 col-lg-8">
                            <div className="form-group mt-3">
                                <label>Jenkins job</label>
                                <select {...register("jenkinsJob")} onChange={e => setJobName(e.target.value)} className="form-select">
                                    <option disabled selected>Select job</option>
                                    {jobs && renderSelectJob(jobs)}
                                </select>
                            </div>
                        </div>
                        <div class="col-12 col-lg-4">
                            <div class="form-group mt-3">
                                <label for="selectBuildNumber">Build no.</label>
                                <select {...register('buildNumbers')} id="selectBuildNumber" class="form-select" required>
                                    <option disabled selected>Build number</option>
                                    {
                                        builds.map(it => <option value={it.number}>{it.number}</option>)
                                    }

                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div class="col-12 col-lg-6">
                            <div class="form-group mt-3">
                                <label>Test duration</label>
                                <select name="duration" class="form-select">
                                    <option value="30" selected>30 minutes</option>
                                    <option value="60">1 hour</option>
                                    <option value="120">2 hours</option>
                                    <option value="460">6 hours</option>
                                    <option value="720">12 hours</option>
                                    <option value="1440">24 hours</option>
                                    <option value="2880">48 hours</option>
                                    <option value="4320">72 hours</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <input defaultValue="test" {...register("example")} />
            <input {...register("exampleRequired", { required: true })} />

            {errors.exampleRequired && <span>This field is required</span>}
            <input type="submit" />
        </form>
    )

    return (
        <div class="container my-5">

            <div class="row justify-content-md-center">
                <div class="col-12 col-md-6">
                    <div class="alert alert-danger" role="alert">
                        error
                    </div>

                </div>
            </div>

            <div class="row justify-content-md-center">
                <div class="col-12 col-lg-8">
                    <h1>Create new test</h1>
                    <p>Manually create a new test based on available jobs from Jenkins. The latest successful build will
                        be fetched automatically.</p>
                    <form action="/jobs/createCustom" method="POST">

                        <div class="row">
                            <div class="col-12 col-lg-8">
                                <div class="form-group mt-3">
                                    <label for="">Jenkins job</label>
                                    <select name="jenkinsJob" id="jenkinsJob" class="form-select" required>
                                        <option disabled selected>Select</option>


                                        <option value="\{[A-Za-z|\.]*\}">job</option>


                                    </select>
                                </div>
                            </div>
                            <div class="col-12 col-lg-4">
                                <div class="form-group mt-3">
                                    <label for="selectBuildNumber">Build no.</label>
                                    <select name="buildNumber" id="selectBuildNumber" class="form-select" required>
                                        <option disabled selected>Build number</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-12 col-lg-6">
                                <div class="form-group mt-3">
                                    <label for="">Increase RAM usage(GB)</label>
                                    <input type="number" class="form-control" name="memory" value="0" />
                                </div>
                            </div>
                            <div class="col-12 col-lg-6">
                                <div class="form-group mt-3">
                                    <label>Test duration</label>
                                    <select name="duration" class="form-select">
                                        <option value="30" selected>30 minutes</option>
                                        <option value="60">1 hour</option>
                                        <option value="120">2 hours</option>
                                        <option value="460">6 hours</option>
                                        <option value="720">12 hours</option>
                                        <option value="1440">24 hours</option>
                                        <option value="2880">48 hours</option>
                                        <option value="4320">72 hours</option>
                                    </select>
                                </div>
                            </div>


                        </div>

                        <div class="row">
                            <div class="col-12 mt-3">
                                <h5>XML configuration</h5>
                                <p class="text-muted">
                                    Custom config files can also be <a href="/uploads">uploaded here</a>.
                                </p>
                            </div>
                            <div class="col-12 col-lg-7 mb-3">
                                <div class="form-group">
                                    <label>Select a file</label>
                                    <select name="xmlFileId" id="xmlFileId" size="5" class="form-select"
                                        required>


                                        <option value="file.id" data-filename="file.filenam"
                                            data-description="file.descriptio" data-uploadedat="file.uploadedA">
                                            file.originalFilename
                                        </option>


                                    </select>
                                </div>
                            </div>
                            <div id="metadata" class="col-12 col-lg-5 form-group hidden">
                                <h5>About XML</h5>
                            </div>
                        </div>

                        <div class="form-group my-3">
                            <div class="form-check">
                                <label class="form-check-label">
                                    <input type="checkbox" class="form-check-input" name="securityAudit" checked />
                                    Perform vulnerability scan with report
                                </label>
                            </div>
                        </div>

                        <button type="submit" class="btn btn-primary btn-block mt-3">Save</button>
                    </form>

                </div>


            </div>
        </div>
    )
}

export default NewJobPage;