import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/backend/login',
    method: 'post',
    data
  })
}

export function getLoginInfo(token) {
  return request({
    url: '/backend/login/user_info',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/backend/login/out',
    method: 'post'
  })
}
