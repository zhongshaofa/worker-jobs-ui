import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/backend/task_schedule/list',
    method: 'get',
    params
  })
}

export function detail(params) {
  return request({
    url: '/backend/task_schedule/detail',
    method: 'get',
    params
  })
}

export function getLogList(params) {
  return request({
    url: '/backend/task_schedule/log_list',
    method: 'get',
    params
  })
}

export function getLogRead(params) {
  return request({
    url: '/backend/task_schedule/log_read',
    method: 'get',
    params
  })
}

