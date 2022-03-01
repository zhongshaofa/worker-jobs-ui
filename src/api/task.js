import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/backend/task/list',
    method: 'get',
    params
  })
}

export function add(data) {
  return request({
    url: '/backend/task/add',
    method: 'post',
    data
  })
}

export function edit(data) {
  return request({
    url: '/backend/task/edit',
    method: 'post',
    data
  })
}

export function detail(params) {
  return request({
    url: '/backend/task/detail',
    method: 'get',
    params
  })
}

export function toDelete(data) {
  return request({
    url: '/backend/task/delete',
    method: 'post',
    data
  })
}

export function switchStatus(data) {
  return request({
    url: '/backend/task/switch_status',
    method: 'post',
    data
  })
}
