import request from '@/utils/request'

export function fetchVideoList(query) {
  return request({
    url: '/video/all',
    method: 'get',
    params: query
  })
}

export function createVideo(data) {
  return request({
    url: '/video',
    method: 'post',
    data
  })
}

export function updateVideo(data) {
  return request({
    url: '/video',
    method: 'put',
    data
  })
}

export function deleteVideo(id) {
  return request({
    url: `/video?id=${id}`,
    method: 'delete'
  })
}
