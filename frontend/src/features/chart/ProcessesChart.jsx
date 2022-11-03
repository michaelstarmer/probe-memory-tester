import React from "react";
import moment from "moment";
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip } from "recharts";
const formatAxis = tickItem => moment(tickItem).format('LT')
const labelFormatAxis = tickItem => moment(tickItem).format('llll')

export function ProcessesChart({ data }) {
    console.log('pc DATA:', data)
    return <></>
    return (<div style={{ width: '100%' }}>
        <ResponsiveContainer width="100%" height={200}>
            <AreaChart
                width={500}
                height={100}
                data={data}
                syncId="graph-mem"
                margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip labelFormatter={labelFormatAxis} />
                {/* <Area type="monotone" dataKey="name" stroke="#8884d8" fill="#8884d8" /> */}
                <Area type="monotone" dataKey="mem" stroke="#fa6900" fill="#fa6900" stackId="1" />
                <Area type="monotone" dataKey="cpu" stroke="#fa1000" fill="#fa1000" stackId="1" />

            </AreaChart>

        </ResponsiveContainer>
    </div>

    )
}

export default ProcessesChart;