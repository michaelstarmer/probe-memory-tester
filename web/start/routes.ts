
import Route from '@ioc:Adonis/Core/Route'

Route.get('apidoc', async ({ view }) => view.render('api-doc'))

Route.get('/', 'AppController.index').as('home')
Route.get('/api/probe-config', 'AppController.get_probe_config')
Route.get('/api/jobs', 'ApiController.all_jobs')
Route.get('/api/jobs/next', 'ApiController.get_next_job')
Route.get('/api/jobs/active', 'ApiController.get_running_job')
Route.post('/api/jobs/create', 'ApiController.create_job')
Route.get('/api/jobs/last', 'ApiController.last_job')
Route.get('/api/search-job/:jenkinsJob/buildNumber/:buildNumber/', 'ApiController.find_identical_jobs')
Route.get('/api/jobs/:id', 'ApiController.get_job_by_id')
Route.get('/api/jobs/:id/stop', 'ApiController.stop_job')
Route.get('/api/jobs/:id/status/:status', 'ApiController.set_job_status')
Route.get('/api/jobs/:id/start', 'ApiController.start_job_by_id')
Route.post('/api/jobs/:id/log', 'ApiController.create_job_log')
Route.get('/api/jobs/:id/log', 'ApiController.get_job_log')
Route.get('/api/jobs/:jobId/security-audit/status/:status', 'ApiController.set_security_audit_status')
Route.post('/api/jobs/:jobId/security-audit', 'ApiController.update_security_audit')

Route.post('/api/stats', 'SystemStatController.create')
Route.get('/api/stats/job/:jobId', 'SystemStatController.stats_by_job_id')
Route.post('/api/stats/job/:jobId', 'SystemStatController.create_by_job')
Route.post('/api/stats/btech/:jobId', 'BtechProcController.create')

/* Deprecated routes */
Route.post('/api/queue', 'ApiController.create_job')
Route.get('/api/queue/next', 'ApiController.next_job')
Route.get('/api/queue/active', 'ApiController.get_running_job')

Route.get('/api/xml', 'JobsController.get_all_xml')
Route.get('/uploads', 'FilesController.upload_view')
Route.post('/upload', 'FilesController.upload_file')
Route.get('/sessionflash', 'FilesController.session_flash')

Route.get('/host/edit', 'AppController.edit_host').as('edit.host')
Route.get('/settings', 'AppController.edit_host')
Route.post('/host/edit', 'AppController.update_host')

Route.get('jobs', 'JobsController.view_all_jobs')
Route.get('jobs/new', 'JobsController.new_job_view')
Route.get('jobs/:id', 'JobsController.view_job').as('view_job')
Route.get('jobs/:id/stop', 'JobsController.stop_job')
Route.post('/jobs/createCustom', 'JobsController.save_custom_job')