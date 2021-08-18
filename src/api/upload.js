import request from '@/utils/request'

export function upload(data, query) {
  const formData = new FormData()
  for (const key in data) {
    formData.append(key, data[key])
  }
  return request({
    url: '/upload',
    method: 'post',
    data: formData,
    params: query
  })
}
