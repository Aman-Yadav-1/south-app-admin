'use client'

import {Bar, BarChart, ResponsiveContainer, XAxis, YAxis} from 'recharts'

interface OverviewProps {
    data: any[]
}

const Overview = async ({data}: OverviewProps) => {
    return(
        <ResponsiveContainer width={"100%"} height={350}>
            <BarChart data={data}>
                <XAxis
                dataKey="name"
                stroke="#555"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                />

                <YAxis stroke='#555' fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                    <Bar dataKey={"total"} fill="#84B74E" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    )
}

export default Overview