import axios from 'axios'

const API_HOST = process.env.API_HOST ? process.env.API_HOST : 'http://localhost:3333'
const client = axios.create({ baseURL: API_HOST, timeout: 3000 });
const headers = {
    "content-type": "application/json",
    "accept": "application/json",
}

export class API {
    constructor(isProd = false) {
        this.isProd = isProd;
        this.client = axios.create({ baseURL: API_HOST, timeout: 3000 })
        this.headers = {
            "content-type": "application/json",
            "accept": "application/json",
        }
    }

    static async get(url, options = null) {
        console.log(`GET request -> ${url}`)
        const response = await client.get(url, { headers })
        if (response && response.data) {
            console.log('Get 200:', response.data)
            return response
        }
    }

    static async post(url, data, options = null) {
        console.log(`GET request -> ${url}`)
        const response = await client.post(url, data)
        if (response && response.data) {
            console.log('Get 200:', response.data)
            return response
        }
    }
}

export default API;