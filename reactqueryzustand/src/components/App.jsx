import React, { useState } from "react"
// import { useQueryApi, useMutationApi } from '../lib/useFetchApi'
// import { getAccount } from "../apis"
import Demo from "./Demo"
import Snackbar from "./snackbar"

const App = () => {
  // const [index, setIndex] = useState(0)
  // const { data, isLoading, isError, isFetched } = useQueryApi({ queryKey: ['getAccount', index], queryFn: () => getAccount() })
  // const mutation = useMutationApi({ mutationFn: getAccount })

  return (
    <div>
      {/* <div onClick={()=>setIndex(index + 1)}>Hello React</div> */}
      <Demo />
      <Snackbar />
    </div>
  )  
}

export default App;

