import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/backend/task_schedule/log_list',
    method: 'get',
    params
  })
}

export function readConsoleLog(params) {
  return request({
    url: '/backend/task_schedule/log_read',
    method: 'get',
    params
  })
}

