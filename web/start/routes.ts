/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer''
|
*/

import Route from '@ioc:Adonis/Core/Route'

// Route.get('/', async ({ view }) => {
//   return view.render('welcome')
// })

Route.get('/', 'AppController.index').as('home')

Route.get('/api/probe-config', 'AppController.get_probe_config')

Route.get('/api/jobs', 'ApiController.all_jobs')
Route.get('/api/jobs/:id', 'ApiController.get_job_by_id')
Route.post('/api/jobs/create', 'ApiController.create_job')

Route.post('/api/jobs/:id/log', 'ApiController.create_job_log')

Route.post('/api/queue', 'ApiController.create_job')
Route.get('/api/queue/next', 'ApiController.next_job')
Route.get('/api/queue/active', 'ApiController.running_job')
Route.get('/api/jobs/last', 'ApiController.last_job')

Route.post('/api/stats', 'SystemStatController.create')
Route.get('/api/stats/job/:jobId', 'SystemStatController.stats_by_job_id')
Route.post('/api/stats/job/:jobId', 'SystemStatController.create_by_job')

Route.post('/api/stats/btech/:jobId', 'BtechProcController.create')

Route.get('/api/xml', 'JobsController.get_all_xml')
Route.post('/api/upload', 'ApiController.upload_file')

Route.get('apidoc', async ({ view }) => view.render('api-doc'))

Route.get('/host/edit', 'AppController.edit_host').as('edit.host')
Route.post('/host/edit', 'AppController.update_host')

Route.get('jobs/new', 'JobsController.new_job_view')
Route.get('jobs/:id', 'JobsController.view_job')
Route.post('/jobs/createCustom', 'JobsController.save_custom_job')