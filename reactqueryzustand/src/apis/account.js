import api from '../lib/api'

export const getAccount = async () => {
  const response = await api({ method: "GET", cmd: "api/Me" })
  return response
}