import React, { PureComponent } from "react";
import moment from 'moment'
// import { LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
const formatAxis = tickItem => moment(tickItem).format('LTS')
const labelFormatAxis = tickItem => moment(tickItem).format('llll')

export const MemoryChart = ({data}) => {
    return (<ResponsiveContainer width="100%">
        <AreaChart
         width={800}
         height={400}
         data={data}
         margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
         }}
         >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" tickFormatter={formatAxis} />
            <YAxis type="number" domain={[0, 100]} />
            <Tooltip labelFormatter={labelFormatAxis} />
            <Area type="monotone" dataKey="mem" stroke="#8884d8" fill="#8884d8" />
        </AreaChart>
    </ResponsiveContainer>)
    // return <LineChart width={600} height={100} data={data}>
    //     <Line type="monotone" dataKey="mem" stroke="#8884d8" />
    //     <CartesianGrid stroke="#ccc" />
    //     <XAxis dataKey="timestamp" />
    //     <YAxis />
    // </LineChart>
}

export default MemoryChart;