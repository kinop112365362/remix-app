import React from "react"
import { useLocation, useParams } from "react-router-dom"
import ReadReportRenderer from "./ReadReportRenderer"

const FormRenderer: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()

  if (id) {
    if (location.pathname.includes("/view")) {
      return <ReadReportRenderer formId={id} />
    }
  } else {
    return <div>Loading...</div>
  }
}

export default FormRenderer
