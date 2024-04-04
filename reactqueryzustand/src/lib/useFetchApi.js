import { useQuery, useMutation } from "@tanstack/react-query"
import useSnackbarStore from '../store/snackbar'
import { useEffect } from 'react'

export default function useQueryApi(data) {
  const { setSnackMsg } = useSnackbarStore((state) => state)
  const query = useQuery({
    ...data,
  })

  useEffect(() => {
    if (!query.isLoading) {
      !query?.data?.ok && setSnackMsg({ message: "API 發生未知錯誤" })
      const status = (query?.data?.body?.status !== null && query?.data?.body?.status !== undefined) ? query?.data?.body?.status : null
      status !== null && setSnackMsg({ message: query?.data?.body?.message })
      !!query?.isError && setSnackMsg({ message: "API 發生未知錯誤" })
    }
  }, [query.isLoading, query.isError, query.isFetching])

  return query
}

function useMutationApi(data) {
  const { setSnackMsg } = useSnackbarStore((state) => state)
  const args = useMutation({
    onSuccess: (data, variables, context) => {
      const status = (query?.data?.body?.status !== null && query?.data?.body?.status !== undefined) ? query?.data?.body?.status : null
      status !== null && setSnackMsg({ message: query?.data?.body?.message })
      data.ok == false && setSnackMsg({ message: "API發生未知錯誤" })
    },
    onError: (error, variables, context) => {
      setSnackMsg({ message: "API發生未知錯誤" })
    },
    ...data,
  });

  return args
}

export {
  useQueryApi,
  useMutationApi,
}