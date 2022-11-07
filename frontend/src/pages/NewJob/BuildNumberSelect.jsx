import React from "react";
import { useAtom, atom } from "jotai";
import API from '../../utils/api'
import { useEffect } from "react";
import { useState } from "react";
const buildData = atom(async (name) => {
    const url = `/api/jobs/log`;
    const response = await API.get(url)
    console.log({ name })
    if (response && response.data) {
        return response.data
    }
})

export const BuildNumberSelect = (props) => {
    const [ builds, setBuilds ] = useState();
    const [ jobName, setJobName ] = useState(props.jobName);
    useEffect(() => {
        const getBuilds = async (value) => {
            let s = []
            const response = await API.get(`http://build.dev.btech/job/${jobName}/api/json?pretty=true`)
            if (!builds) {
                setBuilds(response.data.builds)
            }
        }
        if (jobName)
            getBuilds(jobName)
    }, [ jobName ])
    if (builds && builds.length > 0) {
        console.log('builds', builds)
        return builds.map(it => <option value={it.number}>{it.number}</option>)
    }
}


export default BuildNumberSelect;