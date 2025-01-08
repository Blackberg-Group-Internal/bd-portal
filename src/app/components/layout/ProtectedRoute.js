import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Login from '../Login';
import Loader from '../Loader';


function ProtectedRoute({ children }) {
  const router = useRouter();
  const pathname = usePathname(); 
  const { data: session, status } = useSession();
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const minLoaderTime = 0; 
    const startTime = Date.now();

    const handleSessionChange = () => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = minLoaderTime - elapsedTime;

      // if (remainingTime > 0) {
      //   setTimeout(() => {
           setShowLoader(false);
      //   }, remainingTime);
      // } else {
      //   setShowLoader(false);
      // }
      

      // const isDevPath = pathname.includes('dev');
      // const allowedUserId= "9gTustM-c-zg6f2vbizsNArFIuiaSJYGRIzORcYCLSY"; 

      // if (isDevPath && session?.user?.id !== allowedUserId) {
      //   router.push('/404');
      // }

      if (!session && status !== "loading" && pathname !== '/login') {
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

  return session || pathname === '/login' ? children : null;
}

export default ProtectedRoute;
