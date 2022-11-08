import axios from 'axios'

const headers = {
    "content-type": "application/json",
    "accept": "application/json",
}

let API_HOST = 'localhost:3333'

export class API {
    constructor(isProd = false) {
        this.isProd = isProd;
        this.client = axios.create({ baseURL: process.env.REACT_API_HOST ? process.env.REACT_API_HOST : 'http://localhost:3333', timeout: 3000 })
        this.headers = {
            "content-type": "application/json",
            "accept": "application/json",
        }
    }

    static async get(url, options = null) {
        let API_HOST = 'localhost:3333'
        if (process.env.NODE_ENV === 'production') {
            API_HOST = 'web'
        }
        const client = axios.create({ baseURL: API_HOST, timeout: 3000 });
        console.log(`GET request -> ${url}`)
        console.log('process.env.NODE_ENV', process.env.NODE_ENV)
        const response = await client.get(url, { headers })
        if (response && response.data) {
            console.log('Get 200:', response.data)
            return response
        }
    }

    static async post(url, data, options = null) {
        let API_HOST = 'localhost:3333'
        if (process.env.NODE_ENV === 'production') {
            API_HOST = 'web'
        }
        const client = axios.create({ baseURL: API_HOST, timeout: 3000 });
        console.log(`GET request -> ${url}`)
        const response = await client.post(url, data)
        if (response && response.data) {
            console.log('Get 200:', response.data)
            return response
        }
    }
}

export default API;