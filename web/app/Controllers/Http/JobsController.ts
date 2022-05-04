const axios = require('axios')

export default class JobsController {

    public async new_job_view({ view }) {
        const jobsUrl = 'http://build.dev.btech/api/json?pretty=true'
        const jobs: string[] = []

        const { data } = await axios.get(jobsUrl);

        data.jobs.map(it => {
            if (it.name.search(/CentOS\d\-based/i) === 0) {
                jobs.push(it.name)
            }
        })
        console.log(jobs)
        return view.render('new-job', { jobs })
    }

    // public async save_job({ request, response }) {
    //     // Create a new job based on the form values.
    // }


}
