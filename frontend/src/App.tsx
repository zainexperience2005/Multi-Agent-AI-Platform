import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "./redux/store";
import { getCurrentUser } from "./features/auth/api/getCurrentUser";
import { setUserdata } from "./redux/userSlice";
import { Loader2 } from "lucide-react";
import { Login } from "./pages/Login"
import { Home } from "./pages/Home"

export const App = () => {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      console.log({user});
      
      dispatch(setUserdata(user));
      setLoading(false);
    };
    fetchUser();
  }, []);

  const user = useSelector((state: RootState) => state.user.userData)

  if (loading) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-black overflow-hidden font-sans select-none">
        {/* Background Decorative Gradients */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
          <p className="text-neutral-400 text-sm font-medium tracking-wide animate-pulse">
            Loading your workspace...
          </p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <Login />
    )
  }
  
  return (
    <Home />
  )
}
