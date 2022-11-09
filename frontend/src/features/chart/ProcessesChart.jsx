import React from "react";
import moment from "moment";
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip } from "recharts";
const formatAxis = tickItem => moment(tickItem).format('LT')
const labelFormatAxis = tickItem => moment(tickItem).format('llll')

export function ProcessesChart({ procName, data }) {
    return (<div style={{ width: '100%' }}>
        <div className="text-center">{procName}</div>
        <ResponsiveContainer width="100%" height={100}>
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
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                <XAxis dataKey="created_at" tickFormatter={formatAxis} fontSize="11px" />
                <YAxis fontSize="11px"/>
                <Tooltip labelFormatter={labelFormatAxis} />
                
                {/* <Area type="monotone" dataKey="name" stroke="#8884d8" fill="#8884d8" /> */}
                <Area type="monotone" dataKey="mem" stroke="#987F67" fill="#987F67" stackId="1" />
                <Area type="monotone" dataKey="cpu" stroke="#678098" fill="#678098" stackId="1" />

            </AreaChart>

            

        </ResponsiveContainer>

    </div>

    )
}

export default ProcessesChart;