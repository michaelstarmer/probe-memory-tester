import json
from btech_gvm import GvmSSH
from webapi import WebApi
from logger import Log

api = WebApi('http://localhost:3333')
gvm = GvmSSH(hostname='10.0.28.89', username='kali', password='kali')
currentJob = api.getCurrentJob()
if not currentJob:
    Log.info('[ GVM SEC ] No active jobs.')
    exit()

securityAudit = currentJob['securityAudit']
if not securityAudit:
    Log.info('[ GVM SEC ] Security audit not selected for this job.')
    exit()

if securityAudit['status'] == 'completed':
    if not securityAudit['pdf']:
        Log.info('Downloading PDF report')
        try:
            report_id = securityAudit['gvm_report_id']
            pdfPath = f'/app/public/report-{report_id}.pdf'
            dl = gvm.downloadReportPDF(report_id, pdfPath)
            updateAudit = api.updateSecurityAudit(
                currentJob['id'], {'pdf': f'report-{report_id}.pdf'})

            if dl:
                Log.success('Report downloaded updated!')
            else:
                Log.error('Report failed to download!')

        except Exception as e:
            Log.error('Status error!')
            print(e)
    Log.info('[ GVM SEC ] Security audit already handled for this job')
    exit()
    
# task_id = 'b6c05466-6a92-4505-bc33-2a9ee3016b3d' # "test triggered scan"
task_id = 'b9a9290e-cde2-4023-ad0f-290944828868' # "test triggered w/o ssh auth"

if securityAudit['status'] == 'waiting':
    try:
        report_id = gvm.startTask(task_id)
        Log.success(f'Started task. Report id: {report_id}')
        status = gvm.taskStatus(task_id)
        updateAudit = api.updateSecurityAudit(currentJob['id'], {
            'gvmReportId': report_id,
            'progress': 0,
            'inUse': 1,
            'status': 'running',
        })
        if updateAudit:
            Log.success('Audit updated!')
        else:
            Log.error('Audit could not be updated!')

    except Exception as e:
        Log.error('Failed to start scan task!')
        print(e)
        exit()

if securityAudit['status'] == 'running':
    try:
        
        status = gvm.taskStatus(task_id)
        report_id = securityAudit['gvm_report_id']
        report = gvm.taskReport(report_id)
        # print(json.dumps(report, indent=2))
        # print(json.dumps(status, indent=2))
        
        
        payload = {
            'progress': report['report']['report']['task']['progress'],
            'inUse': report['report']['in_use'],
            'vulnCountLow': report['report']['report']['result_count']['info']['filtered'],
            'vulnCountMedium': report['report']['report']['result_count']['warning']['filtered'],
            'vulnCountHigh': report['report']['report']['result_count']['hole']['filtered'],
            
        }
        print(payload)
        if report['report']['report']['scan_run_status'] == 'Done':
            payload['status'] = 'completed'
        
        updateAudit = api.updateSecurityAudit(currentJob['id'], payload)
        if updateAudit:
            Log.success('Audit updated!')
        else:
            Log.error('Audit could not be updated!')
        
    except Exception as e:
        Log.error('Status error!')
        print(e)

if securityAudit['status'] == 'completed':
    if not securityAudit['pdf']:
        Log.info('Downloading PDF report')
        try:
            status = gvm.taskStatus(task_id)
            report_id = securityAudit['gvm_report_id']
            pdfPath = f'/app/public/report-{report_id}.pdf'
            dl = gvm.downloadReportPDF(report_id, pdfPath)
            updateAudit = api.updateSecurityAudit(currentJob['id'], { 'pdf': pdfPath })
        
            if dl:
                Log.success('Report downloaded updated!')
            else:
                Log.error('Report failed to download!')

        except Exception as e:
            Log.error('Status error!')
            print(e)
