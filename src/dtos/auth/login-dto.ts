type LoginDto = {
  email: string;
  password: string;

  imei: string;
  mac?: string;
  ip: string;
  device?: string;
  token?: string;
};

export default LoginDto;
