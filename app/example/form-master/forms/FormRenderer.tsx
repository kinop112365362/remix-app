import React from "react"
import { useLocation, useParams } from "react-router-dom"
import CreateFormRenderer from "./CreateFormRenderer"
import EditFormRenderer from "./EditFormRenderer"
import ReadFormRenderer from "./ReadFormRenderer"

const FormRenderer: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()

  if (id) {
    if (location.pathname.includes("/edit")) {
      return <EditFormRenderer formId={id} />
    } else {
      return <ReadFormRenderer formId={id} />
    }
  } else {
    return <CreateFormRenderer />
  }
}

export default FormRenderer
