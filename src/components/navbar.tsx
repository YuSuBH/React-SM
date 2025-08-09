import { Link } from "react-router-dom";
import { auth } from "../config/config";
import { useAuthState } from "react-firebase-hooks/auth";
import { signOut } from "firebase/auth";

export const Navbar = () => {
  const [user] = useAuthState(auth);

  const logOut = async () => {
    await signOut(auth);
  };

  return (
    <div className="navbar">
      <div className="navRoutes">
        <Link to="/"> Home </Link>
        <Link to="/login"> Login </Link>
      </div>

      <div className="navProfile">
        {user && (
          <>
            <p> {user?.displayName}</p>
            <img src={user?.photoURL || ""} width="20" height="20" />
            <button onClick={logOut}>Log out</button>
          </>
        )}
      </div>
    </div>
  );
};
