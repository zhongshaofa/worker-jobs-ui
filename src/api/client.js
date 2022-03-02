import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/backend/client/list',
    method: 'get',
    params
  })
}

export function add(data) {
  return request({
    url: '/backend/client/add',
    method: 'post',
    data
  })
}

export function edit(data) {
  return request({
    url: '/backend/client/edit',
    method: 'post',
    data
  })
}

export function detail(params) {
  return request({
    url: '/backend/client/detail',
    method: 'get',
    params
  })
}

export function toDelete(data) {
  return request({
    url: '/backend/client/delete',
    method: 'post',
    data
  })
}

export function switchStatus(data) {
  return request({
    url: '/backend/client/switch_status',
    method: 'post',
    data
  })
}
