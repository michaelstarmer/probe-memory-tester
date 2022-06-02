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
    Log.info('[ GVM SEC ] Security audit already handled for this job')
    exit()
    
task_id = 'b6c05466-6a92-4505-bc33-2a9ee3016b3d'

if securityAudit['status'] == 'waiting':
    try:
        report_id = gvm.startTask(task_id)
        Log.success(f'Started task. Report id: {report_id}')
        status = gvm.taskStatus(task_id)
        updateAudit = api.updateSecurityAudit(currentJob['id'], {
            'gvmReportId': report_id,
            'progress': 20,
            'inUse': 1,
            'status': 'running',
            'cveLow': 54,
            'cveMedium': 12,
            'cveHigh': 2
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
        print(report['report'])
        
        
        payload = {
            'progress': report['report']['report']['task']['progress'],
            'inUse': report['report']['in_use'],
            'vulns': report['report']['report']['vulns']['count'],
            
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

