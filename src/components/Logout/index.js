const Logout = ({ setUser }) => {

  const logout = () => setUser({})
  return <div>
    <button onClick={logout}>Logout</button>
  </div>
}

export default Logout