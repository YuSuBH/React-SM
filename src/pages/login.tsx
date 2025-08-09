import { auth, provider } from "../config/config";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export const Login = () => {
  const navigate = useNavigate();

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, provider);
    console.log(result);
    navigate("/");
  };

  return (
    <div className="loginPage">
      <div className="loginCard">
        <p>Sign in with google to continue</p>
        <button onClick={signInWithGoogle}>Sign in with google</button>
      </div>
    </div>
  );
};
