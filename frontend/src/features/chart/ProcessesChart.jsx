import React from "react";
import moment from "moment";
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip } from "recharts";
const formatAxis = tickItem => moment(tickItem).format('LT')
const labelFormatAxis = tickItem => moment(tickItem).format('llll')

export function ProcessesChart({ procName, data }) {
    console.log('pc DATA:', data)
    // return <>
    //     <h5>Process Chart (Size: {data.length})</h5>
    // </>
    return (<div style={{ width: '100%' }}>
        <h6>{procName}</h6>
        <ResponsiveContainer width="100%" height={200}>
            <AreaChart
                key={data}
                width={500}
                height={100}
                data={data}
                syncId={`${procName}-mem`}
                margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="created_at" tickFormatter={formatAxis} />
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