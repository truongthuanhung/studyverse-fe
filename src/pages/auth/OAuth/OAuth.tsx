import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function OAuth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const access_token = searchParams.get('access_token');
    const refresh_token = searchParams.get('refresh_token');
    if (!access_token || !refresh_token) {
      navigate('/login');
    }
    localStorage.setItem('access_token', access_token as string);
    localStorage.setItem('refresh_token', refresh_token as string);
    navigate('/');
  }, [searchParams, navigate]);
  return <></>;
}

export default OAuth;
