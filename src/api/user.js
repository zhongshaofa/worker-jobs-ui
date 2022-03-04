import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/backend/user/list',
    method: 'get',
    params
  })
}

export function add(data) {
  return request({
    url: '/backend/user/add',
    method: 'post',
    data
  })
}

export function edit(data) {
  return request({
    url: '/backend/user/edit',
    method: 'post',
    data
  })
}

export function detail(params) {
  return request({
    url: '/backend/user/detail',
    method: 'get',
    params
  })
}

export function toDelete(data) {
  return request({
    url: '/backend/user/delete',
    method: 'post',
    data
  })
}

export function switchStatus(data) {
  return request({
    url: '/backend/user/switch_status',
    method: 'post',
    data
  })
}

export function resetPassword(data) {
  return request({
    url: '/backend/user/reset_password',
    method: 'post',
    data
  })
}
