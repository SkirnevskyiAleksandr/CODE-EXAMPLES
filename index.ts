//component with request
export const GeneralInfo: FC = () => {
  const [userData, setUserData] = useState<UserData>();

  useEffect(() => {
    requestUser(USER_DATA_URL, setUserData);
  }, []);
    
     return (.....)
 }
    
    
    //component with logic
    import { SetStateAction } from 'react';

import { ACCESS_TOKEN } from 'constants/user';
import { UserData } from 'interfaces/userData';

export const requestUser = async (
  url: string,
  setUserDatas: { (value: SetStateAction<UserData | undefined>): void }
) => {
  const authToken: string | null = sessionStorage.getItem(ACCESS_TOKEN);

  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
      },
      method: 'GET',
    });

    if (res.ok) {
      const data = await res.json();
      setUserDatas(data);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
  }
};
