import React, { Suspense, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { JobListItem } from './JobListItem'
import { atom, useAtom, useSetAtom } from 'jotai'


interface JobProps {
    id: number,
    jenkins_job: string,
    dash_version: string,
    status: string,
    started_at: string,
    remaining: number,
    duration: number,
}


const renderList = (jobs: [Object: JobProps]) => {
    return jobs.map(it => <JobListItem id={it.id} jenkins_job={it.jenkins_job} status={it.status} dash_version={it.dash_version} remaining={it.remaining} duration={it.duration} started_at={it.started_at} />)

}
export function JobsList(props: { jobs: [Object: JobProps] }) {
    let jobs: [Object: JobProps] = props.jobs;
    console.log(props.jobs)
    return (
        <div className="container-fluid my-5">
            <div className="row">
                <div className="col-md-12 col-xl-6">

                    {renderList(props.jobs)}
                </div>
            </div>
        </div>
    )
}
export default JobsList;