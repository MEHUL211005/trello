import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import axiosInstance from "../api/axios";
import { setCredentials } from "../redux/authSlice";

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Get new access token using refresh token cookie
        const refreshResponse = await axiosInstance.post(
          "/auth/refresh"
        );

        const { accessToken } = refreshResponse.data;


        // Get latest user data from database
        const profileResponse = await axiosInstance.get(
          "/auth/profile",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );


        // Store user + access token in redux
        dispatch(
          setCredentials({
            user: profileResponse.data.user,
            token: accessToken,
          })
        );


      } catch (error) {

        // 401 means user is not logged in
        // This is normal on first visit
        if (error.response?.status !== 401) {
          console.error(
            "Auth restore error:",
            error
          );
        }

      } finally {

        setLoading(false);

      }
    };


    restoreSession();

  }, [dispatch]);


  // Wait until session checking finishes
  if (loading) {
    return null;
  }


  return children;
};


export default AuthInitializer;