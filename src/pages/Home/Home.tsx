import { getMeService } from '@/services/user.services';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  const onLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };
  useEffect(() => {
    const getMe = async () => {
      try {
        const response = await getMeService();
        console.log(response);
      } catch (error) {
        console.error(error);
      }
    };
    getMe();
  }, []);
  return (
    <>
      <h1 className='text-3xl font-bold underline'>Home page</h1>
      <button onClick={onLogout}>Logout</button>
    </>
  );
}

export default Home;
