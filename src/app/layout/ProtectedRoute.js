import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Login from '../components/Login';
import Loader from '../components/Loader';


function ProtectedRoute({ children }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const minLoaderTime = 1200; 
    const startTime = Date.now();

    const handleSessionChange = () => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = minLoaderTime - elapsedTime;

      if (remainingTime > 0) {
        setTimeout(() => {
          setShowLoader(false);
        }, remainingTime);
      } else {
        setShowLoader(false);
      }

      if (!session && status !== "loading") {
        router.push('/login');
      }
    };

    if (status !== "loading") {
      handleSessionChange();
    }

    return () => clearTimeout(handleSessionChange);
  }, [session, status, router]);

  if (showLoader) {
    return <Loader />; 
  }

  if (!session) {
    return <Login />; 
  }

  return session ? children : null; 
}

export default ProtectedRoute;
