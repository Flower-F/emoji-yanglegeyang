const Hi = () => {
  const navigate = useNavigate()
  const params = useParams()

  return (
    <div>
      <div i-carbon-pedestrian text-4xl inline-block />
      <p>
      Hi, { params.name }
      </p>
      <p text-sm op50>
        <em>Dynamic route!</em>
      </p>

      <div>
        <button className="btn" m-3 text-sm mt-8 onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
    </div>
  )
}
export default Hi
