import React from "react";
import './JobListItem.css'
import { Link } from 'react-router-dom'

interface BadgeProps {
    status: string,
}

const Badge = (props: BadgeProps) => {
    const { status } = props;
    if (status == 'completed')
        return <span className="badge bg-success rounded-pill">Done</span>
    else if (status == 'running')
        return <span className="badge bg-success rounded-pill">Running</span>
    else if (status == 'initializing')
        return <span className="badge bg-warning rounded-pill">Initializing</span>
    else if (status == 'failed')
        return <span className="badge bg-success rounded-pill">Failed</span>
    else
        return <span className="badge bg-success rounded-pill">Done</span>
}

type Job = {
    id: number,
    jenkins_job: string,
    dash_version: string,
    status: string,
    duration: number,
    started_at: string,
    remaining: number
}

export function JobListItem(job: Job) {
    return (
        <Link to={`/jobs/${job.id}`} className="job-card my-2 px-3 py-4 {{ job.procStatAlerts.length > 0 ? 'border-warning' : '' }}">
            <div className="row">
                <div className="col-1 px-1">
                    <Badge status={job.status} />
                </div>
                <div className="col">
                    <span className="job-card--title">{job.dash_version}</span>
                </div>
                <div className="col-4">
                    <span> {job.jenkins_job}</span>
                </div>

                <div className="col">
                    <span>

                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor"
                            className="bi bi-clock" viewBox="0 0 16 16">
                            <path
                                d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z" />
                            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z" />
                        </svg>

                        {job.remaining && ` ${job.remaining} min. left`}

                        {!job.remaining && ` ${job.duration} min.`}
                    </span>
                </div>
                <div className="col">
                    {job.started_at}
                </div>
            </div>
        </Link>

    )
}

export default JobListItem;