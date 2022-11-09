import React, { PureComponent } from "react";
import moment from 'moment'
// import { LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts'
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart } from 'recharts'
const formatAxis = tickItem => moment(tickItem).format('LT')
const labelFormatAxis = tickItem => moment(tickItem).format('llll')

export const MemoryChart = ({ data }) => {

    console.log(moment().locale())
    return (<div style={{ width: '100%' }}>
        <h6>Memory%</h6>
        <ResponsiveContainer width="100%" height={100}>
            <AreaChart
                width={300}
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
                <CartesianGrid strokeDasharray="2 2" strokeOpacity={.15} />
                <XAxis dataKey="timestamp" tickFormatter={formatAxis} />
                <YAxis type="number" domain={[ 0, 100 ]} />
                {/* <Legend labelFormatter={labelFormatAxis} /> */}
                <Tooltip labelFormatter={labelFormatAxis} />
                <Area type="monotone" dataKey="mem" stroke="#987F67" fill="#987F67" />

            </AreaChart>

        </ResponsiveContainer>
        <h6>CPU%</h6>
        <ResponsiveContainer width="100%" height={100}>
            <AreaChart
                width={300}
                height={100}
                data={data}
                syncId="graph-cpu"
                margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={.15} />
                <XAxis dataKey="timestamp" tickFormatter={formatAxis} />
                <YAxis type="number" />
                {/* <Legend labelFormatter={labelFormatAxis} /> */}
                <Tooltip labelFormatter={labelFormatAxis} />
                <Area type="monotone" dataKey="cpu" stroke="#bdc3c7" fill="#bdc3c7" />

            </AreaChart>
        </ResponsiveContainer>
    </div>)
}

export default MemoryChart;