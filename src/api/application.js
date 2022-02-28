import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/backend/application/list',
    method: 'get',
    params
  })
}

export function add(params) {
  return request({
    url: '/backend/application/add',
    method: 'post',
    params
  })
}

export function edit(params) {
  return request({
    url: '/backend/application/edit',
    method: 'post',
    params
  })
}

export function detail(params) {
  return request({
    url: '/backend/application/detail',
    method: 'get',
    params
  })
}

export function toDelete(params) {
  return request({
    url: '/backend/application/delete',
    method: 'post',
    params
  })
}

export function switchStatus(params) {
  return request({
    url: '/backend/application/switch_status',
    method: 'post',
    params
  })
}

export function clientAuth(params) {
  return request({
    url: '/backend/application/client/auth',
    method: 'post',
    params
  })
}

export function getClientList(params) {
  return request({
    url: '/backend/application/client/list',
    method: 'get',
    params
  })
}