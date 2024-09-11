// Component Imports
import AuthIllustrationWrapper from '@/components/AuthIllustrationWrapper';
import { Box } from '@mui/material';
import Login from '@views/Login';

export const metadata = {
  title: 'Login',
  description: 'Login to your account'
};

const LoginPage = () => {
  return (
    <div className='flex min-h-[100vh] justify-center p-10 items-center'>
      <AuthIllustrationWrapper>
        <Login />
      </AuthIllustrationWrapper>
    </div>
  );
};

export default LoginPage;
