import axios from 'axios'

const client = axios.create({ baseURL: 'http://memtest.dev.btech:3333/api', timeout: 3000 });
const headers = {
    "content-type": "application/json",
    "accept": "application/json",
}
const api = {
    get: (url, options = null) => {
        console.log(`GET request -> ${url}`)
        return new Promise((resolve, reject) => {
            client.get(url, { headers })
                .then(response => resolve(response))
                .catch(e => {
                    if (e.response && e.response.data)
                        reject(e.response.data)
                    console.error(e)
                    reject(e)
                })
        })
    },
    post: (url, options = null, json) => {

    }
}

export default api;